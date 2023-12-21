/** @type {import('next').NextConfig} */
const nextConfig = {};
const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disableDevLogs: true,
  disable: process.env.NODE_ENV !== "production",
});
module.exports = withPWA(nextConfig);
