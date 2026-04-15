/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native modules — let them be required at runtime
      config.externals = [...(config.externals || []), 'better-sqlite3', '@napi-rs/canvas'];
    }
    return config;
  },
};

module.exports = nextConfig;
