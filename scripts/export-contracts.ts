/// This script exports the compiled contract ABIs to a specified directory.
/// And set address of deployed contracts into a environment file.

import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";
import z from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ABI_EXPORT_PATH = "../lib/contracts";

async function main() {
  const exportDir = path.resolve(__dirname, ABI_EXPORT_PATH);
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true });
  }

  // Add here the contracts you want to export
  const contractsToExport = [
    { name: "Counter", address: "ADDRESS_OF_THE_CONTRACT" },
  ];

  let envContent = "";

  for (const contractInfo of contractsToExport) {
    const artifactPath = path.resolve(
      __dirname,
      `../artifacts/contracts/${contractInfo.name}.sol/${contractInfo.name}.json`,
    );
    const artifactData = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
    const artifact = z
      .object({
        abi: z.array(z.any()),
        contractName: z.string().optional(),
        bytecode: z.string().optional(),
      })
      .parse(artifactData);

    const abiExportPath = path.resolve(
      exportDir,
      `${contractInfo.name}.abi.json`,
    );
    fs.writeFileSync(abiExportPath, JSON.stringify(artifact.abi, null, 2));
    console.log(`Exported ABI for ${contractInfo.name} to ${abiExportPath}`);

    envContent += `NEXT_PUBLIC_${contractInfo.name.toUpperCase()}_ADDRESS=${contractInfo.address}\n`;
  }

  const envFilePath = path.resolve(__dirname, "../.env.local");
  let existingEnvContent = "";
  if (fs.existsSync(envFilePath)) {
    existingEnvContent = fs.readFileSync(envFilePath, "utf-8");
  }

  envContent = existingEnvContent + "\n" + envContent;

  fs.writeFileSync(envFilePath, envContent);
  console.log(`Updated environment file at ${envFilePath}`);
}

main().catch((error) => {
  console.error("Error exporting contracts:", error);
  process.exit(1);
});
