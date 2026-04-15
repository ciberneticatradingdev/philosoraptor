/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle native modules — let them be required at runtime
      config.externals = [...(config.externals || []), '@napi-rs/canvas', 'canvas'];
    }
    return config;
  },
};

module.exports = nextConfig;
