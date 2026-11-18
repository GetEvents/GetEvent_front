// En-têtes de sécurité appliqués à toutes les pages.
// La CSP est volontairement minimale (anti-clickjacking, pas de plugins, pas de
// <base> externe) pour ne pas casser Google Maps, Google OAuth, Cloudinary,
// FedaPay ou Socket.IO. Une CSP complète (script-src, connect-src…) doit être
// testée d'abord en mode Content-Security-Policy-Report-Only.
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    // Caméra autorisée pour le scanner de QR codes, géolocalisation pour la carte
    key: "Permissions-Policy",
    value: "camera=(self), geolocation=(self), microphone=(), payment=()",
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  output: "standalone",
  reactCompiler: true,
  images: {
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dpkph2ucq/image/upload/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/events/create",
        destination: "/events/createvent",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
