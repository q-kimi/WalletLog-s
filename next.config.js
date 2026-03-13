/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // === OPTIMISATION RAILWAY : Standalone mode ===
  // Reduit drastiquement la RAM utilisee (~60-70% moins)
  // Ne copie que les fichiers necessaires au runtime
  output: 'standalone',

  // Ignorer les erreurs ESLint lors du build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Desactiver la telemetrie Next.js (moins de requetes reseau)
  // Configurer via NEXT_TELEMETRY_DISABLED=1 en variable d'env

  // Optimisations pour Next.js 15
  experimental: {
    // Tree-shaking ameliore pour lucide-react et recharts
    optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
  },

  // Compression gzip des reponses (moins de bande passante)
  compress: true,

  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
    // Domaines autorises pour next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Cache des images optimisees (1 semaine)
    minimumCacheTTL: 604800,
  },

  // Headers de securite renforces
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://avatars.githubusercontent.com",
              "connect-src 'self'",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
      {
        // Cache agressif pour les assets statiques
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache pour les images publiques
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
