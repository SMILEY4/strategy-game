export interface InputHandler {
	onMouseMove: (dx: number, dy: number, x: number, y: number, isLeftDown: boolean) => void;
	onMouseScroll: (d: number) => void;
	onMouseClick: (x: number, y: number) => void;
}