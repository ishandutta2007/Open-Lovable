import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { OpenLovableWrite } from "./OpenLovableWrite";
import { OpenLovableRename } from "./OpenLovableRename";
import { OpenLovableDelete } from "./OpenLovableDelete";
import { OpenLovableAddDependency } from "./OpenLovableAddDependency";
import { OpenLovableExecuteSql } from "./OpenLovableExecuteSql";
import { OpenLovableLogs } from "./OpenLovableLogs";
import { OpenLovableGrep } from "./OpenLovableGrep";
import { OpenLovableAddIntegration } from "./OpenLovableAddIntegration";
import { OpenLovableEdit } from "./OpenLovableEdit";
import { OpenLovableSearchReplace } from "./OpenLovableSearchReplace";
import { OpenLovableCodebaseContext } from "./OpenLovableCodebaseContext";
import { OpenLovableThink } from "./OpenLovableThink";
import { CodeHighlight } from "./CodeHighlight";
import { useAtomValue } from "jotai";
import { isStreamingByIdAtom, selectedChatIdAtom } from "@/atoms/chatAtoms";
import { CustomTagState } from "./stateTypes";
import { OpenLovableOutput } from "./OpenLovableOutput";
import { OpenLovableProblemSummary } from "./OpenLovableProblemSummary";
import { ipc } from "@/ipc/types";
import { OpenLovableMcpToolCall } from "./OpenLovableMcpToolCall";
import { OpenLovableMcpToolResult } from "./OpenLovableMcpToolResult";
import { OpenLovableWebSearchResult } from "./OpenLovableWebSearchResult";
import { OpenLovableWebSearch } from "./OpenLovableWebSearch";
import { OpenLovableWebCrawl } from "./OpenLovableWebCrawl";
import { OpenLovableCodeSearchResult } from "./OpenLovableCodeSearchResult";
import { OpenLovableCodeSearch } from "./OpenLovableCodeSearch";
import { OpenLovableRead } from "./OpenLovableRead";
import { OpenLovableListFiles } from "./OpenLovableListFiles";
import { OpenLovableDatabaseSchema } from "./OpenLovableDatabaseSchema";
import { OpenLovableSupabaseTableSchema } from "./OpenLovableSupabaseTableSchema";
import { OpenLovableSupabaseProjectInfo } from "./OpenLovableSupabaseProjectInfo";
import { OpenLovableStatus } from "./OpenLovableStatus";
import { OpenLovableCompaction } from "./OpenLovableCompaction";
import { OpenLovableWritePlan } from "./OpenLovableWritePlan";
import { OpenLovableExitPlan } from "./OpenLovableExitPlan";
import { mapActionToButton } from "./ChatInput";
import { SuggestedAction } from "@/lib/schemas";
import { FixAllErrorsButton } from "./FixAllErrorsButton";
import { unescapeXmlAttr, unescapeXmlContent } from "../../../shared/xmlEscape";

const DYAD_CUSTOM_TAGS = [
  "openlovable-write",
  "openlovable-rename",
  "openlovable-delete",
  "openlovable-add-dependency",
  "openlovable-execute-sql",
  "openlovable-read-logs",
  "openlovable-add-integration",
  "openlovable-output",
  "openlovable-problem-report",
  "openlovable-chat-summary",
  "openlovable-edit",
  "openlovable-grep",
  "openlovable-search-replace",
  "openlovable-codebase-context",
  "openlovable-web-search-result",
  "openlovable-web-search",
  "openlovable-web-crawl",
  "openlovable-code-search-result",
  "openlovable-code-search",
  "openlovable-read",
  "think",
  "openlovable-command",
  "openlovable-mcp-tool-call",
  "openlovable-mcp-tool-result",
  "openlovable-list-files",
  "openlovable-database-schema",
  "openlovable-supabase-table-schema",
  "openlovable-supabase-project-info",
  "openlovable-status",
  "openlovable-compaction",
  // Plan mode tags
  "openlovable-write-plan",
  "openlovable-exit-plan",
];

interface OpenLovableMarkdownParserProps {
  content: string;
}

type CustomTagInfo = {
  tag: string;
  attributes: Record<string, string>;
  content: string;
  fullMatch: string;
  inProgress?: boolean;
};

