import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

function inlineIndex() {
  let outDir = 'dist/ui'
  return {
    name: 'inline-index',
    configResolved(config) {
      outDir = (config.build?.outDir as string) || outDir
    },
    writeBundle() {
      const jsPath = path.join(outDir, 'ui.js')
      const cssPath = path.join(outDir, 'style.css')

      const js = fs.existsSync(jsPath) ? fs.readFileSync(jsPath, 'utf8') : ''
      const css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, 'utf8') : ''

      const html = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SVG → GitHub (UI)</title>
    ${css ? `<style>${css.replace(/<\/style>/g, '<\\/style>')}</style>` : ''}
  </head>
  <body>
    <div id="root"></div>
    <script>${js.replace(/<\/script>/g, '<\\/script>')}</script>
  </body>
</html>`

      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(path.join(outDir, 'index.html'), html)
      console.log(`[inline-index] wrote ${path.join(outDir, 'index.html')}`)
    }
  }
}

export default defineConfig({
  base: './',
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env': {}
  },
  build: {
    outDir: 'dist/ui',
    emptyOutDir: true,
    target: 'es2018',
    cssCodeSplit: false, // один style.css
    lib: {
      entry: 'src/ui/main.tsx',
      name: 'FigmaUI',
      formats: ['iife'],
      fileName: () => 'ui.js'
    },
    rollupOptions: {
      external: [],
      output: {
        assetFileNames: (info) => {
          if ((info.name || '').endsWith('.css')) return 'style.css'
          return 'assets/[name][extname]'
        }
      }
    }
  },
  plugins: [inlineIndex()]
})
