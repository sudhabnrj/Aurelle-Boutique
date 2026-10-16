/**
 * GITHUB_PAGES=true builds a static export served from https://<user>.github.io/<repo>/.
 * Local dev and regular builds are unaffected.
 */
const pages = process.env.GITHUB_PAGES === 'true';
const basePath = pages ? `/${process.env.PAGES_REPO ?? 'Aurelle-Boutique'}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(pages && { output: 'export', basePath, trailingSlash: true }),
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  images: {
    // Static hosting has no image optimizer; Unsplash URLs already carry their own width.
    unoptimized: pages,
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
