/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the unlisted Companion page and file out of search results
  async headers() {
    return [
      {
        source: '/companion',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
      {
        source: '/companion/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/forward/companion', destination: '/companion', permanent: true },
      { source: '/forward/FRAME_Companion.md', destination: '/companion/FRAME_Companion.md', permanent: true },
      {
        source: '/meet',
        destination: 'https://us06web.zoom.us/j/6268911004?pwd=RWUxR2VrMmk0QVBxNFBRajJkNG05Zz09',
        permanent: false,
      },
    ]
  },
}
module.exports = nextConfig
