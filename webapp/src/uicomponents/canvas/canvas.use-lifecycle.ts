import {useCallback, useEffect, useRef} from "react";

export function useCanvasLifecycle(options: {
    onInitialize?: (canvas: HTMLCanvasElement) => void,
    onUpdate?: () => void,
    onDispose?: () => void,
}) {

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationId = useRef<number>(null);
    const hasContext = useRef<boolean>(true);

    const resizeCanvas = useCallback((canvas: HTMLCanvasElement) => {
        const dpr = window.devicePixelRatio; // independent of e.g. "page zoom level"
        const displayWidth = Math.round(canvas.clientWidth * dpr);
        const displayHeight = Math.round(canvas.clientHeight * dpr);
        if (canvas.width != displayWidth || canvas.height != displayHeight) {
            canvas.width = displayWidth;
            canvas.height = displayHeight;
        }
    }, []);

    const onInitialize = useCallback((canvas: HTMLCanvasElement) => {
        options.onInitialize?.(canvas);
    }, []);

    const onRender = useCallback(() => {
        options.onUpdate?.();
    }, []);

    const onResize = useCallback(() => {
        if (canvasRef.current) {
            resizeCanvas(canvasRef.current);
        }
    }, []);

    const onContextLoss = useCallback((e: Event) => {
        console.log("Detected webgl-context loss");
        e.preventDefault();
        hasContext.current = false;
    }, []);

    const initialize = useCallback((canvas: HTMLCanvasElement) => {
        console.log("Initializing canvas");
        onInitialize(canvas);
        renderLoop();

        function renderLoop() {
            if (hasContext.current) {
                onRender();
                animationId.current = requestAnimationFrame(renderLoop);
            } else {
                if (animationId.current) {
                    cancelAnimationFrame(animationId.current);
                }
            }
        }
    }, []);

    const onContextRestored = useCallback(() => {
        console.log("Detected webgl-context restore");
        hasContext.current = true;
        if (canvasRef.current) {
            initialize(canvasRef.current);
        }
    }, []);

    const onDispose = useCallback(() => {
        if (animationId.current) {
            cancelAnimationFrame(animationId.current);
        }
        options.onDispose?.();
    }, []);


    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            resizeCanvas(canvas);
            addEventListener("resize", onResize);
            canvas.addEventListener("webglcontextlost", onContextLoss);
            canvas.addEventListener("webglcontextrestored", onContextRestored);
            initialize(canvas);
            return () => {
                onDispose();
                removeEventListener("resize", onResize);
                canvas?.removeEventListener("webglcontextlost", onContextLoss);
                canvas?.removeEventListener("webglcontextrestored", onContextRestored);
            };
        }
    }, [initialize, onResize, resizeCanvas, onContextLoss, onContextRestored, onDispose]);

    return {
        canvasRef: canvasRef,
    };
}