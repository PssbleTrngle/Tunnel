let port = Number.parseInt(process.env["PORT"] ?? "");
if (Number.isNaN(port)) port = 8080;

const secret = process.env["SECRET"];

export default {
  port,
  secret,
};
