const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Resolve .js imports to .ts source files (ESM-style imports in monorepo packages)
config.resolver.sourceExts = ["ts", "tsx", "js", "jsx", "json", "cjs", "mjs"];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // When importing from monorepo packages source, resolve .js → .ts
  if (moduleName.endsWith(".js")) {
    const tsName = moduleName.replace(/\.js$/, ".ts");
    try {
      return context.resolveRequest(context, tsName, platform);
    } catch {
      // Fall through to default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
