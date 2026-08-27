import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These ship native .node bindings / rely on Node-specific resolution and
  // must not be bundled by Turbopack/webpack — load them via native require.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
  // Pin the workspace root to this project so Turbopack doesn't walk up and
  // pick up an unrelated pnpm-lock.yaml sitting in the home directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
