# syntax=docker/dockerfile:1
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=4096
# Public (build-time) settings. Pass with: fly deploy --build-arg NAME=value
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_QC_BASE
ARG NEXT_PUBLIC_NEWSLETTER_ENABLED
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_QC_BASE=$NEXT_PUBLIC_QC_BASE
ENV NEXT_PUBLIC_NEWSLETTER_ENABLED=$NEXT_PUBLIC_NEWSLETTER_ENABLED
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
