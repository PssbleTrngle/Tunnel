import args from "args";
import dotenv from "dotenv";
import { existsSync, readFileSync } from "node:fs";
import z from "zod";

args
  .option("config", "path to the config file")
  .option("port", "which port to forward too")
  .option("host", "which host to forward too")
  .option("target", "url of the tunnel server");

const configOptions = z.object({
  port: z.number().optional().describe("which port to forward too"),
  host: z.string().optional().describe("which host to forward too"),
  target: z.string().optional().describe("url of the tunnel server"),
});

const cliOptions = configOptions.and(
  z.object({
    config: z.string().optional(),
  })
);

const options = z.object({
  port: z.number(),
  host: z.string().default("localhost"),
  target: z.string(),
  secret: z.string().optional(),
});

export type Options = z.infer<typeof options>;

export function configSchema() {
  return z.toJSONSchema(configOptions);
}

function loadEnv(path: string) {
  dotenv.config({ path, quiet: true });
}

function readEnv() {
  loadEnv(".env");
  loadEnv(".env.dev");
  loadEnv(".env.local");
  loadEnv(".env.tunnel");

  return {
    host: process.env["TUNNEL_HOST"],
    port: process.env["TUNNEL_PORT"],
    config: process.env["TUNNEL_CONFIG"],
    target: process.env["TUNNEL_TARGET"],
    secret: process.env["TUNNEL_SECRET"],
  };
}

function readJson(file: string) {
  if (existsSync(file)) {
    return JSON.parse(readFileSync(file).toString());
  }

  return null;
}

async function readConfig(
  file: string
): Promise<z.infer<typeof configOptions>> {
  const json = readJson(file);
  if (json === null) return {};
  return cliOptions.parse(json);
}

function generateUserAgent() {
  const json = readJson("package.json");
  if (json === null) return undefined;
  const { name, version = "dev" } = json;
  return `${name}@${version}`;
}

export async function getOptions() {
  const env = readEnv();
  const flags = cliOptions.parse(args.parse(process.argv));
  const config = await readConfig(
    flags.config ?? env.config ?? "tunnel.config.json"
  );

  const userAgent = generateUserAgent();
  return options.parse({ ...env, ...config, ...flags, userAgent });
}
