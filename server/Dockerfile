# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base
WORKDIR /usr/src/

FROM base AS turbo
RUN bun --global add turbo@^2

FROM turbo AS prepare

COPY . .

RUN turbo prune @possible_triangle/tunnel-server --docker

FROM turbo AS builder

COPY --from=prepare /usr/src/out/bun.lock .
COPY --from=prepare /usr/src/out/json/ .
RUN bun install --frozen-lockfile --production

COPY --from=prepare /usr/src/out/full/ .
RUN bun run build

FROM base AS release

ENV NODE_ENV=production

COPY --from=builder /usr/src/server/dist ./app

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "app/server.js" ]