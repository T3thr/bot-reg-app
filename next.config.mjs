/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
      serverActions: true,
    },
    async redirects() {
      return [
        {
          source: '/old-url',
          destination: '/new-url',
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
