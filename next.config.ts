import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Without this, Turbopack infers the workspace root as `app/` under Yarn PnP
  // and fails to resolve next/package.json. Pin to the project dir (the cwd
  // when `yarn dev` / `yarn build` runs).
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
