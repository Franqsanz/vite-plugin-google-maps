import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { GoogleMapsPlugin } from '../index'

describe('GoogleMapsPlugin', () => {
  describe('validación de apiKey', () => {
    it('lanza warn si apiKey está vacía en desarrollo', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      GoogleMapsPlugin({ apiKey: '' })
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('apiKey'))
      warn.mockRestore()
    })

    it('lanza error si apiKey está vacía en producción', () => {
      process.env.NODE_ENV = 'production'
      expect(() => GoogleMapsPlugin({ apiKey: '' })).toThrow()
      process.env.NODE_ENV = 'test'
    })
  })

  describe('resolveId', () => {
    it('resuelve el módulo virtual @google-maps/map', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.resolveId?.('@google-maps/map', undefined, {} as any)
      expect(result).toBe('\0@google-maps/map')
    })

    it('no resuelve otros módulos', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.resolveId?.('some-other-module', undefined, {} as any)
      expect(result).toBeUndefined()
    })
  })

  describe('load', () => {
    it('retorna el código del Map component para el módulo virtual', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.load?.('\0@google-maps/map', {} as any)
      expect(result).toContain('export function Map')
      expect(result).toContain('GoogleMapBase')
    })

    it('incluye los primeros caracteres del apiKey en el devtools', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'mi-api-key' })
      const result = plugin.load?.('\0@google-maps/map', {} as any)
      expect(result).toContain('mi-ap')
    })

    it('retorna null para otros ids', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.load?.('otro-modulo', {} as any)
      expect(result).toBeUndefined()
    })
  })

  describe('transform', () => {
    it('transforma main.tsx agregando APIProvider', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const code = `
        import { StrictMode } from 'react'
        import { createRoot } from 'react-dom/client'
        import App from './App'

        createRoot(document.getElementById('root')).render(
          <StrictMode><App /></StrictMode>
        )
      `
      const result = plugin.transform?.(code, '/src/main.tsx', {} as any)
      expect(result?.code).toContain('APIProvider')
      expect(result?.code).toContain('@vis.gl/react-google-maps')
    })

    it('no transforma si APIProvider ya está presente', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const code = `import { APIProvider } from '@vis.gl/react-google-maps'`
      const result = plugin.transform?.(code, '/src/main.tsx', {} as any)
      expect(result).toBeNull()
    })

    it('no transforma archivos que no son main.tsx', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.transform?.('const x = 1', '/src/App.tsx', {} as any)
      expect(result).toBeNull()
    })
  })

  describe('opciones por defecto', () => {
    it('usa libraries ["places"] por defecto', () => {
      const plugin = GoogleMapsPlugin({ apiKey: 'test-key' })
      const result = plugin.load?.('\0@google-maps/map', {} as any)
      expect(result).toContain('places')
    })

    it('respeta mapDefaults pasados', () => {
      const plugin = GoogleMapsPlugin({
        apiKey: 'test-key',
        mapDefaults: { defaultZoom: 15 }
      })
      const result = plugin.load?.('\0@google-maps/map', {} as any)
      expect(result).toContain('15')
    })
  })
})
