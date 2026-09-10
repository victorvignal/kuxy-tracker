// KUXY main entry point — bootstrap only
// All IPC handlers vivem em src/main/modules/

import { app, BrowserWindow, shell } from 'electron'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import { getDb, persistDb } from './db'
import { initAutoUpdater } from './updater'
import { registerProfiles } from './modules/profiles'
import { registerHabits } from './modules/habits'
import { registerRoutines } from './modules/routines'
import { registerJournal } from './modules/journal'
import { registerFocus } from './modules/focus'
import { registerLeads } from './modules/leads'
import { registerGoals } from './modules/goals'
import { registerAccounts } from './modules/accounts'
import { registerContacts } from './modules/contacts'
import { registerRitmo } from './modules/ritmo'
import { registerFinance } from './modules/finance'
import { registerProjects } from './modules/projects'
import { registerOutreach } from './modules/outreach'
import { registerEarnings } from './modules/earnings'
import { registerDashboard } from './modules/dashboard'
import { registerSystem } from './modules/system'

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0f',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      height: 38,
      color: '#0a0a0f',
      symbolColor: '#cfcfd4'
    },
    title: 'KUXY',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  })

  mainWindow.webContents.on('console-message', (_e, level, msg, line, source) => {
    console.log(`[renderer console:${level}]`, msg, `@${source}:${line}`)
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

function registerIpc(): void {
  registerProfiles(persistDb)
  registerHabits(persistDb)
  registerRoutines(persistDb)
  registerJournal(persistDb)
  registerFocus(persistDb)
  registerLeads(persistDb)
  registerGoals(persistDb)
  registerAccounts(persistDb)
  registerContacts(persistDb)
  registerRitmo(persistDb)
  registerFinance(persistDb)
  registerProjects(persistDb)
  registerOutreach(persistDb)
  registerEarnings()
  registerDashboard()
  registerSystem()
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('app.kuxy.desktop')
  app.setName('KUXY')

  app.on('browser-window-created', (_e, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  await getDb()
  registerIpc()
  const win = createWindow()

  initAutoUpdater(win)

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
