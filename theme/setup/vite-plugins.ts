import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineVitePluginsSetup } from '@slidev/types'

// Brand art lives in theme/assets/brand/ and is served at /brand/. Slidev only
// copies a theme's public/ at build time, so dev needs this. The art is not in
// the public repo; a missing file is a plain 404 and every layout that uses
// it already drops it quietly.
const dir = fileURLToPath(new URL('../assets/brand', import.meta.url))
const types: Record<string, string> = { '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' }

export default defineVitePluginsSetup(() => [{
  name: 'theme-brand-assets',
  configureServer(server) {
    server.middlewares.use('/brand', (req, res) => {
      const file = path.join(dir, decodeURIComponent((req.url ?? '').split('?')[0]))
      if (!file.startsWith(dir) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
        res.statusCode = 404
        return res.end()
      }
      res.setHeader('Content-Type', types[path.extname(file)] ?? 'application/octet-stream')
      fs.createReadStream(file).pipe(res)
    })
  },
  generateBundle() {
    if (!fs.existsSync(dir)) return
    for (const name of fs.readdirSync(dir))
      this.emitFile({ type: 'asset', fileName: `brand/${name}`, source: fs.readFileSync(path.join(dir, name)) })
  },
}])
