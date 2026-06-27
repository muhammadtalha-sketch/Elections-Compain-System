import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 enables Turbopack by default.
  // Turbopack automatically stubs Node.js built-ins (fs, path, crypto) for
  // browser bundles, so xlsx's conditional require() calls are handled without
  // explicit configuration.
  turbopack: {},
};

export default nextConfig;
