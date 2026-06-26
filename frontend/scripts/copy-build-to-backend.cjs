const fs = require("fs");
const path = require("path");

const frontendRoot = path.resolve(__dirname, "..");
const backendStaticDir = path.resolve(frontendRoot, "..", "backend", "src", "main", "resources", "static");
const buildDir = path.resolve(frontendRoot, "build");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, {recursive: true});
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.copyFileSync(src, dest);
}

if (!fs.existsSync(buildDir)) {
  throw new Error(`Build directory not found: ${buildDir}`);
}

fs.mkdirSync(backendStaticDir, {recursive: true});
for (const entry of fs.readdirSync(backendStaticDir)) {
  if (entry === ".gitkeep") {
    continue;
  }
  fs.rmSync(path.join(backendStaticDir, entry), {recursive: true, force: true});
}
copyRecursive(buildDir, backendStaticDir);

console.log(`Copied frontend build to ${backendStaticDir}`);
