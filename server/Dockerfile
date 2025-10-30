# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

FROM base AS install
WORKDIR /temp/prod/

# install with --production
COPY package.json bun.lock .
COPY server/package.json ./server/
COPY contract/package.json ./contract/
COPY client/package.json ./client/

RUN bun install --frozen-lockfile --filter ./server --linker hoisted

FROM base AS builder

COPY --from=install /temp/prod/node_modules node_modules
COPY . .
RUN bun run --filter ./server build

# copy production dependencies and source code into final image
FROM base AS release

ENV NODE_ENV=production

#COPY --from=install /temp/prod/node_modules node_modules
COPY --from=builder /usr/src/app/server/dist .
COPY package.json .

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "server.js" ]