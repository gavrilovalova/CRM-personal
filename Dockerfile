# Production image of the app. Built by GitHub Actions, never on the server

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# db/index.ts requires DATABASE_URL at import time; nothing connects during the build
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build pnpm build
# Self-contained migrator: drizzle-orm and postgres have no runtime dependencies of their own
RUN mkdir -p /migrator/node_modules \
 && cp -RL node_modules/drizzle-orm node_modules/postgres /migrator/node_modules/ \
 && cp -R drizzle scripts/migrate.mjs /migrator/

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /migrator ./migrator
USER node
EXPOSE 3000
CMD ["node", "server.js"]
