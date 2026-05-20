import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.8.133"],
  reactCompiler: true,
  serverExternalPackages: ["pg", "@napi-rs/canvas", "pdfjs-dist"],
};

export default withNextIntl(nextConfig);
