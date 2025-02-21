import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ashleyfurniture.scene7.com"], // ✅ Allow external images from this domain
  },
};

export default nextConfig;
