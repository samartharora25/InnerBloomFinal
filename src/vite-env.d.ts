/// <reference types="vite/client" />

declare module '*.riv' {
  const src: string;
  export default src;
}

declare namespace JSX {
  interface IntrinsicElements {
    'dotlottie-wc': any;
  }
}

