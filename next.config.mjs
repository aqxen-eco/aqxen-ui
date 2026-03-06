/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://*.mypinata.cloud https://*.pinata.cloud",
              "font-src 'self'",
              "connect-src 'self' https://jungle.eosusa.io https://jungle4.greymass.com https://api.coingecko.com https://*.pinata.cloud https://anchor.greymass.com https://uploads.pinata.cloud wss://anchor.greymass.com https://cb.anchor.link wss://cb.anchor.link",
              "frame-src 'none'",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
