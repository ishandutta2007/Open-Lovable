import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Open-LovableWrite } from "./Open-LovableWrite";
import { Open-LovableRename } from "./Open-LovableRename";
import { Open-LovableDelete } from "./Open-LovableDelete";
import { Open-LovableAddDependency } from "./Open-LovableAddDependency";
import { Open-LovableExecuteSql } from "./Open-LovableExecuteSql";
import { Open-LovableLogs } from "./Open-LovableLogs";
import { Open-LovableGrep } from "./Open-LovableGrep";
import { Open-LovableAddIntegration } from "./Open-LovableAddIntegration";
import { Open-LovableEdit } from "./Open-LovableEdit";
import { Open-LovableSearchReplace } from "./Open-LovableSearchReplace";
import { Open-LovableCodebaseContext } from "./Open-LovableCodebaseContext";
import { Open-LovableThink } from "./Open-LovableThink";
import { CodeHighlight } from "./CodeHighlight";
import { useAtomValue } from "jotai";
import { isStreamingByIdAtom, selectedChatIdAtom } from "@/atoms/chatAtoms";
import { CustomTagState } from "./stateTypes";
import { Open-LovableOutput } from "./Open-LovableOutput";
import { Open-LovableProblemSummary } from "./Open-LovableProblemSummary";
import { ipc } from "@/ipc/types";
import { Open-LovableMcpToolCall } from "./Open-LovableMcpToolCall";
import { Open-LovableMcpToolResult } from "./Open-LovableMcpToolResult";
import { Open-LovableWebSearchResult } from "./Open-LovableWebSearchResult";
import { Open-LovableWebSearch } from "./Open-LovableWebSearch";
import { Open-LovableWebCrawl } from "./Open-LovableWebCrawl";
import { Open-LovableCodeSearchResult } from "./Open-LovableCodeSearchResult";
import { Open-LovableCodeSearch } from "./Open-LovableCodeSearch";
import { Open-LovableRead } from "./Open-LovableRead";
import { Open-LovableListFiles } from "./Open-LovableListFiles";
import { Open-LovableDatabaseSchema } from "./Open-LovableDatabaseSchema";
import { Open-LovableSupabaseTableSchema } from "./Open-LovableSupabaseTableSchema";
import { Open-LovableSupabaseProjectInfo } from "./Open-LovableSupabaseProjectInfo";
import { Open-LovableStatus } from "./Open-LovableStatus";
import { Open-LovableCompaction } from "./Open-LovableCompaction";
import { Open-LovableWritePlan } from "./Open-LovableWritePlan";
import { Open-LovableExitPlan } from "./Open-LovableExitPlan";
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

