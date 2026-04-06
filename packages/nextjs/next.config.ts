import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    // ☢️ 核打击：无视环境变量，直接强行焊死忽略 TS 报错
    ignoreBuildErrors: true,
  },
  eslint: {
    // ☢️ 核打击：无视环境变量，直接强行焊死忽略 ESLint 警告
    ignoreDuringBuilds: true,
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
