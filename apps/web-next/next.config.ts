import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@questboard/types",
    "@questboard/constants",
    "@questboard/validators",
    "@questboard/utils",
    "@questboard/store",
    "@questboard/api-client",
    "@questboard/socket",
  ],
};

export default nextConfig;
