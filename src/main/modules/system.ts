// KUXY main process — system module
// Update check + app info (versão, isDev).

import { ipcMain, app } from 'electron'
import { checkForUpdates, quitAndInstall } from '../updater'

export function registerSystem(): void {
  ipcMain.handle('update:getVersion', () => app.getVersion())

  // Renderer usa isso pra saber se o botão de "verificar atualizações"
  // deve ficar habilitado. window.process não existe no renderer (contextIsolation),
  // então precisa vir do main via IPC.
  ipcMain.handle('app:isDev', () => !app.isPackaged)

  ipcMain.handle('update:check', async () => {
    return checkForUpdates()
  })

  ipcMain.handle('update:install', () => {
    quitAndInstall()
  })
}
