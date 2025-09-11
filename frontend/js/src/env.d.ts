/// <reference types="vite/client" />

// Warning: all values are read in as string, no matter the type defined here !!!
interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly PUB_BACKEND_URL: string;
	readonly PUB_BACKEND_WEBSOCKET_URL: string;
	readonly PUB_ENABLE_WEBGL_ERROR_CHECKING: string;
	readonly PUB_ENABLE_RENDERER_MONITORING: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
