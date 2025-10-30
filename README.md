# Tunnel

This is a very simple http tunnel implementation using websockets.
In contrast to existing solutions like [ngrok](https://ngrok.com/), this is not meant to sustain multiple tunnels hosted under different subdomains, but only one.

It does not handly any https certificates and is meant to be run behind a server like [nginx](https://nginx.org/) or [caddy](https://caddyserver.com/).

This means you can host a tunnel server at your production domain during development and simply swap it out with the actual implementation, without needing to change your redirect/callback urls anywere.

## How to use

1. host a tunnel server under a domain `example.com`
2. connect a tunnel client from you local machine to that server
3. every http(s) request made to the tunnel server will now be forwarded using a websocket connection to your client
4. your client will send a request to the specified port and forward the answer, again using the websocket connection
5. your hosted tunnel server will respond with the received data

## Settings up a server

The [tunnel docker container](https://github.com/PssbleTrngle/Tunnel/pkgs/container/tunnel) can be simply started and will receive requests under port `8080` by default.
This can be changed by passing the `PORT` environment variable.

You can defined a secret key using the `SECRET` environment variable, which will be required to be passed by connecting clients.

## Using the client CLI

You can install the [tunnel client CLI](https://www.npmjs.com/package/@possible_triangle/tunnel-client) using your favorite package manager from NPM.

```sh
bun add  --global @possible_triangle/tunnel-client
```

Using the `tunnel` command, you can now connect to a tunnel server.

There are several options, which can be passed either as CLI flags, read from a local `tunnel.config.json`, from `.env.(local|tunnel|dev)` files or directly from the environment.

| CLI Flag   | Config Property | Environment Variable | Description                                                         | Required | Default              |
| ---------- | --------------- | -------------------- | ------------------------------------------------------------------- | -------- | -------------------- |
| `--target` | `target`        | `TUNNEL_TARGET`      | the url of the tunnel server in the format of `https://example.com` | Yes      |                      |
| `--port`   | `port`          | `TUNNEL_PORT`        | the port this client should forward requests too                    | Yes      |                      |
| `--host`   | `host`          | `TUNNEL_HOST`        | the host this client should forward requests too                    | No       | `localhost`          |
| `--config` | -               | `TUNNEL_CONFIG`      | the file name of the config file to read options from               | No       | `tunnel.config.json` |
| -          | -               | `TUNNEL_SECRET`      | secret key required by the tunnel server (if configured there)      | No       |                      |
