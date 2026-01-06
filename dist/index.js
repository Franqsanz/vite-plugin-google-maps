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
      const [expanded, setExpanded] = useState(true);

      // Nuevos estados
      const [mapTypeId, setMapTypeId] = useState(null);
      const [gestureHandling, setGestureHandling] = useState(null);
      const [mapId, setMapId] = useState(null);
      const [tilt, setTilt] = useState(null);
      const [heading, setHeading] = useState(null);
      const [bounds, setBounds] = useState(null);
      const [initialState, setInitialState] = useState(null);

      const copyCoords = () => {
        if (!clickedLatLng) return;
        const text = \`\${clickedLatLng.lat}, \${clickedLatLng.lng}\`;
        navigator.clipboard.writeText(text);
        alert("Coordenadas copiadas al portapapeles");
      };

      const copyConfig = () => {
        if (!map) return;
        const config = {
          center: center,
          zoom: zoom,
          mapTypeId: mapTypeId,
          gestureHandling: gestureHandling,
          mapId: mapId,
          tilt: tilt,
          heading: heading,
          bounds: bounds
        };
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
        alert("Configuraci\xF3n copiada al portapapeles");
      };

      const resetToInitial = () => {
        if (!map || !initialState) return;
        map.setCenter(initialState.center);
        map.setZoom(initialState.zoom);
        if (initialState.heading !== null) map.setHeading(initialState.heading);
        if (initialState.tilt !== null) map.setTilt(initialState.tilt);
      };

      const centerOnLocation = () => {
        if (!navigator.geolocation) {
          alert("Geolocalizaci\xF3n no disponible");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map?.setCenter(pos);
            map?.setZoom(15);
          },
          () => alert("Error al obtener ubicaci\xF3n")
        );
      };

      useEffect(() => {
        if (!map) return;

        setLoaded(true);

        // Estado inicial
        const initialZoom = map.getZoom();
        const initialCenter = map.getCenter()?.toJSON();
        const initialHeading = map.getHeading();
        const initialTilt = map.getTilt();

        setInitialState({
          zoom: initialZoom,
          center: initialCenter,
          heading: initialHeading,
          tilt: initialTilt
        });

        setZoom(initialZoom);
        setCenter(initialCenter);
        setMapTypeId(map.getMapTypeId());
        setHeading(initialHeading);
        setTilt(initialTilt);

        // Intentar obtener gestureHandling y mapId
        try {
          const gh = map.get('gestureHandling');
          setGestureHandling(gh || 'auto');
        } catch (e) {
          setGestureHandling('unknown');
        }

        try {
          const mId = map.get('mapId');
          setMapId(mId || 'none');
        } catch (e) {
          setMapId('none');
        }

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

        const boundsListener = map.addListener("bounds_changed", () => {
          const b = map.getBounds();
          if (b) {
            setBounds({
              north: b.getNorthEast().lat(),
              south: b.getSouthWest().lat(),
              east: b.getNorthEast().lng(),
              west: b.getSouthWest().lng()
            });
          }
        });

        const tiltListener = map.addListener("tilt_changed", () => {
          setTilt(map.getTilt());
        });

        const headingListener = map.addListener("heading_changed", () => {
          setHeading(map.getHeading());
        });

        const maptypeListener = map.addListener("maptypeid_changed", () => {
          setMapTypeId(map.getMapTypeId());
        });

        return () => {
          google.maps.event.removeListener(mouseMoveListener);
          google.maps.event.removeListener(clickListener);
          google.maps.event.removeListener(zoomListener);
          google.maps.event.removeListener(centerListener);
          google.maps.event.removeListener(boundsListener);
          google.maps.event.removeListener(tiltListener);
          google.maps.event.removeListener(headingListener);
          google.maps.event.removeListener(maptypeListener);
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
            fontSize: "11px",
            zIndex: 999999,
            width: expanded ? "320px" : "auto",
            maxHeight: "90vh",
            overflow: "auto",
            lineHeight: "1.4",
            backdropFilter: "blur(8px)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            transition: "width 0.3s ease, opacity 0.3s ease"
          }
        },
        // Header
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px"
            }
          },
          React.createElement("div", { style: { fontWeight: "bold", fontSize: "16px" }}, "\u{1F4CD} Google Maps Devtools"),
          React.createElement(
            "button",
            {
              style: {
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "24px",
                padding: "0",
                marginLeft: "10px",
                lineHeight: "1",
                transition: "transform 0.3s ease",
                transform: expanded ? "rotate(0deg)" : "rotate(180deg)"
              },
              onClick: () => setExpanded(!expanded)
            },
            expanded ? "\u2212" : "+"
          )
        ),

        // Keyframes para la animaci\xF3n
        React.createElement("style", null, \`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        \`),

        // Contenido expandible
        expanded && React.createElement(
          "div",
          {
            style: {
              animation: "fadeIn 0.3s ease",
              overflow: "hidden"
            }
          },

          // API Info
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "API Key:"), " ${apiKey.slice(0, 5)}...****"
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Libraries:"), " ${libraries.join(", ")}"
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Map Loaded:"), " " + (loaded ? "Yes" : "No")
          ),

          React.createElement("hr", { style: { border: "none", borderTop: "1px solid #fff3", margin: "8px 0" }}),

          // Map Config
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Map ID:"), " " + (mapId || "none")
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Type:"), " " + (mapTypeId || "-")
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Gesture Handling:"), " " + (gestureHandling || "-")
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Tilt:"), " " + (tilt ?? "-") + "\xB0"
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Heading:"), " " + (heading ?? "-") + "\xB0"
          ),

          React.createElement("hr", { style: { border: "none", borderTop: "1px solid #fff3", margin: "8px 0" }}),

          // Map State
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Zoom:"), " " + (zoom ?? "-")
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Center:"), " " + (center ? \`\${center.lat.toFixed(5)}, \${center.lng.toFixed(5)}\` : "-")
          ),

          bounds && React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Bounds:"), " N: " + bounds.north.toFixed(3) + " S: " + bounds.south.toFixed(3)
          ),

          React.createElement("hr", { style: { border: "none", borderTop: "1px solid #fff3", margin: "8px 0" }}),

          // Interaction
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Mouse:"), " " + (mouseLatLng ? \`\${mouseLatLng.lat.toFixed(5)}, \${mouseLatLng.lng.toFixed(5)}\` : "-")
          ),
          React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Click:"), " " + (clickedLatLng ? \`\${clickedLatLng.lat.toFixed(5)}, \${clickedLatLng.lng.toFixed(5)}\` : "-")
          ),

          placeName && React.createElement("div", null,
            React.createElement("span", { style: { fontSize: "14px" }}, "Place:"), " " + placeName
          ),

          React.createElement("hr", { style: { border: "none", borderTop: "1px solid #fff3", margin: "8px 0" }}),

          // Buttons
          React.createElement(
            "div",
            { style: { display: "flex", gap: "6px", marginTop: "4px", flexWrap: "wrap" }},

            clickedLatLng && React.createElement(
              "button",
              {
                style: {
                  flex: "1",
                  minWidth: "90px",
                  padding: "8px",
                  background: "#22c55e",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                },
                onClick: copyCoords
              },
              "Copy Coords"
            ),

            React.createElement(
              "button",
              {
                style: {
                  flex: "1",
                  minWidth: "90px",
                  padding: "8px",
                  background: "#3b82f6",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                },
                onClick: copyConfig
              },
              "Copy Config"
            ),

            React.createElement(
              "button",
              {
                style: {
                  flex: "1",
                  minWidth: "90px",
                  padding: "8px",
                  background: "#f59e0b",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                },
                onClick: centerOnLocation
              },
              "My Location"
            ),

            initialState && React.createElement(
              "button",
              {
                style: {
                  flex: "1",
                  minWidth: "90px",
                  padding: "8px",
                  background: "#ef4444",
                  color: "#000",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12px",
                },
                onClick: resetToInitial
              },
              "Reset"
            )
          )
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