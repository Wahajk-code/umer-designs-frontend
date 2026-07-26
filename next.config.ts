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
    // can wildly overstate the RAM actually available — 60+ parallel workers
    // exhausting memory mid-build surfaces as a garbled worker crash rather
    // than a clean OOM. Capping to 4 (see prior commit) didn't stop it: the
    // crash just narrowed onto /_global-error, the one page that can't be
    // skipped via force-dynamic since it's the build-time prerender
    // fallback. Forcing fully serial generation removes any remaining
    // cross-worker race on shared build chunks, which parallel workers can
    // still hit even at a low cap.
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
