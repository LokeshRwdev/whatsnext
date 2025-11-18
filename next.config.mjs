// next.config.mjs (Next.js 16)
export default {
  experimental: {
    cacheComponents: true, // replaces experimental.ppr
  },
  headers: async () => ([
    {
      source: "/(.*)",
      headers: [{ key: "Permissions-Policy", value: "geolocation=(self)" }],
    },
  ]),
};
