/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOUNDRY_PROJECT_ENDPOINT: string;
  readonly VITE_ENTRA_CLIENT_ID: string;
  readonly VITE_ENTRA_TENANT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent;
  export default component;
}