interface Open-LovableMarkdownParserProps {
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
export const Open-LovableMarkdownParser: React.FC<Open-LovableMarkdownParserProps> = ({
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
        <Open-LovableRead
          node={{
            properties: {
              path: attributes.path || "",
              startLine: attributes.start_line || "",
              endLine: attributes.end_line || "",
            },
          }}
        >
          {content}
        </Open-LovableRead>
      );
    case "openlovable-web-search":
      return (
        <Open-LovableWebSearch
          node={{
            properties: {
              query: attributes.query || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableWebSearch>
      );
    case "openlovable-web-crawl":
      return (
        <Open-LovableWebCrawl
          node={{
            properties: {},
          }}
        >
          {content}
        </Open-LovableWebCrawl>
      );
    case "openlovable-code-search":
      return (
        <Open-LovableCodeSearch
          node={{
            properties: {
              query: attributes.query || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableCodeSearch>
      );
    case "openlovable-code-search-result":
      return (
        <Open-LovableCodeSearchResult
          node={{
            properties: {},
          }}
        >
          {content}
        </Open-LovableCodeSearchResult>
      );
    case "openlovable-web-search-result":
      return (
        <Open-LovableWebSearchResult
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableWebSearchResult>
      );
    case "think":
      return (
        <Open-LovableThink
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableThink>
      );
    case "openlovable-write":
      return (
        <Open-LovableWrite
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableWrite>
      );

    case "openlovable-rename":
      return (
        <Open-LovableRename
          node={{
            properties: {
              from: attributes.from || "",
              to: attributes.to || "",
            },
          }}
        >
          {content}
        </Open-LovableRename>
      );

    case "openlovable-delete":
      return (
        <Open-LovableDelete
          node={{
            properties: {
              path: attributes.path || "",
            },
          }}
        >
          {content}
        </Open-LovableDelete>
      );

    case "openlovable-add-dependency":
      return (
        <Open-LovableAddDependency
          node={{
            properties: {
              packages: attributes.packages || "",
            },
          }}
        >
          {content}
        </Open-LovableAddDependency>
      );

    case "openlovable-execute-sql":
      return (
        <Open-LovableExecuteSql
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
              description: attributes.description || "",
            },
          }}
        >
          {content}
        </Open-LovableExecuteSql>
      );

    case "openlovable-read-logs":
      return (
        <Open-LovableLogs
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
        </Open-LovableLogs>
      );

    case "openlovable-grep":
      return (
        <Open-LovableGrep
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
        </Open-LovableGrep>
      );

    case "openlovable-add-integration":
      return (
        <Open-LovableAddIntegration
          node={{
            properties: {
              provider: attributes.provider || "",
            },
          }}
        >
          {content}
        </Open-LovableAddIntegration>
      );

    case "openlovable-edit":
      return (
        <Open-LovableEdit
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableEdit>
      );

    case "openlovable-search-replace":
      return (
        <Open-LovableSearchReplace
          node={{
            properties: {
              path: attributes.path || "",
              description: attributes.description || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableSearchReplace>
      );

    case "openlovable-codebase-context":
      return (
        <Open-LovableCodebaseContext
          node={{
            properties: {
              files: attributes.files || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableCodebaseContext>
      );

    case "openlovable-mcp-tool-call":
      return (
        <Open-LovableMcpToolCall
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </Open-LovableMcpToolCall>
      );

    case "openlovable-mcp-tool-result":
      return (
        <Open-LovableMcpToolResult
          node={{
            properties: {
              serverName: attributes.server || "",
              toolName: attributes.tool || "",
            },
          }}
        >
          {content}
        </Open-LovableMcpToolResult>
      );

    case "openlovable-output":
      return (
        <Open-LovableOutput
          type={attributes.type as "warning" | "error"}
          message={attributes.message}
        >
          {content}
        </Open-LovableOutput>
      );

    case "openlovable-problem-report":
      return (
        <Open-LovableProblemSummary summary={attributes.summary}>
          {content}
        </Open-LovableProblemSummary>
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
        <Open-LovableListFiles
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
        </Open-LovableListFiles>
      );

    case "openlovable-database-schema":
      return (
        <Open-LovableDatabaseSchema
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableDatabaseSchema>
      );

    case "openlovable-supabase-table-schema":
      return (
        <Open-LovableSupabaseTableSchema
          node={{
            properties: {
              table: attributes.table || "",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableSupabaseTableSchema>
      );

    case "openlovable-supabase-project-info":
      return (
        <Open-LovableSupabaseProjectInfo
          node={{
            properties: {
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableSupabaseProjectInfo>
      );

    case "openlovable-status":
      return (
        <Open-LovableStatus
          node={{
            properties: {
              title: attributes.title || "Processing...",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableStatus>
      );

    case "openlovable-compaction":
      return (
        <Open-LovableCompaction
          node={{
            properties: {
              title: attributes.title || "Compacting conversation",
              state: getState({ isStreaming, inProgress }),
            },
          }}
        >
          {content}
        </Open-LovableCompaction>
      );

    case "openlovable-write-plan":
      return (
        <Open-LovableWritePlan
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
        </Open-LovableWritePlan>
      );

    case "openlovable-exit-plan":
      return (
        <Open-LovableExitPlan
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
