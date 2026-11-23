import { createServer } from 'node:http';
import worker from './dist/server/index.js';

const records = new Map();
const env = {
  RECIPE_ADMIN_PASSWORD: 'preview-only',
  BUCKET: {
    async get(key) {
      const value = records.get(key);
      return value === undefined ? null : {json: async () => JSON.parse(value)};
    },
    async put(key, value) { records.set(key, value); },
    async delete(key) { records.delete(key); },
    async list({prefix}) {
      return {objects: [...records.keys()].filter(key => key.startsWith(prefix)).map(key => ({key})), truncated:false};
    }
  }
};
const portIndex = process.argv.indexOf('--port');
const port = portIndex === -1 ? 4173 : Number(process.argv[portIndex + 1]);
createServer(async (incoming, outgoing) => {
  const {method, headers, url} = incoming;
  const options = ['GET','HEAD'].includes(method) ? {method, headers} : {method, headers, body:incoming, duplex:'half'};
  const response = await worker.fetch(new Request('http://localhost' + url, options), env);
  outgoing.writeHead(response.status, Object.fromEntries(response.headers));
  outgoing.end(Buffer.from(await response.arrayBuffer()));
}).listen(port, '0.0.0.0', () => console.log('Recipe preview listening on ' + port));
