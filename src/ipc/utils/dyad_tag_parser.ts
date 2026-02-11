import { normalizePath } from "../../../shared/normalizePath";
import { unescapeXmlAttr, unescapeXmlContent } from "../../../shared/xmlEscape";
import log from "electron-log";
import { SqlQuery } from "../../lib/schemas";

const logger = log.scope("openlovable_tag_parser");

export function getOpen-LovableWriteTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const openlovableWriteRegex = /<openlovable-write([^>]*)>([\s\S]*?)<\/openlovable-write>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = openlovableWriteRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1];
    let content = unescapeXmlContent(match[2].trim());

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = unescapeXmlAttr(pathMatch[1]);
      const description = descriptionMatch?.[1]
        ? unescapeXmlAttr(descriptionMatch[1])
        : undefined;

      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <openlovable-write> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}

export function getOpen-LovableRenameTags(fullResponse: string): {
  from: string;
  to: string;
}[] {
  const openlovableRenameRegex =
    /<openlovable-rename from="([^"]+)" to="([^"]+)"[^>]*>([\s\S]*?)<\/openlovable-rename>/g;
  let match;
  const tags: { from: string; to: string }[] = [];
  while ((match = openlovableRenameRegex.exec(fullResponse)) !== null) {
    tags.push({
      from: normalizePath(unescapeXmlAttr(match[1])),
      to: normalizePath(unescapeXmlAttr(match[2])),
    });
  }
  return tags;
}

export function getOpen-LovableDeleteTags(fullResponse: string): string[] {
  const openlovableDeleteRegex =
    /<openlovable-delete path="([^"]+)"[^>]*>([\s\S]*?)<\/openlovable-delete>/g;
  let match;
  const paths: string[] = [];
  while ((match = openlovableDeleteRegex.exec(fullResponse)) !== null) {
    paths.push(normalizePath(unescapeXmlAttr(match[1])));
  }
  return paths;
}

export function getOpen-LovableAddDependencyTags(fullResponse: string): string[] {
  const openlovableAddDependencyRegex =
    /<openlovable-add-dependency packages="([^"]+)">[^<]*<\/openlovable-add-dependency>/g;
  let match;
  const packages: string[] = [];
  while ((match = openlovableAddDependencyRegex.exec(fullResponse)) !== null) {
    packages.push(...unescapeXmlAttr(match[1]).split(" "));
  }
  return packages;
}

export function getOpen-LovableChatSummaryTag(fullResponse: string): string | null {
  const openlovableChatSummaryRegex =
    /<openlovable-chat-summary>([\s\S]*?)<\/openlovable-chat-summary>/g;
  const match = openlovableChatSummaryRegex.exec(fullResponse);
  if (match && match[1]) {
    return unescapeXmlContent(match[1].trim());
  }
  return null;
}

export function getOpen-LovableExecuteSqlTags(fullResponse: string): SqlQuery[] {
  const openlovableExecuteSqlRegex =
    /<openlovable-execute-sql([^>]*)>([\s\S]*?)<\/openlovable-execute-sql>/g;
  const descriptionRegex = /description="([^"]+)"/;
  let match;
  const queries: { content: string; description?: string }[] = [];

  while ((match = openlovableExecuteSqlRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = unescapeXmlContent(match[2].trim());
    const descriptionMatch = descriptionRegex.exec(attributesString);
    const description = descriptionMatch?.[1]
      ? unescapeXmlAttr(descriptionMatch[1])
      : undefined;

    // Handle markdown code blocks if present
    const contentLines = content.split("\n");
    if (contentLines[0]?.startsWith("```")) {
      contentLines.shift();
    }
    if (contentLines[contentLines.length - 1]?.startsWith("```")) {
      contentLines.pop();
    }
    content = contentLines.join("\n");

    queries.push({ content, description });
  }

  return queries;
}

export function getOpen-LovableCommandTags(fullResponse: string): string[] {
  const openlovableCommandRegex =
    /<openlovable-command type="([^"]+)"[^>]*><\/openlovable-command>/g;
  let match;
  const commands: string[] = [];

  while ((match = openlovableCommandRegex.exec(fullResponse)) !== null) {
    commands.push(unescapeXmlAttr(match[1]));
  }

  return commands;
}

export function getOpen-LovableSearchReplaceTags(fullResponse: string): {
  path: string;
  content: string;
  description?: string;
}[] {
  const openlovableSearchReplaceRegex =
    /<openlovable-search-replace([^>]*)>([\s\S]*?)<\/openlovable-search-replace>/gi;
  const pathRegex = /path="([^"]+)"/;
  const descriptionRegex = /description="([^"]+)"/;

  let match;
  const tags: { path: string; content: string; description?: string }[] = [];

  while ((match = openlovableSearchReplaceRegex.exec(fullResponse)) !== null) {
    const attributesString = match[1] || "";
    let content = unescapeXmlContent(match[2].trim());

    const pathMatch = pathRegex.exec(attributesString);
    const descriptionMatch = descriptionRegex.exec(attributesString);

    if (pathMatch && pathMatch[1]) {
      const path = unescapeXmlAttr(pathMatch[1]);
      const description = descriptionMatch?.[1]
        ? unescapeXmlAttr(descriptionMatch[1])
        : undefined;

      // Handle markdown code fences if present
      const contentLines = content.split("\n");
      if (contentLines[0]?.startsWith("```")) {
        contentLines.shift();
      }
      if (contentLines[contentLines.length - 1]?.startsWith("```")) {
        contentLines.pop();
      }
      content = contentLines.join("\n");

      tags.push({ path: normalizePath(path), content, description });
    } else {
      logger.warn(
        "Found <openlovable-search-replace> tag without a valid 'path' attribute:",
        match[0],
      );
    }
  }
  return tags;
}
