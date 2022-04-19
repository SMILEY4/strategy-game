export interface InputState {
	canvasBounds: null | {
		width: number,
		height: number
	}
	mousePosition: null | {
		x: number,
		y: number
	},
	mouseMovement: null | {
		dx: number,
		dy: number
	},
	mouseScroll: null | number,
	isMouseLeftDown: boolean,
	isMouseRightDown: boolean,
	isMouseClick: boolean,
}


export class InputHandler {

	private inputState: InputState = {
		canvasBounds: null,
		mousePosition: null,
		mouseMovement: null,
		mouseScroll: null,
		isMouseLeftDown: false,
		isMouseRightDown: false,
		isMouseClick: false
	};

	public reset() {
		this.inputState = {
			canvasBounds: null,
			mousePosition: null,
			mouseMovement: null,
			mouseScroll: null,
			isMouseLeftDown: false,
			isMouseRightDown: false,
			isMouseClick: false
		};
	}


	public onMouseMove(x: number, y: number, dx: number, dy: number, width: number, height: number, btnLeftDown: boolean, btnRightDown: boolean) {
		this.inputState.mouseMovement = {
			dx: dy,
			dy: dy
		};
		this.inputState.mousePosition = {
			x: x,
			y: y
		};
		this.inputState.isMouseLeftDown = btnLeftDown;
		this.inputState.isMouseRightDown = btnRightDown;
		this.inputState.canvasBounds = {
			width: width,
			height: height
		};
	}

	public onMouseScroll(delta: number, x: number, y: number) {
		this.inputState.mousePosition = {
			x: x,
			y: y
		};
		this.inputState.mouseScroll = delta;
	}

	public onMouseLeave() {
		this.inputState.mouseMovement = null;
		this.inputState.mousePosition = null;
	}

	public onMouseClick(x: number, y: number, width: number, height: number) {
		this.inputState.mousePosition = {
			x: x,
			y: y
		};
		this.inputState.isMouseClick = true;
		this.inputState.canvasBounds = {
			width: width,
			height: height
		};
	}

}