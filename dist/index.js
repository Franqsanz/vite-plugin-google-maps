// src/index.ts
import path from "path";
import fs from "fs";
function GoogleMapsPlugin(options) {
  const {
    apiKey,
    libraries = ["places"],
    debug = false,
    mapDefaults = {}
  } = options;
  if (!apiKey || typeof apiKey !== "string" || apiKey.trim() === "") {
    const msg = `
\u26A0\uFE0F  [vite-plugin-google-maps]
No se proporcion\xF3 una apiKey de Google Maps.
El provider NO podr\xE1 cargar la API.
`;
    if (process.env.NODE_ENV === "production") {
      throw new Error(msg);
    } else {
      console.warn(msg);
    }
  }
  const pkgPath = path.resolve(
    process.cwd(),
    "node_modules/@vis.gl/react-google-maps"
  );
  if (!fs.existsSync(pkgPath)) {
    console.warn(
      `
\u26A0\uFE0F  [vite-plugin-google-maps]
La librer\xEDa "@vis.gl/react-google-maps" NO est\xE1 instalada.

  npm install @vis.gl/react-google-maps
`
    );
  }
  const mapWrapperCode = `
    import React, { useEffect, useState } from 'react';
    import { Map as GoogleMapBase, useMap } from '@vis.gl/react-google-maps';

    function DevtoolsPanel() {
      const map = useMap();
      const [mouseLatLng, setMouseLatLng] = useState(null);
      const [clickedLatLng, setClickedLatLng] = useState(null);
      const [placeName, setPlaceName] = useState(null);
      const [zoom, setZoom] = useState(null);
      const [center, setCenter] = useState(null);
      const [loaded, setLoaded] = useState(false);

      const copyCoords = () => {
        if (!clickedLatLng) return;
        const text = \`\${clickedLatLng.lat}, \${clickedLatLng.lng}\`;
        navigator.clipboard.writeText(text);
        alert("Coordenadas copiadas");
      };

      useEffect(() => {
        if (!map) return;
        setLoaded(true);
        setZoom(map.getZoom());
        setCenter(map.getCenter()?.toJSON());

        const mouseMoveListener = map.addListener("mousemove", (e) => {
          setMouseLatLng({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });

        const clickListener = map.addListener("click", (e) => {
          const point = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          setClickedLatLng(point);

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({ location: point }, (results, status) => {
            if (status === "OK" && results[0]) {
              setPlaceName(results[0].formatted_address);
            } else {
              setPlaceName("No encontrado");
            }
          });
        });

        const zoomListener = map.addListener("zoom_changed", () => {
          setZoom(map.getZoom());
        });

        const centerListener = map.addListener("center_changed", () => {
          const c = map.getCenter();
          if (c) setCenter(c.toJSON());
        });

        return () => {
          google.maps.event.removeListener(mouseMoveListener);
          google.maps.event.removeListener(clickListener);
          google.maps.event.removeListener(zoomListener);
          google.maps.event.removeListener(centerListener);
        };
      }, [map]);

      if (!${debug}) return null;

      return React.createElement(
        "div",
        {
          style: {
            position: "fixed",
            bottom: "10px",
            right: "10px",
            padding: "12px",
            background: "#0009",
            color: "white",
            borderRadius: "8px",
            fontSize: "12px",
            zIndex: 999999,
            width: "280px",
            lineHeight: "1.4",
            backdropFilter: "blur(4px)",
          }
        },
        React.createElement("div", { style: { fontWeight: "bold", fontSize: "16px", marginBottom: "5px" }}, "Google Maps Devtools"),
        React.createElement("div", null, "API Key: ${apiKey.slice(0, 5)}...****"),
        React.createElement("div", null, "Libraries: ${libraries.join(", ")}"),
        React.createElement("div", null, "Map Loaded: " + (loaded ? "S\xED" : "No")),
        React.createElement("hr"),
        React.createElement("div", null, "Zoom: " + (zoom ?? "-")),
        React.createElement("div", null, "Centro: " + (center ? \`\${center.lat.toFixed(5)}, \${center.lng.toFixed(5)}\` : "-")),
        React.createElement("div", null, "Mouse: " + (mouseLatLng ? \`\${mouseLatLng.lat.toFixed(5)}, \${mouseLatLng.lng.toFixed(5)}\` : "-")),
        React.createElement("div", null, "Click: " + (clickedLatLng ? \`\${clickedLatLng.lat.toFixed(5)}, \${clickedLatLng.lng.toFixed(5)}\` : "-")),
        React.createElement("div", null, "Lugar: " + (placeName ?? "-")),
        clickedLatLng &&
          React.createElement(
            "button",
            {
              style: {
                marginTop: "8px",
                width: "100%",
                padding: "4px",
                background: "#22c55e",
                color: "#000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              },
              onClick: copyCoords
            },
            "Copiar coordenadas"
          )
      );
    }

    export function Map(props) {
      const defaults = ${JSON.stringify(mapDefaults)};

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(GoogleMapBase, { ...defaults, ...props }),
        ${debug} && React.createElement(DevtoolsPanel)
      );
    }
  `;
  return {
    name: "vite-google-maps",
    enforce: "pre",
    resolveId(id) {
      if (id === "@google-maps/map") {
        return "\0@google-maps/map";
      }
    },
    load(id) {
      if (id === "\0@google-maps/map") {
        return mapWrapperCode;
      }
    },
    transform(code, id) {
      const isMainFile = /[\\/]main\.(tsx|jsx)$/.test(id);
      if (!isMainFile) return null;
      if (code.includes("APIProvider") || code.includes("@vis.gl/react-google-maps")) {
        return null;
      }
      let transformedCode = `import { APIProvider } from "@vis.gl/react-google-maps";
${code}`;
      const renderMatch = transformedCode.match(/\.render\s*\(\s*([\s\S]+)\s*\)\s*[;,]?\s*$/);
      if (!renderMatch) {
        console.warn("\u26A0\uFE0F  [vite-plugin-google-maps] No se pudo encontrar .render()");
        return null;
      }
      const renderContent = renderMatch[1];
      let wrappedContent;
      const apiKeyStr = JSON.stringify(apiKey);
      const librariesStr = JSON.stringify(libraries);
      if (renderContent.includes("<StrictMode>")) {
        wrappedContent = renderContent.replace(
          /(<StrictMode>\s*\n?\s*)([\s\S]*?)(\s*\n?\s*<\/StrictMode>)/,
          (match, opening, content, closing) => {
            return `${opening}<APIProvider apiKey={${apiKeyStr}} libraries={${librariesStr}}>
${content}
    </APIProvider>${closing}`;
          }
        );
      } else {
        wrappedContent = `<APIProvider apiKey={${apiKeyStr}} libraries={${librariesStr}}>
${renderContent}
</APIProvider>`;
      }
      transformedCode = transformedCode.replace(renderContent, wrappedContent);
      return { code: transformedCode, map: null };
    },
    config() {
      return {
        resolve: {
          alias: {}
        }
      };
    }
  };
}
export {
  GoogleMapsPlugin
};
//# sourceMappingURL=index.js.map