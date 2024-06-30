import { app } from 'electron';
import path from 'path';

export const ASSETS_PATH = app.isPackaged ? path.join(process.resourcesPath, 'assets') : path.join(__dirname, '../../assets');

export  const DEVTOOLS_WIDTH = 500;
export  const WINDOW_WIDTH = 900;
export  const WINDOW_HEIGHT = 600;