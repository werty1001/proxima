import { readdir, rename, writeFile, readFile, access } from 'node:fs/promises';
import { join, basename, dirname, sep } from 'node:path';
import { constants, type PathLike } from 'node:fs';
import { styles, components, composables } from './nuxt/src/module';


const readFiles = async (src: PathLike) => {
  try {
    const files: string[] = [];
    const items = await readdir(src, { withFileTypes: true });
    for (const item of items) {
      const itemPath = join(String(src), item.name);
      if (item.isDirectory()) {
        const subfiles = await readFiles(itemPath);
        files.push(...subfiles);
      } else {
        files.push(itemPath);
      }
    }
    return files;
  } catch (err) {
    console.error(err);
    return [];
  }
};


const renameTypeFiles = async (files: string[]) => {
  const items = files.filter((filepath) => filepath.endsWith('.vue.d.ts'));
  for (const item of items) {
    const name = basename(item).replace('.vue.d.ts', '.d.ts');
    await rename(item, [dirname(item), name].join(sep));
  }
};


const modifyTypeFile = async (dist: PathLike) => {
  const src = join(String(dist), 'types.d.ts');
  const content = await readFile(src, { encoding: 'utf8' });
  await writeFile(src, content.replace(/from '(.*).vue'/g, "from '$1'"));
};


const setPackageVersion = async (packagePath: PathLike, dist: PathLike) => {
  const distPackage = join(String(dist), 'package.json');
  const [mainPackageContent, distPackageContent] = await Promise.all([
    readFile(packagePath, { encoding: 'utf8' }),
    readFile(distPackage, { encoding: 'utf8' }),
  ]);
  await writeFile(
    distPackage,
    distPackageContent.replace('{version}', JSON.parse(mainPackageContent).version)
  );
};


const modifyNuxtTypeFile = (content: string) => content.replace(
  'interface ProximaNuxtOptions {',
  "import type { ProximaSetupOptions } from 'proxima-vue/types.d';\n\ninterface ProximaNuxtOptions extends ProximaSetupOptions {"
);


const prepareNuxtModule = async (dist: PathLike) => {
  const nuxtPackage = join(String(dist), 'nuxt', 'package.json');
  await writeFile(nuxtPackage, `{
  "main": "./module.mjs",
  "types": "./types.d.ts"
}`);
  const [tsModulePath, mtsModulePath] = [
    join(String(dist), 'nuxt', 'module.d.ts'),
    join(String(dist), 'nuxt', 'module.d.mts'),
  ];
  const [tsModuleContent, mtsModuleContent] = await Promise.all([
    readFile(tsModulePath, { encoding: 'utf8' }),
    readFile(mtsModulePath, { encoding: 'utf8' }),
  ]);
  await Promise.all([
    writeFile(tsModulePath, modifyNuxtTypeFile(tsModuleContent)),
    writeFile(mtsModulePath, modifyNuxtTypeFile(mtsModuleContent)),
  ]);
};


const checkNuxtFiles = async (dist: PathLike) => {
  const items = [...styles, ...components, ...composables];
  for (const item of items) {
    const [modulePath = ''] = item.split('|');
    await access(join(String(dist), modulePath.replace('proxima-vue', '')), constants.F_OK);
  }
};


const run = (dist: PathLike, packagePath: PathLike) => ({
  name: 'post-build',
  closeBundle: async () => {
    const files = await readFiles(dist);
    await renameTypeFiles(files);
    await modifyTypeFile(dist); // Remove .vue extension from imports in types.d.ts
    await setPackageVersion(packagePath, dist); // Add version to package.json
    await prepareNuxtModule(dist);
    await checkNuxtFiles(dist);
  },
});

export default run;

