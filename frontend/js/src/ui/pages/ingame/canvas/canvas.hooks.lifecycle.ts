import {useEffect, useRef} from "react";
import {GameService} from "../../../../app/game/game.service";

export function useCanvasLifecycle() {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationId = useRef<number>();
    const hasContext = useRef<boolean>(true);


    useEffect(() => {
        if (canvasRef.current) {
            resizeCanvas(canvasRef.current);
            addEventListener("resize", onResize);
            canvasRef.current.addEventListener("webglcontextlost", onContextLoss);
            canvasRef.current.addEventListener("webglcontextrestored", onContextRestored);
            initialize(canvasRef.current);
            return () => {
                onDispose();
                removeEventListener("resize", onResize);
                canvasRef.current?.removeEventListener("webglcontextlost", onContextLoss);
                canvasRef.current?.removeEventListener("webglcontextrestored", onContextRestored);
            };
        }
    }, []);

    function initialize(canvas: HTMLCanvasElement) {
        console.log("Initializing canvas");
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

    function resizeCanvas(canvas: HTMLCanvasElement) {
        const dpr = window.devicePixelRatio; // independent from e.g. "page zoom level"
        const displayWidth = Math.round(canvas.clientWidth * dpr);
        const displayHeight = Math.round(canvas.clientHeight * dpr);
        if (canvas.width != displayWidth || canvas.height != displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }


    function onInitialize(canvas: HTMLCanvasElement) {
        GameService.initialize(canvas);
    }

    function onContextLoss(e: any) {
        console.log("Detected webgl-context loss");
        e.preventDefault();
        hasContext.current = false;
    }

    function onContextRestored() {
        console.log("Detected webgl-context restore");
        hasContext.current = true;
        canvasRef.current && initialize(canvasRef.current);
    }

    function onResize() {
        if (canvasRef.current) {
            resizeCanvas(canvasRef.current);
        }
    }

    function onRender() {
        GameService.update();
    }

    function onDispose() {
        console.log("Disposing canvas");
        animationId.current && cancelAnimationFrame(animationId.current);
        GameService.dispose();
    }

    return {
        canvasRef: canvasRef,
    }
}