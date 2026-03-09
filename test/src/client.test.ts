import { expect, it } from "bun:test";

it("tunnels simple request", async () => {
  const response = await fetch("http://localhost:8080/simple");

  const data = await response.json();

  expect(data).not.toBeNull();
});

it("tunnels sse events", async () => {
  const response = await fetch("http://localhost:8080/sse");

  expect(response.body).not.toBeNull();

  const events = [];

  for await (const chunk of response.body!) {
    const text = new TextDecoder().decode(chunk);
    events.push(text);
  }

  expect(events).toHaveLength(5);
});
