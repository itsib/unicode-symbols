import { ipcRenderer, IpcRendererEvent } from 'electron';

export function fileRead(filename: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    let data = ''

    const disconnect = () => {
      ipcRenderer.off('file:read:chunk', onChunk);
      ipcRenderer.off('file:read:end', onEnd);
      ipcRenderer.off('file:read:error', onError);
    }

    const onChunk = (_event: IpcRendererEvent, chunk: string) => {
      data += chunk
    }

    const onEnd = (_event: IpcRendererEvent) => {
      disconnect()
      resolve(data)
    }

    const onError = (_event: IpcRendererEvent, error: any) => {
      disconnect()
      reject(error)
    }

    ipcRenderer.on('file:read:chunk', onChunk)
    ipcRenderer.on('file:read:end', onEnd);
    ipcRenderer.on('file:read:error', onError);

    ipcRenderer.send('file:read', filename);
  })
}
