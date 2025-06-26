/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

// Sentry integration (if SENTRY_DSN is set)
const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  silent: true,
};

const finalConfig = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;

export default finalConfig