type ContentPiece =
  | { type: "markdown"; content: string }
  | { type: "custom-tag"; tagInfo: CustomTagInfo };

const customLink = ({
  node: _node,
  ...props
}: {
  node?: any;
  [key: string]: any;
}) => (
  <a
    {...props}
    onClick={(e) => {
      const url = props.href;
      if (url) {
        e.preventDefault();
        ipc.system.openExternalUrl(url);
      }
    }}
  />
);

export const VanillaMarkdownParser = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeHighlight,
        a: customLink,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

/**
 * Custom component to parse markdown content with Open-Lovable-specific tags
 */
export const OpenLovableMarkdownParser: React.FC<OpenLovableMarkdownParserProps> = ({
  content,
}) => {
  const chatId = useAtomValue(selectedChatIdAtom);
  const isStreaming = useAtomValue(isStreamingByIdAtom).get(chatId!) ?? false;
  // Extract content pieces (markdown and custom tags)
  const contentPieces = useMemo(() => {
    return parseCustomTags(content);
  }, [content]);

  // Extract error messages and track positions
  const { errorMessages, lastErrorIndex, errorCount } = useMemo(() => {
    const errors: string[] = [];
    let lastIndex = -1;
    let count = 0;

    contentPieces.forEach((piece, index) => {
      if (
        piece.type === "custom-tag" &&
        piece.tagInfo.tag === "openlovable-output" &&
        piece.tagInfo.attributes.type === "error"
      ) {
        const errorMessage = piece.tagInfo.attributes.message;
        if (errorMessage?.trim()) {
          errors.push(errorMessage.trim());
          count++;
          lastIndex = index;
        }
      }
    });

    return {
      errorMessages: errors,
      lastErrorIndex: lastIndex,
      errorCount: count,
    };
  }, [contentPieces]);

  return (
    <>
      {contentPieces.map((piece, index) => (
        <React.Fragment key={index}>
          {piece.type === "markdown"
            ? piece.content && (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: CodeHighlight,
                    a: customLink,
                  }}
                >
                  {piece.content}
                </ReactMarkdown>
              )
            : renderCustomTag(piece.tagInfo, { isStreaming })}
          {index === lastErrorIndex &&
            errorCount > 1 &&
            !isStreaming &&
            chatId && (
              <div className="mt-3 w-full flex">
                <FixAllErrorsButton
                  errorMessages={errorMessages}
                  chatId={chatId}
                />
              </div>
            )}
        </React.Fragment>
      ))}
    </>
  );
};

/**
 * Pre-process content to handle unclosed custom tags
 * Adds closing tags at the end of the content for any unclosed custom tags
 * Assumes the opening tags are complete and valid
 * Returns the processed content and a map of in-progress tags
 */
function preprocessUnclosedTags(content: string): {
  processedContent: string;
  inProgressTags: Map<string, Set<number>>;
} {
  let processedContent = content;
  // Map to track which tags are in progress and their positions
  const inProgressTags = new Map<string, Set<number>>();

  // For each tag type, check if there are unclosed tags
  for (const tagName of DYAD_CUSTOM_TAGS) {
    // Count opening and closing tags
    const openTagPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, "g");
    const closeTagPattern = new RegExp(`</${tagName}>`, "g");

    // Track the positions of opening tags
    const openingMatches: RegExpExecArray[] = [];
    let match;

    // Reset regex lastIndex to start from the beginning
    openTagPattern.lastIndex = 0;

    while ((match = openTagPattern.exec(processedContent)) !== null) {
      openingMatches.push({ ...match });
    }

    const openCount = openingMatches.length;
    const closeCount = (processedContent.match(closeTagPattern) || []).length;

    // If we have more opening than closing tags
    const missingCloseTags = openCount - closeCount;
    if (missingCloseTags > 0) {
      // Add the required number of closing tags at the end
      processedContent += Array(missingCloseTags)
        .fill(`</${tagName}>`)
        .join("");

      // Mark the last N tags as in progress where N is the number of missing closing tags
      const inProgressIndexes = new Set<number>();
      const startIndex = openCount - missingCloseTags;
      for (let i = startIndex; i < openCount; i++) {
        inProgressIndexes.add(openingMatches[i].index);
      }
      inProgressTags.set(tagName, inProgressIndexes);
    }
  }

  return { processedContent, inProgressTags };
}

