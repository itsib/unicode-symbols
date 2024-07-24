import type { Plugin } from 'vite';

export function vitePluginServerRestart(command: 'reload' | 'restart'): Plugin {
  return {
    name: '@electron-forge/plugin-vite:hot-restart',
    closeBundle() {
      if (command === 'reload') {
        for (const server of Object.values(process.viteDevServers)) {
          server.ws?.send({ type: 'full-reload' });
        }
      } else {
        process.stdin.emit('data', 'rs');
      }
    },
  };
}