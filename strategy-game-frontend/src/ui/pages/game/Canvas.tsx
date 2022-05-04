import "./canvas.css";
import {MouseEvent, useEffect, useRef, WheelEvent} from "react";
import {Game} from "../../../core/game";


export function Canvas() {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			resizeCanvas(canvasRef.current);
			addEventListener("resize", handleResize);
			canvasRef.current.addEventListener("webglcontextlost", handleContextLoss);
			initialize(canvasRef.current);
			return () => {
				onDispose();
				removeEventListener("resize", handleResize);
				canvasRef.current?.removeEventListener("webglcontextlost", handleContextLoss)
			};
		}
	}, []);

	function handleContextLoss() {
		console.log("DETECTED CONTEXT LOSS")
	}

	function handleResize() {
		if (canvasRef.current) {
			resizeCanvas(canvasRef.current);
		}
	}

	function resizeCanvas(canvas: HTMLCanvasElement) {
		const dpr = window.devicePixelRatio; // independent from e.g. "page zoom level"
		const displayWidth = Math.round(canvas.clientWidth * dpr);
		const displayHeight = Math.round(canvas.clientHeight * dpr);
		if (canvas.width != displayWidth || canvas.height != displayHeight) {
			canvas.width = displayWidth;
			canvas.height = displayHeight;
		}
	}

	function initialize(canvas: HTMLCanvasElement) {
		onInitialize(canvas);
		renderLoop();

		function renderLoop() {
			onRender();
			requestAnimationFrame(renderLoop);
		}
	}

	function mouseMove(e: MouseEvent) {
		Game.input.onMouseMove(
			e.movementX,
			e.movementY,
			e.clientX,
			e.clientY,
			e.buttons === 1
		);
	}

	function scroll(e: WheelEvent) {
		Game.input.onMouseScroll(e.deltaY);
	}

	function click(e: MouseEvent) {
		Game.input.onMouseClick(e.clientX, e.clientY);
	}

	function onInitialize(canvas: HTMLCanvasElement) {
		Game.lifecycle.initialize(canvas);
	}

	function onRender() {
		Game.lifecycle.update();
	}

	function onDispose() {
		Game.lifecycle.dispose();
	}

	return (
		<div className="game-canvas" onMouseMove={mouseMove} onWheel={scroll} onClick={click}>
			<canvas ref={canvasRef}/>
		</div>
	);
}