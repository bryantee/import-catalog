import minimist from "minimist";
import { catalogInventoryOfImportedMembers } from "./catalog";

type Arguments = {
  patterns: string;
  packageName: string;
  modules: string[];
  help?: boolean;
};

async function run() {
  const args = minimist<Arguments>(process.argv.slice(2), {
    string: ["patterns", "packageName", "modules"],
  });

  if (args.help) {
    console.log(
      "Usage: catalog-import-use [--help] [--patterns=<glob>] [--packageName=<packageName>]"
    );
    process.exit(0);
  }

  const patterns = args.patterns ?? "src/**/*.ts";
  const packageName = args.packageName;

  if (!packageName) {
    throw new Error("packageName is a required argument.");
  }

  const catalog = await catalogInventoryOfImportedMembers(
    patterns,
    packageName
  );
  console.table(catalog);
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
