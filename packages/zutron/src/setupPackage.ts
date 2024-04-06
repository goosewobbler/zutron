import { join, dirname } from 'path';
import { readFile, writeFile, copyFile } from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = { encoding: 'utf-8' } as const;

const PACKAGE_FILE_NAME = 'package.json';
const NPM_IGNORE_FILE_NAME = '.npmignore';

const rootFolder = join(__dirname, '..');
const distFolder = join(rootFolder, 'dist');

const rootPackage = join(rootFolder, PACKAGE_FILE_NAME);
const distPackage = join(distFolder, PACKAGE_FILE_NAME);

const rootNpmIgnore = join(rootFolder, NPM_IGNORE_FILE_NAME);
const distNpmIgnore = join(distFolder, NPM_IGNORE_FILE_NAME);

const versionFile = join(distFolder, 'version.txt');

const main = async () => {
  const source = await readFile(rootPackage, options);
  const sourceObj = JSON.parse(source);
  sourceObj.scripts = {};
  sourceObj.devDependencies = {};

  await writeFile(distPackage, JSON.stringify(sourceObj, null, 2), options);
  await writeFile(versionFile, sourceObj.version, options);
  await copyFile(rootNpmIgnore, distNpmIgnore);
};

main();
