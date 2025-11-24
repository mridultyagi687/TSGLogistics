/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Proxy API requests to local gateway in single-service deployment
  // For separate frontend/backend deployments, use NEXT_PUBLIC_GATEWAY_URL directly
  async rewrites() {
    // Only use rewrites if gateway is on localhost (single-service deployment)
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:4000';
    if (gatewayUrl.includes('localhost') || gatewayUrl.includes('127.0.0.1')) {
      return [
        {
          source: '/api/gateway/:path*',
          destination: `${gatewayUrl}/api/:path*`,
        },
      ];
    }
    // For separate deployments, no rewrites needed - use direct API calls
    return [];
  },
};

export default nextConfig;
