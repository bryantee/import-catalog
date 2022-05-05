import { program } from "commander";
import { catalogInventoryOfImportedMembers, presentCatalog } from "./catalog";

const package_json = require("../package.json");

type Arguments = {
  patterns: string;
  packageName: string;
  modules: string[];
};

program
  .name("import-catalog")
  .version(package_json.version)
  .description(package_json.description);

program
  .option(
    "-p, --patterns <patterns>",
    "Patterns that match files to be checked."
  )
  .option(
    "-n, --packageName <packageName>",
    "Name of the package or module to be checked for."
  );

async function run() {
  const options = program.parse().opts<Arguments>();
  const patterns = options.patterns ?? "src/**/*.ts";
  const packageName = options.packageName;

  if (!packageName) {
    throw new Error("packageName is a required argument.");
  }

  const catalog = await catalogInventoryOfImportedMembers(
    patterns,
    packageName
  );

  presentCatalog(catalog);
}

(async () => {
  try {
    await run();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
