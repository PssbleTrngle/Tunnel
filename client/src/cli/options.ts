import args from "args";
import z from "zod";

args
  .option("config", "path to the config file")
  .option("port", "which port to forward too")
  .option("host", "host of the tunnel server");

const configOptions = z.object({
  port: z.number().optional(),
  host: z.string().optional(),
});

const cliOptions = configOptions.and(
  z.object({
    config: z.string().default("tunnel.config.json"),
  })
);

const options = z.object({
  port: z.number(),
  host: z.string(),
});

export type Options = z.infer<typeof options>;

export function configSchema() {
  return z.toJSONSchema(configOptions);
}

async function readConfig(
  path: string
): Promise<z.infer<typeof configOptions>> {
  const file = Bun.file(path);
  if (await file.exists()) {
    return cliOptions.parse(await file.json());
  } else {
    return {};
  }
}

export async function getOptions() {
  const flags = cliOptions.parse(args.parse(process.argv));
  const read = await readConfig(flags.config);

  return options.parse({ ...read, ...flags });
}
