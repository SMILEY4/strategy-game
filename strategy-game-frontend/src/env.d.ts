/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly PUB_BACKEND_URL: string;
	readonly PUB_BACKEND_WEBSOCKET_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
