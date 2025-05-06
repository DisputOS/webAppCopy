/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',           // это важно! сюда сгенерируется service worker
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withPWA(nextConfig);
