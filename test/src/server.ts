Bun.serve({
  port: 8888,
  routes: {
    "/simple": {
      GET: async () => {
        return Response.json({ data: "something" });
      },
    },
    "/sse": {
      GET: async (req, server) => {
        server.timeout(req, 0);

        return new Response(
          async function* () {
            for (let i = 0; i < 5; i++) {
              yield `data: connected at ${Date.now()}\n\n`;
              await Bun.sleep(100);
            }
          },
          {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
            },
          },
        );
      },
    },
  },
});
