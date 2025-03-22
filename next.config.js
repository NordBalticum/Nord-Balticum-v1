/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // ✅ Išjungiam dvigubą render dev metu
  swcMinify: false,       // ✅ Naudos Terser, saugesnė minifikacija
  images: {
    domains: ['cdn.jsdelivr.net'], // Jei naudos logos ar avatarus
  },
  experimental: {
    serverActions: false, // Saugu išjungti, jei nenaudoji
  },
};

module.exports = nextConfig;