/**
 * Parse the content to extract custom tags and markdown sections into a unified array
 */
function parseCustomTags(content: string): ContentPiece[] {
  const { processedContent, inProgressTags } = preprocessUnclosedTags(content);

  const tagPattern = new RegExp(
    `<(${DYAD_CUSTOM_TAGS.join("|")})\\s*([^>]*)>(.*?)<\\/\\1>`,
    "gs",
  );

  const contentPieces: ContentPiece[] = [];
  let lastIndex = 0;
  let match;

  // Find all custom tags
  while ((match = tagPattern.exec(processedContent)) !== null) {
    const [fullMatch, tag, attributesStr, tagContent] = match;
    const startIndex = match.index;

    // Add the markdown content before this tag
    if (startIndex > lastIndex) {
      contentPieces.push({
        type: "markdown",
        content: processedContent.substring(lastIndex, startIndex),
      });
    }

    // Parse attributes and unescape values
    const attributes: Record<string, string> = {};
    const attrPattern = /([\w-]+)="([^"]*)"/g;
    let attrMatch;
    while ((attrMatch = attrPattern.exec(attributesStr)) !== null) {
      attributes[attrMatch[1]] = unescapeXmlAttr(attrMatch[2]);
    }

    // Check if this tag was marked as in progress
    const tagInProgressSet = inProgressTags.get(tag);
    const isInProgress = tagInProgressSet?.has(startIndex);

    // Add the tag info with unescaped content
    contentPieces.push({
      type: "custom-tag",
      tagInfo: {
        tag,
        attributes,
        content: unescapeXmlContent(tagContent),
        fullMatch,
        inProgress: isInProgress || false,
      },
    });

    lastIndex = startIndex + fullMatch.length;
  }

  // Add the remaining markdown content
  if (lastIndex < processedContent.length) {
    contentPieces.push({
      type: "markdown",
      content: processedContent.substring(lastIndex),
    });
  }

  return contentPieces;
}

function getState({
  isStreaming,
  inProgress,
}: {
  isStreaming?: boolean;
  inProgress?: boolean;
}): CustomTagState {
  if (!inProgress) {
    return "finished";
  }
  return isStreaming ? "pending" : "aborted";
}

/**
 * Render a custom tag based on its type
 */
