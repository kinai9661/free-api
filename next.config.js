/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 環境變數配置
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  },

  // 圖片優化配置
  images: {
    domains: ['api.airforce'],
    unoptimized: true, // Cloudflare Pages 不支援圖片優化
  },

  // 輸出配置
  output: 'export',
  
  // 實驗性功能
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Webpack 配置
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },

  // 頁面擴展名
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

module.exports = nextConfig;
