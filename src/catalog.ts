import glob from "glob";
import fs from "fs";
import { AccumulationFunction, Config, Table } from "voici.js";

/**
 * Promise wrapped glob call.
 */
export function findFilesMatchingGlob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    glob(pattern, (err: unknown, files: string[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
}

/**
 * Given an AST, find all imports and return as list.
 */
export function findImportLines(src: string): RegExpMatchArray {
  return src.match(/(import)([\s\S]*?)from\W(['"]).*(['"])/gm) || [];
}

/**
 * Given a substring representing a JS import, return the destructured members.
 */
export function extractExportedMembers(importLine: string): string[] {
  const memberStrings = importLine.match(/[^{]+(?=})/);

  return memberStrings
    ? memberStrings[0]
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
    : [];
}

/**
 * Given a list of imported members, return a list of the members that are actually used matching the package.
 */
export function catalogSrcImports(src: string, packageName: string): string[] {
  const imports = findImportLines(src).filter((line) =>
    line.includes(packageName)
  );
  const members = imports.map((importLine) =>
    extractExportedMembers(importLine)
  );

  return members.flat();
}

/**
 * ```json
 * {
 *   "module": {
 *      "count": 2,
 *      "files": ["src/foo.ts", "src/bar.ts"]
 * }
 * ```
 */
type Catalog = Record<string, { count: number; files: string[] }>;

/**
 * Catalogs imported members for a module given a src glob and a package name.
 */
export async function catalogInventoryOfImportedMembers(
  patterns: string,
  packageName: string
): Promise<Catalog> {
  // resolve files matching patterns
  const files = await findFilesMatchingGlob(patterns);

  // return catalog of imported modules
  return files.reduce((acc, file) => {
    const src = fs.readFileSync(file, "utf8");
    const matchingImports = catalogSrcImports(src, packageName);

    matchingImports.forEach((importMember) => {
      const module = {
        count: acc[importMember] ? acc[importMember].count + 1 : 1,
        files: acc[importMember] ? [...acc[importMember].files, file] : [file],
      };

      return (acc[importMember] = module);
    });

    return acc;
  }, {} as Catalog);
}

const TABLE_CONFIG: Config = {
  align: "LEFT",
  body: {
    accumulation: {
      columns: [
        {
          column: "Imports",
          func: AccumulationFunction.SUM,
        },
      ],
    },
  },
};

/**
 * Prints a catalog of imported members in a readable format.
 */
export function presentCatalog(
  catalog: Catalog,
  flags?: { showFiles?: boolean }
): void {
  const presentationData = Object.entries(catalog).map(([member, details]) => ({
    Member: member,
    Imports: details.count,
    ...(flags?.showFiles ? { Files: details.files.join(", ") } : {}),
  }));

  if (presentationData.length === 0) {
    console.log("No imports found.");
    return;
  }

  console.log("The following members were found to be imported: \n");

  const table = new Table(presentationData, TABLE_CONFIG);

  table.print();
}