function renderCustomTag(
  tagInfo: CustomTagInfo,
  { isStreaming }: { isStreaming: boolean },
): React.ReactNode {
  const { tag, attributes, content, inProgress } = tagInfo;

  switch (tag) {
    case "openlovable-read":
      return (
        <OpenLovableRead
          node={{
            properties: {
              path: attributes.path || "",
              startLine: attributes.start_line || "",
              endLine: attributes.end_line || "",
            },
          }}
        >
          {content}
        </OpenLovableRead>
      );
    case "openlovable-web-search":
      return (
        <OpenLovableWebSearch
          node={{
            properties: {
              query: attributes.query || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableWebSearch>
      );
    case "openlovable-web-crawl":
      return (
        <OpenLovableWebCrawl
          node={{
            properties: {},
          }}
        >
          {content}
        </OpenLovableWebCrawl>
      );
    case "openlovable-code-search":
      return (
        <OpenLovableCodeSearch
          node={{
            properties: {
              query: attributes.query || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableCodeSearch>
      );
    case "openlovable-code-search-result":
      return (
        <OpenLovableCodeSearchResult
          node={{
            properties: {},
          }}
        >
          {content}
        </OpenLovableCodeSearchResult>
      );
    case "openlovable-web-search-result":
      return (
        <OpenLovableWebSearchResult
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableWebSearchResult>
      );
    case "think":
      return (
        <OpenLovableThink
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableThink>
      );
    case "openlovable-write":
      return (
        <OpenLovableWrite
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableWrite>
      );

    case "openlovable-rename":
      return (
        <OpenLovableRename
          node={{
            properties: {
              from: attributes.from || "",
              to: attributes.to || "",
            },
          }}
        >
          {content}
        </OpenLovableRename>
      );

    case "openlovable-delete":
      return (
        <OpenLovableDelete
          node={{
            properties: {
              path: attributes.path || "",
            },
          }}
        >
          {content}
        </OpenLovableDelete>
      );

    case "openlovable-add-dependency":
      return (
        <OpenLovableAddDependency
          node={{
            properties: {
              packages: attributes.packages || "",
            },
          }}
        >
          {content}
        </OpenLovableAddDependency>
      );

    case "openlovable-execute-sql":
      return (
        <OpenLovableExecuteSql
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              description: attributes.description || "",
            },
          }}
        >
          {content}
        </OpenLovableExecuteSql>
      );

    case "openlovable-read-logs":
      return (
        <OpenLovableLogs
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              time: attributes.time || "",
              type: attributes.type || "",
              level: attributes.level || "",
              count: attributes.count || "",
            },
          }}
        >
          {content}
        </OpenLovableLogs>
      );

    case "openlovable-grep":
      return (
        <OpenLovableGrep
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              query: attributes.query || "",
              include: attributes.include || "",
              exclude: attributes.exclude || "",
              "case-sensitive": attributes["case-sensitive"] || "",
              count: attributes.count || "",
              total: attributes.total || "",
              truncated: attributes.truncated || "",
            },
          }}
        >
          {content}
        </OpenLovableGrep>
      );

    case "openlovable-add-integration":
      return (
        <OpenLovableAddIntegration
          node={{
            properties: {
              provider: attributes.provider || "",
            },
          }}
        >
          {content}
        </OpenLovableAddIntegration>
      );

    case "openlovable-edit":
      return (
        <OpenLovableEdit
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableEdit>
      );

    case "openlovable-search-replace":
      return (
        <OpenLovableSearchReplace
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableSearchReplace>
      );

    case "openlovable-codebase-context":
      return (
        <OpenLovableCodebaseContext
          node={{
            properties: {
              files: attributes.files || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableCodebaseContext>
      );

    case "openlovable-mcp-tool-call":
      return (
        <OpenLovableMcpToolCall
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </OpenLovableMcpToolCall>
      );

    case "openlovable-mcp-tool-result":
      return (
        <OpenLovableMcpToolResult
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </OpenLovableMcpToolResult>
      );

    case "openlovable-output":
      return (
        <OpenLovableOutput
          type={attributes.type as "warning" | "error"}
          message={attributes.message}
        >
          {content}
        </OpenLovableOutput>
      );

    case "openlovable-problem-report":
      return (
        <OpenLovableProblemSummary summary={attributes.summary}>
          {content}
        </OpenLovableProblemSummary>
      );

    case "openlovable-chat-summary":
      // Don't render anything for openlovable-chat-summary
      return null;

    case "openlovable-command":
      if (attributes.type) {
        const action = {
          id: attributes.type,
        } as SuggestedAction;
        return <>{mapActionToButton(action)}</>;
      }
      return null;

    case "openlovable-list-files":
      return (
        <OpenLovableListFiles
          node={{
            properties: {
              directory: attributes.directory || "",
              recursive: attributes.recursive || "",
              include_hidden: attributes.include_hidden || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableListFiles>
      );

    case "openlovable-database-schema":
      return (
        <OpenLovableDatabaseSchema
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableDatabaseSchema>
      );

    case "openlovable-supabase-table-schema":
      return (
        <OpenLovableSupabaseTableSchema
          node={{
            properties: {
              table: attributes.table || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableSupabaseTableSchema>
      );

    case "openlovable-supabase-project-info":
      return (
        <OpenLovableSupabaseProjectInfo
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableSupabaseProjectInfo>
      );

    case "openlovable-status":
      return (
        <OpenLovableStatus
          node={{
            properties: {
              title: attributes.title || "Processing...",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableStatus>
      );

    case "openlovable-compaction":
      return (
        <OpenLovableCompaction
          node={{
            properties: {
              title: attributes.title || "Compacting conversation",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableCompaction>
      );

    case "openlovable-write-plan":
      return (
        <OpenLovableWritePlan
          node={{
            properties: {
              title: attributes.title || "Implementation Plan",
              summary: attributes.summary,
              complete: attributes.complete,
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </OpenLovableWritePlan>
      );

    case "openlovable-exit-plan":
      return (
        <OpenLovableExitPlan
          node={{
            properties: {
              notes: attributes.notes,
            },
          }}
        />
      );

    default:
      return null;
  }
}
