import {MouseEvent, useEffect, useRef, WheelEvent} from "react";
import {AppCtx} from "../../../../appContext";
import "./canvas.less";


export function Canvas() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationId = useRef<number>();
    const hasContext = useRef<boolean>(true);
    const mouseDownInCanvas = useRef<boolean>(false);
    const timestampMouseDown = useRef<number>(0);

    const gameLoopService = AppCtx.GameLoopService();

    useEffect(() => {
        if (canvasRef.current) {
            resizeCanvas(canvasRef.current);
            addEventListener("resize", handleResize);
            canvasRef.current.addEventListener("webglcontextlost", handleContextLoss);
            canvasRef.current.addEventListener("webglcontextrestored", handleContextRestored);
            initialize(canvasRef.current);
            return () => {
                onDispose();
                removeEventListener("resize", handleResize);
                canvasRef.current?.removeEventListener("webglcontextlost", handleContextLoss);
                canvasRef.current?.removeEventListener("webglcontextrestored", handleContextRestored);
            };
        }
    }, []);


    function handleContextLoss(e: any) {
        console.log("Detected webgl-context loss");
        e.preventDefault();
        hasContext.current = false;
    }

    function handleContextRestored() {
        console.log("Detected webgl-context restore");
        hasContext.current = true;
        canvasRef.current && initialize(canvasRef.current);
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
            if (hasContext.current) {
                onRender();
                animationId.current = requestAnimationFrame(renderLoop);
            } else {
                animationId.current && cancelAnimationFrame(animationId.current);
            }
        }
    }

    function mouseMove(e: MouseEvent) {
        gameLoopService.mouseMove(
            e.movementX,
            e.movementY,
            e.clientX,
            e.clientY,
            e.buttons === 1 && mouseDownInCanvas.current
        );
    }

    function mouseDown(e: MouseEvent) {
        mouseDownInCanvas.current = true;
        timestampMouseDown.current = Date.now();
    }

    function mouseUp(e: MouseEvent) {
        mouseDownInCanvas.current = false;
        click(Date.now() - timestampMouseDown.current, e);
        timestampMouseDown.current = 0;
    }

    function mouseLeave(e: MouseEvent) {
        mouseDownInCanvas.current = false;
    }

    function scroll(e: WheelEvent) {
        gameLoopService.mouseScroll(e.deltaY, e.clientX, e.clientY);
    }

    function click(duration: number, e: MouseEvent) {
        if (duration < 150) {
            gameLoopService.mouseClick(e.clientX, e.clientY).then(_ => undefined);
        }
    }

    function onInitialize(canvas: HTMLCanvasElement) {
        gameLoopService.initialize(canvas)
    }

    function onRender() {
        gameLoopService.update();
    }

    function onDispose() {
        gameLoopService.dispose();
    }

    return (
        <div
            className="game-canvas"
            onMouseMove={mouseMove}
            onMouseDown={mouseDown}
            onMouseUp={mouseUp}
            onWheel={scroll}
            onMouseLeave={mouseLeave}
        >
            <canvas ref={canvasRef}/>
            <div id="game-canvas-overlay"/>
        </div>
    );
}