FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml nx.json tsconfig.base.json .npmrc ./
COPY apps apps
COPY libs libs
COPY prisma prisma
RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate
RUN pnpm nx build api --configuration=production

FROM node:20-alpine
RUN corepack enable
WORKDIR /app
COPY --from=base /app/dist/apps/api ./dist
COPY --from=base /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml .npmrc ./
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
