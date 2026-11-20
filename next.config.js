/** @type {import('next').NextConfig} */
const nextConfig = {
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
