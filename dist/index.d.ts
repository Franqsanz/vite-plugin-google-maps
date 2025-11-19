import { Plugin } from 'vite';

/**
 * Default options for the Google Map component.
 * These values will be applied to all Map instances unless overridden.
 */
interface MapDefaultOptions {
    /**
     * The Map ID associated with a specific map style or feature.
     * @see https://developers.google.com/maps/documentation/get-map-id
     */
    mapId?: string;
    /**
     * Controls how the map responds to gestures on mobile devices and desktops.
     * - `cooperative`: Requires two-finger pan/zoom on mobile, scroll with ctrl/cmd on desktop
     * - `greedy`: Always allows panning and zooming
     * - `none`: Disables all gestures
     * - `auto`: Automatically adjusts based on page scrollability
     * @default 'auto'
     */
    gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    /**
     * The initial center position of the map.
     * @example { lat: 40.7128, lng: -74.0060 }
     */
    defaultCenter?: {
        lat: number;
        lng: number;
    };
    /**
     * The initial zoom level of the map.
     * Valid range is typically 0 (world view) to 22 (street level).
     * @default 8
     */
    defaultZoom?: number;
    /**
     * Whether to display the fullscreen control button.
     * @default false
     */
    fullscreenControl?: boolean;
    /**
     * If true, disables all default UI controls.
     * Individual controls can still be enabled explicitly.
     * @default false
     */
    disableDefaultUI?: boolean;
    /**
     * Whether to display the zoom control buttons (+/-).
     * @default true
     */
    zoomControl?: boolean;
    /**
     * Whether to display the map type control (Map/Satellite).
     * @default false
     */
    mapTypeControl?: boolean;
    /**
     * Whether to display the scale control.
     * @default false
     */
    scaleControl?: boolean;
    /**
     * Whether to display the Street View pegman control.
     * @default true
     */
    streetViewControl?: boolean;
    /**
     * Whether to display the rotate control for 45° imagery.
     * @default false
     */
    rotateControl?: boolean;
}
/**
 * Configuration options for the Google Maps Vite Plugin.
 */
interface GoogleMapsPluginOptions {
    /**
     * Your Google Maps API key.
     * @see https://developers.google.com/maps/documentation/javascript/get-api-key
     */
    apiKey: string;
    /**
     * Additional Google Maps libraries to load.
     * @example ['places', 'drawing', 'geometry']
     * @default ['places']
     */
    libraries?: string[];
    /**
     * Enable debug mode to show the developer tools panel.
     * Displays map info, coordinates, zoom level, and click events.
     * @default false
     */
    debug?: boolean;
    /**
     * Default options to apply to all Map components.
     * These can be overridden on individual Map instances.
     */
    mapDefaults?: MapDefaultOptions;
}

declare function GoogleMapsPlugin(options: GoogleMapsPluginOptions): Plugin;

export { GoogleMapsPlugin };
