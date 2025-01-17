import { context } from 'esbuild';
import { BitburnerPlugin } from 'esbuild-bitburner-plugin';

const createContext = async () => await context({
  entryPoints: [
    'servers/**/*.js',
    'servers/**/*.jsx',
    'servers/**/*.ts',
    'servers/**/*.tsx',
  ],
  outbase: "./servers",
  outdir: "./build",
  plugins: [BitburnerPlugin({
    port: 12525,
    types: 'NetscriptDefinitions.d.ts',
    distribute: {
      'build/dist': ['home', 'pserv-0', 'pserv-1', 'pserv-2', 'pserv-3', 'pserv-4', 'pserv-5', 'pserv-6', 'pserv-7', 'pserv-8', 'pserv-9']
    },
    usePolling: true,
    pollingInterval: 50,
  })],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  logLevel: 'info'
});

let ctx = await createContext();
ctx.watch();