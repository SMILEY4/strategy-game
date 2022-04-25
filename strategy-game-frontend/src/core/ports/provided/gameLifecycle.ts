export interface GameLifecycle {
	initialize: (canvas: HTMLCanvasElement) => void;
	update: () => void;
	dispose: () => void;
}