import type { Plugin, ViteDevServer } from 'vite';

export function vitePluginExposeDevServer(name: string): Plugin {
  return {
    name: '@electron-forge/plugin-vite:expose-renderer',
    configureServer(server: ViteDevServer) {
      // Save dev server instance to the process object
      process.viteDevServers = {
        ...(process.viteDevServers ?? {}),
        [name]: server,
      };

      // Wait server port and attach it to env
      server.httpServer?.once('listening', () => {
        process.env[`VITE_${name.toUpperCase()}_SERVER_PORT`] = (server as any).httpServer!.address().port;
      });
    },
  };
}