import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';

const [css, js, photo, worker] = await Promise.all([
  readFile('assets/style.css', 'utf8'),
  readFile('assets/site.js', 'utf8'),
  readFile('assets/buns.webp'),
  readFile('worker.js', 'utf8')
]);
await mkdir('dist/server', { recursive: true });
await mkdir('dist/.openai', { recursive: true });
await copyFile('.openai/hosting.json', 'dist/.openai/hosting.json');
await writeFile('dist/server/index.js', 'const assets = ' + JSON.stringify({css, js, photo: photo.toString('base64')}) + '\n' + worker);
