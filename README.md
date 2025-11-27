# vite-plugin-google-maps _(Experimental)_

[Leer en Español](./README_ES.md)

A Vite plugin that simplifies Google Maps integration in React applications using `@vis.gl/react-google-maps`.

## Features

- 🚀 **Auto-configuration**: Automatically wraps your app with `APIProvider`
- 🎯 **Default Map Options**: Configure map defaults once, use everywhere
- 🛠️ **Developer Tools**: Built-in debug panel for development
- 📦 **Zero Boilerplate**: No need to manually set up providers

## Installation

```bash
pnpm install vite-plugin-google-maps
```

## Quick Start

### 1. Configure the plugin

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleMapsPlugin } from 'vite-plugin-google-maps';

export default defineConfig({
  plugins: [
    react(),
    GoogleMapsPlugin({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
      libraries: ['places', 'marker'],
      debug: true, // Enable dev tools
      mapDefaults: {
        mapId: 'YOUR_MAP_ID',
        gestureHandling: 'greedy',
        defaultCenter: { lat: 40.7128, lng: -74.0060 },
        defaultZoom: 12,
        fullscreenControl: true,
        disableDefaultUI: false,
      }
    }),
  ],
});
```

### 2. Use the Map component

Import and use the pre-configured `Map` component:

```tsx
import { Map } from '@google-maps/map';
import { AdvancedMarker } from '@vis.gl/react-google-maps';

function App() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <Map>
        <AdvancedMarker position={{ lat: 40.7128, lng: -74.0060 }} />
      </Map>
    </div>
  );
}

export default App;
```

## TypeScript Setup
> [!WARNING]
> To use the `Map` component with TypeScript, you need to declare the module type. Create a `types.d.ts` (or any `*.d.ts`) file in your project:
>
> ```typescript
> // types.d.ts or vite-env.d.ts
> declare module "@google-maps/map" {
>  import React from "react";
>  import { Map as GoogleMapBase } from "@vis.gl/react-google-maps";
>  
>  export const Map: React.FC<React.ComponentProps<typeof GoogleMapBase>>;
> }
> ```

This provides full type safety and autocomplete for the `Map` component props.

## Configuration Options

### GoogleMapsPluginOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | **required** | Your Google Maps API key |
| `libraries` | `string[]` | `['places']` | Google Maps libraries to load |
| `debug` | `boolean` | `false` | Enable developer tools panel |
| `mapDefaults` | `MapDefaultOptions` | `{}` | Default options for Map component |

### MapDefaultOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `mapId` | `string` | - | Map ID for custom styling |
| `gestureHandling` | `'cooperative' \| 'greedy' \| 'none' \| 'auto'` | `'auto'` | How map responds to gestures |
| `defaultCenter` | `{ lat: number; lng: number }` | - | Initial map center position |
| `defaultZoom` | `number` | `8` | Initial zoom level (0-22) |
| `fullscreenControl` | `boolean` | `false` | Show fullscreen button |
| `disableDefaultUI` | `boolean` | `false` | Disable all default UI controls |
| `zoomControl` | `boolean` | `true` | Show zoom controls (+/-) |
| `mapTypeControl` | `boolean` | `false` | Show map/satellite toggle |
| `scaleControl` | `boolean` | `false` | Show scale indicator |
| `streetViewControl` | `boolean` | `true` | Show Street View pegman |
| `rotateControl` | `boolean` | `false` | Show rotation control |

## Usage Examples

### Basic Map

```tsx
import { Map } from '@google-maps/map';

function BasicMap() {
  return <Map />;
}
```

### Override Default Options

```tsx
import { Map } from '@google-maps/map';

function CustomMap() {
  return (
    <Map
      defaultZoom={15}
      defaultCenter={{ lat: 51.5074, lng: -0.1278 }}
      gestureHandling="cooperative"
    />
  );
}
```

### With Markers

```tsx
import { Map } from '@google-maps/map';
import { AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';

function MapWithMarkers() {
  const [open, setOpen] = useState(false);

  return (
    <Map>
      <AdvancedMarker
        position={{ lat: 40.7128, lng: -74.0060 }}
        onClick={() => setOpen(true)}
      />
      {open && (
        <InfoWindow
          position={{ lat: 40.7128, lng: -74.0060 }}
          onCloseClick={() => setOpen(false)}
        >
          <div>New York City</div>
        </InfoWindow>
      )}
    </Map>
  );
}
```

### Multiple Maps with Different Settings

```tsx
import { Map } from '@google-maps/map';

function MultipleMaps() {
  return (
    <div>
      {/* Uses plugin defaults */}
      <Map style={{ height: '50vh' }} />
      
      {/* Custom settings */}
      <Map
        style={{ height: '50vh' }}
        defaultCenter={{ lat: 48.8566, lng: 2.3522 }}
        defaultZoom={10}
      />
    </div>
  );
}
```

## Developer Tools

When `debug: true` is enabled, a developer tools panel appears in the bottom-right corner showing:

- **API Key**: First 5 characters of your API key
- **Libraries**: Loaded Google Maps libraries
- **Map Status**: Whether the map has loaded
- **Zoom Level**: Current zoom level
- **Center**: Current map center coordinates
- **Mouse Position**: Real-time cursor coordinates
- **Click Position**: Last clicked coordinates with geocoded address
- **Copy Button**: Copy clicked coordinates to clipboard

## How It Works

1. **Auto-wrapping**: The plugin automatically wraps your React app with `APIProvider` in `main.tsx`
2. **Virtual Module**: Creates a virtual module `@google-maps/map` that exports a pre-configured `Map` component
3. **Default Props**: Merges plugin defaults with component props (component props take precedence)

## Getting a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Go to **Credentials** and create an API key
5. (Optional) Restrict your API key for security

[Learn more](https://developers.google.com/maps/documentation/javascript/get-api-key)

## Troubleshooting

### Map not loading

- Verify your API key is correct
- Check that the Maps JavaScript API is enabled in Google Cloud Console
- Open browser console for error messages

### TypeScript errors

- Ensure `@vis.gl/react-google-maps` is installed
- Check that your `tsconfig.json` includes the plugin directory

### Devtools not showing

- Verify `debug: true` in plugin options
- Check that the `Map` component from `@google-maps/map` is being used

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Related

- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Vite Plugin API](https://vitejs.dev/guide/api-plugin.html)
