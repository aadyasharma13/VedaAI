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
  // pdfjs-dist resolves its worker file at runtime via a dynamic
  // require.resolve, which Vercel's static file tracer doesn't always catch
  // — force-include it so it's guaranteed to ship in the serverless bundle
  // for every route that touches PDF conversion.
  outputFileTracingIncludes: {
    "/api/upload": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
    "/api/dev/seed": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
};

export default nextConfig;
