#!/usr/bin/env node
/**
 * Repack o app.asar que electron-builder produz.
 *
 * Por quê: electron-builder 25 tem um bug onde ele dropa o diretório `out/`
 * do app.asar quando files: é customizado. O app abre e fecha imediatamente
 * porque ./out/main/index.js (entry point) não existe no asar.
 *
 * Workaround: depois de electron-builder produzir `win-unpacked/resources/app.asar`,
 * extrai o asar pra uma pasta temp, adiciona `out/` e `package.json`, e reempacota.
 *
 * Uso:
 *   1. npx electron-builder --win --dir     # cria win-unpacked/
 *   2. node scripts/build-repack.mjs        # reempacota o asar
 *   3. npx electron-builder --win nsis --publish never  # NSIS a partir do asar corrigido
 *
 * O script é idempotente — pode rodar várias vezes sem efeito colateral.
 */

import { existsSync, mkdirSync, cpSync, rmSync, renameSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { tmpdir } from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = join(__dirname, '..')

// Lê package.json via fs (ESM puro, sem require)
import { readFileSync } from 'fs'
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'))
const VERSION = pkg.version

// Importa asar via dynamic import (ESM)
const asar = (await import('@electron/asar')).default
const ASAR_PATH = join(ROOT, 'release', VERSION, 'win-unpacked', 'resources', 'app.asar')

if (!existsSync(ASAR_PATH)) {
  console.error(`❌ app.asar não encontrado em ${ASAR_PATH}`)
  console.error('   Rode `npx electron-builder --win --dir` primeiro.')
  process.exit(1)
}

const ADDITIONS = [
  { src: join(ROOT, 'out'), dest: 'out' },
  { src: join(ROOT, 'package.json'), dest: 'package.json' }
]

const TMP_DIR = join(tmpdir(), `kuxy-asar-repack-${Date.now()}`)
mkdirSync(TMP_DIR, { recursive: true })

console.log(`📦 Repacking app.asar (extract → add → repack)`)
console.log(`   src: ${ASAR_PATH}`)
console.log(`   tmp: ${TMP_DIR}`)

// 1. Extract current asar
console.log('  1/3 extracting current asar...')
asar.extractAll(ASAR_PATH, TMP_DIR)

// 2. Add missing files
console.log('  2/3 adding out/ + package.json...')
for (const a of ADDITIONS) {
  if (!existsSync(a.src)) {
    console.warn(`   ⚠️  missing: ${a.src} (skipping)`)
    continue
  }
  const dest = join(TMP_DIR, a.dest)
  cpSync(a.src, dest, { recursive: true })
  console.log(`   ✓ ${a.dest}`)
}

// 3. Repack asar
console.log('  3/3 repacking...')
const newAsar = ASAR_PATH + '.new'
asar.createPackage(TMP_DIR, newAsar)

// Atomic replace (Windows file lock safety: try rename, fallback to copy)
try {
  renameSync(newAsar, ASAR_PATH)
} catch (e) {
  if (e.code === 'EPERM' || e.code === 'EACCES') {
    console.warn('   rename falhou (arquivo em uso), copiando conteúdo...')
    cpSync(newAsar, ASAR_PATH)
    rmSync(newAsar)
  } else {
    throw e
  }
}

// Cleanup
rmSync(TMP_DIR, { recursive: true, force: true })

console.log(`✅ app.asar repacked with ${ADDITIONS.length} additions`)
console.log('   Rode `npx electron-builder --win nsis --publish never` para gerar o instalador.')