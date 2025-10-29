# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

FROM base AS install
WORKDIR /temp/prod/

# install with --production
COPY package.json bun.lock .
COPY server/package.json ./server/
COPY contract/package.json ./contract/
COPY client/package.json ./client/
RUN bun install --frozen-lockfile --production --filter ./server

# copy production dependencies and source code into final image
FROM base AS release
WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY --from=install /temp/prod/server/node_modules node_modules
COPY server/src src
COPY package.json .

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "src/server.ts" ]