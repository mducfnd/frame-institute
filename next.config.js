/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the unlisted /forward pages and files out of search results
  async headers() {
    return [
      {
        source: '/forward/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/meet',
        destination: 'https://us06web.zoom.us/j/6268911004?pwd=RWUxR2VrMmk0QVBxNFBRajJkNG05Zz09',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
