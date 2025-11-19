declare module "virtual:google-maps-auto-provider" {
  const x: any;
  export default x;
  }

declare module "virtual:google-maps-theme" {
  export function useAutoMapTheme(): void;
  export const darkStyle: any;
}

declare module "virtual:google-maps-devtools" {
  export function GoogleMapsDevtools(): any;
}

declare module "virtual:google-maps" {
  export const __GMAPS_PLUGIN__: boolean;

  export function GoogleMapsProvider(props: {
    children: React.ReactNode;
  }): JSX.Element;

  export function GoogleMapsDevtools(): JSX.Element | null;
}
