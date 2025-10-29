import { connect } from "../client";
import { getOptions } from "./options";

try {
  const options = await getOptions();
  await connect(options);
} catch (e) {
  if (e instanceof Error) console.error(e.message);
  process.exit(1);
}
