#!/usr/bin/env node

const https = require("https");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const zlib = require("zlib");

const VERSION = require("./package.json").version;
const CDN_BASE =
  process.env.NOVERLINK_CDN_URL ||
  `https://gitea.noverwork.com/noverwork/noverlink/releases/download/v${VERSION}`;

const PLATFORM_MAP = {
  "darwin-arm64": { file: "noverlink-darwin-arm64.tar.gz", binary: "noverlink" },
  "darwin-x64": { file: "noverlink-darwin-x64.tar.gz", binary: "noverlink" },
  "linux-arm64": { file: "noverlink-linux-arm64.tar.gz", binary: "noverlink" },
  "linux-x64": { file: "noverlink-linux-x64.tar.gz", binary: "noverlink" },
  "win32-x64": { file: "noverlink-win32-x64.zip", binary: "noverlink.exe" },
};

function getPlatformKey() {
  const platform = process.platform;
  const arch = process.arch;

  // Handle architecture aliases
  let normalizedArch = arch;
  if (arch === "x64" || arch === "amd64") {
    normalizedArch = "x64";
  } else if (arch === "arm64" || arch === "aarch64") {
    normalizedArch = "arm64";
  }

  return `${platform}-${normalizedArch}`;
}

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const request = (url) => {
      https
        .get(url, (res) => {
          // Handle redirects
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            request(res.headers.location);
            return;
          }

          if (res.statusCode !== 200) {
            reject(new Error(`Failed to download: HTTP ${res.statusCode}`));
            return;
          }

          const chunks = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        })
        .on("error", reject);
    };
    request(url);
  });
}

async function extractTarGz(buffer, destDir) {
  const tarPath = path.join(destDir, "temp.tar.gz");
  fs.writeFileSync(tarPath, buffer);

  try {
    execSync(`tar xzf "${tarPath}" -C "${destDir}"`, { stdio: "pipe" });
  } finally {
    fs.unlinkSync(tarPath);
  }
}

async function extractZip(buffer, destDir) {
  const zipPath = path.join(destDir, "temp.zip");
  fs.writeFileSync(zipPath, buffer);

  try {
    // Try using unzip on Unix or PowerShell on Windows
    if (process.platform === "win32") {
      execSync(
        `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force"`,
        { stdio: "pipe" }
      );
    } else {
      execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: "pipe" });
    }
  } finally {
    fs.unlinkSync(zipPath);
  }
}

async function main() {
  const platformKey = getPlatformKey();
  const platformInfo = PLATFORM_MAP[platformKey];

  if (!platformInfo) {
    console.error(`Unsupported platform: ${platformKey}`);
    console.error(`Supported platforms: ${Object.keys(PLATFORM_MAP).join(", ")}`);
    process.exit(1);
  }

  const binDir = path.join(__dirname, "bin");
  const binaryPath = path.join(binDir, platformInfo.binary);

  // Skip if already downloaded
  if (fs.existsSync(binaryPath)) {
    console.log(`noverlink binary already exists at ${binaryPath}`);
    return;
  }

  const url = `${CDN_BASE}/${platformInfo.file}`;
  console.log(`Downloading noverlink from ${url}...`);

  try {
    const buffer = await downloadFile(url);

    // Create bin directory
    if (!fs.existsSync(binDir)) {
      fs.mkdirSync(binDir, { recursive: true });
    }

    // Extract based on file type
    if (platformInfo.file.endsWith(".tar.gz")) {
      await extractTarGz(buffer, binDir);
    } else if (platformInfo.file.endsWith(".zip")) {
      await extractZip(buffer, binDir);
    }

    // Make executable on Unix
    if (process.platform !== "win32") {
      fs.chmodSync(binaryPath, 0o755);
    }

    console.log(`Successfully installed noverlink to ${binaryPath}`);
  } catch (err) {
    console.error(`Failed to download noverlink: ${err.message}`);
    console.error("You can manually download from: " + url);
    process.exit(1);
  }
}

main();
