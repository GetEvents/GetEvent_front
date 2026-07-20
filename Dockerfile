FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json .npmrc ./
RUN npm ci

FROM deps AS tester
RUN apk add --no-cache chromium # Installation de Chromium pour Playwright
COPY . .
RUN npm run lint
RUN npm test

FROM deps AS builder
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_GOOGLE_MAP_ID
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_GOOGLE_MAP_ID=$NEXT_PUBLIC_GOOGLE_MAP_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build
RUN npm run build-storybook

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/storybook-static ./public/storybook

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
