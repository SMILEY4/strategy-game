/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_APP_TITLE: string;
	readonly PUB_BACKEND_URL: string;
	readonly PUB_BACKEND_WEBSOCKET_URL: string;
	readonly PUB_DEV_USERNAME: string;
	readonly PUB_DEV_PASSWORD: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
