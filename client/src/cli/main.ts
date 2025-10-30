import { ZodError } from "zod";
import { connect } from "../client";
import { getOptions } from "./options";

try {
  const options = await getOptions();
  await connect(options);
} catch (e) {
  if (e instanceof ZodError) {
    e.issues.forEach((it) => {
      console.error(`missing or invalid option --${it.path}`);
    });
  } else if (e instanceof Error) console.error(e.message);
  process.exit(1);
}
