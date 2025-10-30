const packageJson = Bun.file("package.json");

const content = await packageJson.json();

content.version = process.argv[2];
console.info(`set version to '${content.version}'`);

delete content.devDependencies;

if (process.argv.includes("--dry-run")) {
  console.info(content);
} else {
  await packageJson.write(JSON.stringify(content, null, 2));
}
