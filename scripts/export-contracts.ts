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
      `${contractInfo.name}.abi.ts`,
    );
    const abiContent = `export const ${contractInfo.name}Abi = ${JSON.stringify(artifact.abi, null, 2)} as const;\n\nexport const ${contractInfo.name}Address = process.env.NEXT_PUBLIC_${contractInfo.name.toUpperCase()}_ADDRESS ?? "";\n`;

    envContent += `NEXT_PUBLIC_${contractInfo.name.toUpperCase()}_ADDRESS=${contractInfo.address}\n`;

    fs.writeFileSync(abiExportPath, abiContent);
    console.log(`Exported ABI for ${contractInfo.name} to ${abiExportPath}`);
  }

  const envFilePath = path.resolve(__dirname, "../.env.local");
  let existingEnvContent = "";
  if (fs.existsSync(envFilePath)) {
    existingEnvContent = fs.readFileSync(envFilePath, "utf-8");
  }

  // Remove existing contract addresses from the env file
  const existingLines = existingEnvContent
    .split("\n")
    .filter(
      (line) =>
        !contractsToExport.some((contractInfo) =>
          line.startsWith(
            `NEXT_PUBLIC_${contractInfo.name.toUpperCase()}_ADDRESS=`,
          ),
        ),
    );
  existingEnvContent = existingLines.join("\n");

  envContent = existingEnvContent + "\n" + envContent;

  fs.writeFileSync(envFilePath, envContent.trim());
  console.log(`Updated environment file at ${envFilePath}`);
}

main().catch((error) => {
  console.error("Error exporting contracts:", error);
  process.exit(1);
});
