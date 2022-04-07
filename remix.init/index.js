const fs = require('fs/promises');
const path = require('path');
const sort = require('sort-package-json');
const { execSync } = require('child_process');

const escapeRegExp = (string) => string.replace(/[.*ls+?^${}()|[\]\\]/g, '\\$&');

const main = async ({ rootDirectory }) => {
  const README = path.join(rootDirectory, 'README.md');
  const PACKAGE_JSON = path.join(rootDirectory, 'package.json');
  const DOTENV = path.join(rootDirectory, '.env');

  const DIR_NAME = path.basename(rootDirectory);
  const APP_NAME = `${DIR_NAME}`.replace(/[^a-zA-Z0-9-_]/g, '-');
  const REPLACER = 'insert-application-title-here';

  const packageJSON = await fs.readFile(PACKAGE_JSON, 'utf-8');
  const readme = await fs.readFile(README, 'utf-8');
  const newReadme = readme.replace(new RegExp(escapeRegExp(REPLACER), 'g'), APP_NAME);

  const newPackageJSON = JSON.stringify(
    sort({ ...JSON.parse(packageJSON), name: APP_NAME }),
    null,
    2,
  );

  const dotEnv = `
  DATABASE_URL=file:./database.sqlite
  `.trim();

  await Promise.all([
    fs.writeFile(PACKAGE_JSON, newPackageJSON),
    fs.writeFile(README, newReadme),
    fs.writeFile(DOTENV, dotEnv),
  ]);
  execSync(`npm run setup`, { stdio: 'inherit', cwd: rootDirectory });
};

module.exports = main;
