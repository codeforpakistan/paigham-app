/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for SendGrid's Node.js dependencies
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        dns: false,
        path: false,
        os: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        crypto: false,
        util: false,
        assert: false,
        buffer: require.resolve('buffer/'),
      };
    }
    
    return config;
  },
  // Ensure SendGrid is only used in server components
  experimental: {
    serverComponentsExternalPackages: [
      '@sendgrid/mail',
      '@sendgrid/helpers',
      '@sendgrid/client',
    ],
  },
};

module.exports = nextConfig; 