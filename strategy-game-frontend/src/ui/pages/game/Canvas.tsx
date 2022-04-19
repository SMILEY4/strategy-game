import "./canvas.css";
import {MouseEvent, useEffect, useRef, WheelEvent} from "react";
import {DISTRIBUTOR} from "../../../main";


function Canvas() {

	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	useEffect(() => {
		if (canvasRef.current) {
			resizeCanvas(canvasRef.current);
			addEventListener("resize", handleResize);
			initialize(canvasRef.current);
			return () => {
				onDispose();
				removeEventListener("resize", handleResize);
			};
		}
	}, []);

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

		function renderLoop() {
			onRender();
			requestAnimationFrame(renderLoop);
		}

		renderLoop();
	}

	function mouseMove(e: MouseEvent) {
		DISTRIBUTOR.gameInputMouseMove(
			e.clientX,
			e.clientY,
			e.movementX,
			e.movementY,
			(e.target as any).clientWidth,
			(e.target as any).clientHeight,
			e.buttons === 1,
			e.buttons === 2
		);
	}

	function scroll(e: WheelEvent) {
		DISTRIBUTOR.gameInputMouseScroll(e.deltaY, e.clientX, e.clientY);
	}

	function mouseLeave() {
		DISTRIBUTOR.gameInputMouseLeave();
	}

	function click(e: MouseEvent) {
		DISTRIBUTOR.gameInputMouseClick(
			e.clientX,
			e.clientY,
			(e.target as any).clientWidth,
			(e.target as any).clientHeight
		);
	}

	function onInitialize(canvas: HTMLCanvasElement) {
		DISTRIBUTOR.gameInitialize(canvas);
	}

	function onRender() {
		DISTRIBUTOR.gameRender();
	}

	function onDispose() {
		DISTRIBUTOR.gameDestroy();
	}

	return (
		<div className="game-canvas" onMouseMove={mouseMove} onWheel={scroll} onMouseLeave={mouseLeave} onClick={click}>
			<canvas ref={canvasRef}/>
		</div>
	);
}

export default Canvas;
