import { cleanFullResponse } from "@/ipc/utils/cleanFullResponse";
import { describe, it, expect } from "vitest";

describe("cleanFullResponse", () => {
  it("should replace < characters in openlovable-write attributes", () => {
    const input = `<openlovable-write path="src/file.tsx" description="Testing <a> tags.">content</openlovable-write>`;
    const expected = `<openlovable-write path="src/file.tsx" description="Testing ＜a＞ tags.">content</openlovable-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should replace < characters in multiple attributes", () => {
    const input = `<openlovable-write path="src/<component>.tsx" description="Testing <div> tags.">content</openlovable-write>`;
    const expected = `<openlovable-write path="src/＜component＞.tsx" description="Testing ＜div＞ tags.">content</openlovable-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle multiple nested HTML tags in a single attribute", () => {
    const input = `<openlovable-write path="src/file.tsx" description="Testing <div> and <span> and <a> tags.">content</openlovable-write>`;
    const expected = `<openlovable-write path="src/file.tsx" description="Testing ＜div＞ and ＜span＞ and ＜a＞ tags.">content</openlovable-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle complex example with mixed content", () => {
    const input = `
      BEFORE TAG
  <openlovable-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use <a> tags.">
import React from 'react';
</openlovable-write>
AFTER TAG
    `;

    const expected = `
      BEFORE TAG
  <openlovable-write path="src/pages/locations/neighborhoods/louisville/Highlands.tsx" description="Updating Highlands neighborhood page to use ＜a＞ tags.">
import React from 'react';
</openlovable-write>
AFTER TAG
    `;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle other openlovable tag types", () => {
    const input = `<openlovable-rename from="src/<old>.tsx" to="src/<new>.tsx"></openlovable-rename>`;
    const expected = `<openlovable-rename from="src/＜old＞.tsx" to="src/＜new＞.tsx"></openlovable-rename>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle openlovable-delete tags", () => {
    const input = `<openlovable-delete path="src/<component>.tsx"></openlovable-delete>`;
    const expected = `<openlovable-delete path="src/＜component＞.tsx"></openlovable-delete>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should not affect content outside openlovable tags", () => {
    const input = `Some text with <regular> HTML tags. <openlovable-write path="test.tsx" description="With <nested> tags.">content</openlovable-write> More <html> here.`;
    const expected = `Some text with <regular> HTML tags. <openlovable-write path="test.tsx" description="With ＜nested＞ tags.">content</openlovable-write> More <html> here.`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle empty attributes", () => {
    const input = `<openlovable-write path="src/file.tsx">content</openlovable-write>`;
    const expected = `<openlovable-write path="src/file.tsx">content</openlovable-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });

  it("should handle attributes without < characters", () => {
    const input = `<openlovable-write path="src/file.tsx" description="Normal description">content</openlovable-write>`;
    const expected = `<openlovable-write path="src/file.tsx" description="Normal description">content</openlovable-write>`;

    const result = cleanFullResponse(input);
    expect(result).toBe(expected);
  });
});
