import { extractExportedMembers, findImportLines } from "./catalog";

describe("catalog", () => {
  describe("extractImportedMembers", () => {
    it("should extract imported members", () => {
      const source = `
      import { foo, bar, baz, shoes } from "./foo";
    `;
      const expected = ["foo", "bar", "baz", "shoes"];
      const actual = extractExportedMembers(source);
      expect(actual).toEqual(expected);
    });

    it("should extract imported members on multiple lines", () => {
      const source = `
      import { 
        foo, 
        bar, 
        baz, 
        shoes 
      } from "./foo"; 
      `;
      const expected = ["foo", "bar", "baz", "shoes"];
      const actual = extractExportedMembers(source);
      expect(actual).toEqual(expected);
    });

    it("should extract imported members on multiple lines with new line characters", () => {
      const source = `'import {\n        foo,\n      } from "./foo"',`;
      const expected = ["foo"];
      const actual = extractExportedMembers(source);
      expect(actual).toEqual(expected);
    });
  });

  describe("findImportLines", () => {
    it("should find import lines", () => {
      const source = `
      1 + 2 = 3;

      import { foo, bar, baz, shoes } from "./foo";
      import { find } from "lodash";

      foo bar baz bink

      import {
        foo,
      } from "./foo";
      `.trim();
      const expected = [
        'import { foo, bar, baz, shoes } from "./foo"',
        'import { find } from "lodash"',
        'import {\n        foo,\n      } from "./foo"',
      ];
      const actual = findImportLines(source);
      expect(actual).toEqual(expected);
    });
  });
});
