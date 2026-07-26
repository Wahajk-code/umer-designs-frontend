import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    // Defaults to os.cpus().length - 1 build workers, which on a shared host
    // can wildly overstate the RAM actually available.
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
  webpack: (config, { dev }) => {
    // Reproduced locally with matching Next/React/Node versions and the
    // build still succeeds — the Hostinger-only "Cannot read properties of
    // null (reading 'useContext')" crash on /_global-error survives cpus:1
    // (rules out a worker race) and a Next patch bump (rules out a known
    // upstream bug). What's left is Hostinger's build host reusing a
    // persistent webpack cache directory across deploys: if that cache was
    // written by an older dependency set, a chunk can end up referencing a
    // stale React module instance, which is exactly what a null useContext
    // dispatcher looks like. Disabling the filesystem cache for production
    // builds forces every deploy to compile from source instead of
    // potentially-stale cached modules.
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
