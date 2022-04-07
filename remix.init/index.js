const fs = require('fs/promises');
const path = require('path');
const sort = require('sort-package-json');

const main = async ({ rootDirectory }) => {
  const README = path.join(rootDirectory, 'README.md');
  const PACKAGE_JSON = path.join(rootDirectory, 'package.json');

  const DIR_NAME = path.basename(rootDirectory);
  const APP_NAME = `${DIR_NAME}`.replace(/[^a-zA-Z0-9-_]/g, '-');

  const packageJSON = await fs.readFile(PACKAGE_JSON, 'utf-8');
  const readmeFile = await fs.readFile(README, 'utf-8');

  const newPackageJSON = JSON.stringify(sort({ ...packageJSON, name: APP_NAME }));
  await fs.writeFile(PACKAGE_JSON, newPackageJSON);
};

module.exports = main;
