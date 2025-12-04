#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const BINARY_MAP = {
  "darwin-arm64": "noverlink",
  "darwin-x64": "noverlink",
  "linux-arm64": "noverlink",
  "linux-x64": "noverlink",
  "win32-x64": "noverlink.exe",
};

function getPlatformKey() {
  const platform = process.platform;
  const arch = process.arch;

  let normalizedArch = arch;
  if (arch === "x64" || arch === "amd64") {
    normalizedArch = "x64";
  } else if (arch === "arm64" || arch === "aarch64") {
    normalizedArch = "arm64";
  }

  return `${platform}-${normalizedArch}`;
}

const platformKey = getPlatformKey();
const binaryName = BINARY_MAP[platformKey];

if (!binaryName) {
  console.error(`Unsupported platform: ${platformKey}`);
  process.exit(1);
}

const binaryPath = path.join(__dirname, "bin", binaryName);

if (!fs.existsSync(binaryPath)) {
  console.error(`Binary not found at ${binaryPath}`);
  console.error("Try reinstalling: npm install noverlink");
  process.exit(1);
}

const child = spawn(binaryPath, process.argv.slice(2), {
  stdio: "inherit",
  windowsHide: true,
});

child.on("error", (err) => {
  console.error(`Failed to start noverlink: ${err.message}`);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
