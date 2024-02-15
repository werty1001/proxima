import { join, basename, extname, sep } from 'node:path';
import { readdirSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { libInjectCss } from 'vite-plugin-lib-inject-css';
import { type OutputOptions } from 'rollup';
import copy, { type Target } from 'rollup-plugin-copy';
import vue from '@vitejs/plugin-vue';
import postBuild from './post.build';


// Read source folder

const src = join('.', 'src');

const files = readdirSync(src, { withFileTypes: true })
  .reduce((acc, item) => {
    const itemPath = join(src, item.name);
    if (item.isDirectory()) {
      readdirSync(itemPath, { withFileTypes: true })
        .filter((el) => !el.isDirectory())
        .forEach(({ name }) => acc.push(join(itemPath, name)));
    } else {
      acc.push(itemPath);
    }
    return acc;
  }, [] as string[]);

const entry = files.filter((filepath) =>
  ['.vue', '.ts'].includes(extname(filepath)) &&
  !filepath.endsWith('.d.ts') &&
  !filepath.endsWith('.spec.ts') &&
  !basename(filepath).startsWith('_')
);


// Renames

const entryFileNames: OutputOptions['entryFileNames'] = (chunkInfo) => {
  const [, chunkPath] = (chunkInfo.facadeModuleId || '').split('src' + sep);
  const fileName = `${basename(chunkPath, extname(chunkPath))}.mjs`;
  const arrayPath = chunkPath.split(sep);
  if (arrayPath.length > 1) {
    const [dirName] = arrayPath;
    return [dirName, fileName].join(sep);
  }
  return fileName;
};

const rename: Target['rename'] = (name, extension, fullPath) => {
  const arrayPath = fullPath.replace('./src/', '').split(sep);
  const fileName = `${name}.${extension}`;
  if (arrayPath.length > 1) {
    const [dirName] = arrayPath;
    return [dirName, fileName].join(sep);
  }
  return fileName;
};


// Config - https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    vue(),
    libInjectCss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL(src, import.meta.url)),
    },
  },
  build: {
    cssCodeSplit: true,
    emptyOutDir: false,
    lib: {
      entry,
      formats: ['es'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
      external: ['vue', 'vue-router'],
      output: {
        // Provide global variables to use in the UMD build
        globals: {
          vue: 'Vue',
          'vue-router': 'VueRouter',
        },
        entryFileNames,
        assetFileNames: () => ['assets', '[name]-[hash][extname]'].join(sep),
        chunkFileNames: () => ['chunks', '[name]-[hash].mjs'].join(sep),
      },
      plugins: [
        copy({
          targets: [
            { src: './src/types.d.ts', dest: './dist/' },
            { src: './src/bin.mjs', dest: './dist/' },
            { src: './LICENSE', dest: './dist/' },
            { src: './README.md', dest: './dist/' },
            { src: './src/**/package.json', dest: './dist/', rename },
            { src: ['./src/styles/*.css', '!**/_*.css'], dest: './dist/', rename },
          ],
        }),
        postBuild(
          fileURLToPath(new URL('./dist', import.meta.url)),
          fileURLToPath(new URL('./package.json', import.meta.url))
        ),
      ],
    },
  },
});
