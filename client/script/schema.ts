import { configSchema } from "../src/cli/options";

const schema = configSchema();
const output = Bun.file("config.schema.json");

await output.write(JSON.stringify(schema, null, 2));

console.info(`generated ${output.name}`);
