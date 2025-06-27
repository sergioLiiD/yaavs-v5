/// <reference types="@types/google.maps" />

declare module '@googlemaps/js-api-loader' {
  export class Loader {
    constructor(options: {
      apiKey: string;
      version: string;
      libraries?: string[];
    });
    load(): Promise<typeof google>;
  }
}

declare global {
  interface Window {
    google: typeof google;
  }
} 