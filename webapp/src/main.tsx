import {createRoot} from "react-dom/client";
import {Canvas} from "@uicomponents/canvas/Canvas.tsx";
import "./main.less";
import {WebGlRenderGraph} from "@rendergraph/render-graph.ts";
import {RenderGraphBuilder} from "@rendergraph/render-graph-builder.ts";
import {GlAttributeType} from "@rendergraph/webgl/gl-program.ts";
import SHADER_VERT from "./shader.vsh?raw";
import SHADER_FRAG from "./shader.fsh?raw";
import {vec2, vec3} from "gl-matrix";
import {HexUtils} from "@/common/hexUtils.ts";


class KeyboardTracker {
    private pressedKeys = new Set<string>();

    constructor() {
        // Bind methods to maintain 'this' context when used as event listeners
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    /**
     * Attaches event listeners to the window document.
     */
    public listen(): void {
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        // CRITICAL: Clear keys if user tabs out of the browser,
        // otherwise keys get stuck "down" forever.
        window.addEventListener("blur", this.handleBlur);
    }

    /**
     * Cleans up event listeners to prevent memory leaks (e.g., when a React component unmounts).
     */
    public dispose(): void {
        window.removeEventListener("keydown", this.handleKeyDown);
        window.removeEventListener("keyup", this.handleKeyUp);
        window.removeEventListener("blur", this.handleBlur);
        this.pressedKeys.clear();
    }

    /**
     * Exposes the read-only set of currently pressed keys to pass into your camera controller.
     */
    public getKeys(): Set<string> {
        return this.pressedKeys;
    }

    private handleKeyDown(event: KeyboardEvent): void {
        // Prevent default actions for common game inputs (like spacebar/arrow keys scrolling the webpage)
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
            event.preventDefault();
        }

        // Use event.key for letter matching ('w', 'a', 's', 'd')
        this.pressedKeys.add(event.key.toLowerCase());
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.pressedKeys.delete(event.key.toLowerCase());
    }

    private handleBlur(): void {
        this.pressedKeys.clear();
    }
}

interface CameraState {
    position: [number, number, number];
    direction: [number, number, number];
    up: [number, number, number];
}

class FlyCameraController {
    // Camera Vectors
    private position = vec3.fromValues(0, 0, 15);
    private forward = vec3.fromValues(0, 0, -1);
    private right = vec3.fromValues(1, 0, 0);
    private up = vec3.fromValues(0, 0, 1);

    // Rotation Angles (in radians)
    private yaw: number = -Math.PI / 2; // Looking down -Z initially
    private pitch: number = 0;

    // Movement Settings
    private moveSpeed = 0.5;
    private lookSensitivity = 0.005;

    // State tracking for drag calculations
    private lastMouseX: number | null = null;
    private lastMouseY: number | null = null;

    constructor(initialPosition?: [number, number, number]) {
        if (initialPosition) {
            this.position = vec3.fromValues(...initialPosition);
        }
        this.updateCameraVectors();
    }

    /**
     * Call this inside your requestAnimationFrame or render loop to poll keys
     * and apply smooth movement. Pass an array or set of currently pressed keys.
     */
    public updateMovement(pressedKeys: Set<string>) {
        const moveDir = vec3.create();

        if (pressedKeys.has("w") || pressedKeys.has("W")) {
            vec3.add(moveDir, moveDir, this.forward);
        }
        if (pressedKeys.has("s") || pressedKeys.has("S")) {
            vec3.sub(moveDir, moveDir, this.forward);
        }
        if (pressedKeys.has("a") || pressedKeys.has("A")) {
            vec3.sub(moveDir, moveDir, this.right);
        }
        if (pressedKeys.has("d") || pressedKeys.has("D")) {
            vec3.add(moveDir, moveDir, this.right);
        }

        // Optional: Q/E for vertical flying (Up/Down)
        if (pressedKeys.has("e") || pressedKeys.has("E")) {
            vec3.add(moveDir, moveDir, this.up);
        }
        if (pressedKeys.has("q") || pressedKeys.has("Q")) {
            vec3.sub(moveDir, moveDir, this.up);
        }

        if (vec3.length(moveDir) > 0) {
            vec3.normalize(moveDir, moveDir);
            vec3.scaleAndAdd(this.position, this.position, moveDir, this.moveSpeed);
        }
    }

    /**
     * Mouse Move Handler: Handles look-around when dragging.
     * Maps perfectly to your onMouseMove hook configuration.
     */
    public handleMouseMove(_mx: number, _my: number, x: number, y: number, buttons: number) {
        // buttons === 1 means Left Mouse Button is down (Standard drag-to-look)
        // Adjust this bit if you prefer Right Click (2) or Middle Click (4) like Blender
        if ((buttons & 1) === 0) {
            this.lastMouseX = null;
            this.lastMouseY = null;
            return;
        }

        if (this.lastMouseX !== null && this.lastMouseY !== null) {
            const deltaX = x - this.lastMouseX;
            const deltaY = y - this.lastMouseY;

            this.yaw += deltaX * this.lookSensitivity;
            this.pitch -= deltaY * this.lookSensitivity; // Inverted so dragging up looks up

            // Clamp pitch to prevent the camera from flipping upside down (gymbal lock)
            const maxPitch = Math.PI / 2 - 0.05;
            if (this.pitch > maxPitch) this.pitch = maxPitch;
            if (this.pitch < -maxPitch) this.pitch = -maxPitch;

            this.updateCameraVectors();
        }

        this.lastMouseX = x;
        this.lastMouseY = y;
    }

    /**
     * Scroll Handler: Useful for controlling move speed or FOV zoom.
     */
    public handleMouseScroll(scroll: number) {
        // Scroll to change movement speed dynamically
        this.moveSpeed += scroll * -0.05;
        this.moveSpeed = Math.max(0.05, Math.min(this.moveSpeed, 5.0));
    }

    /**
     * Computes the final matrix-ready parameters out of the internal rotations
     */
    private updateCameraVectors() {
        const front = vec3.create();
        front[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
        front[1] = Math.sin(this.pitch);
        front[2] = Math.sin(this.yaw) * Math.cos(this.pitch);

        vec3.normalize(this.forward, front);

        // Calculate Right and Up vectors (assuming world Up is [0, 1, 0])
        const worldUp = vec3.fromValues(0, 1, 0);
        vec3.cross(this.right, this.forward, worldUp);
        vec3.normalize(this.right, this.right);

        vec3.cross(this.up, this.right, this.forward);
        vec3.normalize(this.up, this.up);
    }

    /**
     * Returns the structured variables your g.cameraPerspective configuration needs.
     */
    public getCameraState(): CameraState {
        return {
            position: [this.position[0], this.position[1], this.position[2]],
            direction: [this.forward[0], this.forward[1], this.forward[2]],
            up: [this.up[0], this.up[1], this.up[2]]
        };
    }
}

const keyboardTracker = new KeyboardTracker()
const cameraController = new FlyCameraController();

const g = new RenderGraphBuilder();

const canvasSize = g.canvasSize();

const tileMeshTransformer = g.transformVertexOut({
    inputs: [],
    outputs: {
        mesh: {
            content: "vertices",
            layout: [
                {
                    name: "vertexPosition",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 3,
                },
            ],
        },
    },
    func: () => {

        const buffer = new ArrayBuffer(6 * 3 * 3 * GlAttributeType.FLOAT.bytes);
        const view = new DataView(buffer);
        let viewCounter = 0;

        function pushFloat32(value: number) {
            view.setFloat32(viewCounter, value, true);
            viewCounter += GlAttributeType.FLOAT.bytes;
        }

        function pushFloat32Vec3(x: number, y: number, z: number) {
            pushFloat32(x);
            pushFloat32(y);
            pushFloat32(z);
        }

        const center = vec2.fromValues(0, 0);
        const pointerA = vec2.fromValues(0, 1);
        const pointerB = vec2.fromValues(0, 1);
        vec2.rotate(pointerB, pointerB, center, deg2rad(60));

        for (let i = 0; i < 6; i++) {
            pushFloat32Vec3(0, 0, 0);
            pushFloat32Vec3(pointerA[0], pointerA[1], 0);
            pushFloat32Vec3(pointerB[0], pointerB[1], 0);
            vec2.rotate(pointerA, pointerA, center, deg2rad(60));
            vec2.rotate(pointerB, pointerB, center, deg2rad(60));
        }

        return {
            "mesh": {
                data: buffer,
                count: 6 * 3,
            },
        };
    },
});

const tileInstanceTransformer = g.transformVertexOut({
    inputs: [],
    outputs: {
        instances: {
            content: "instances",
            layout: [
                {
                    name: "tilePosition",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                },
                {
                    name: "chunkPosition",
                    type: GlAttributeType.FLOAT,
                    amountComponents: 2,
                },
            ],
        },
    },
    func: () => {

        const tiles = HexUtils.generateTiles(100);

        const chunks = HexUtils.generateChunks(tiles, 4)

        const buffer = new ArrayBuffer(tiles.length * 4 * GlAttributeType.FLOAT.bytes);
        const view = new DataView(buffer);
        let viewCounter = 0;

        function pushFloat32(value: number) {
            view.setFloat32(viewCounter, value, true);
            viewCounter += GlAttributeType.FLOAT.bytes;
        }

        function pushFloat32Vec2(x: number, y: number) {
            pushFloat32(x);
            pushFloat32(y);
        }

        for (let i = 0, n = tiles.length; i < n; i++) {
            const tile = tiles[i];
            pushFloat32Vec2(tile.q, tile.r);

            const chunk = chunks.find(c => c.tiles.some(t => t.q === tile.q && t.r === tile.r));
            pushFloat32Vec2(chunk?.centerQ ?? 0, chunk?.centerR ?? 0);
        }

        return {
            "instances": {
                data: buffer,
                count: tiles.length,
            },
        };
    },
});

const geometry = g.geometry({
    sources: [
        g.geometrySource({
            source: tileMeshTransformer,
            output: "mesh",
        }),
        g.geometrySource({
            source: tileInstanceTransformer,
            output: "instances",
        }),
    ],
});

const camera = g.cameraPerspective({
    renderTargetSize: canvasSize,
    up: g.data({
        source: {
            type: "external",
            fetch: () => cameraController.getCameraState().up,
            checkIsNew: () => true,
        }
    }),
    position: g.data({
       source: {
           type: "external",
           fetch: () => cameraController.getCameraState().position,
           checkIsNew: () => true,
       }
    }),
    direction: g.data({
        source: {
            type: "external",
            fetch: () => cameraController.getCameraState().direction,
            checkIsNew: () => true,
        }
    }),
    // up: g.dataConst([0, 0, 1]),
    // position: g.dataConst([0, 0, 15]),
    // direction: g.dataConst([0, 0, -1]),
    fov: g.dataConst(80),
    near: g.dataConst(0.1),
    far: g.dataConst(10000),
});

const shader = g.shader({
    srcVertex: SHADER_VERT,
    srcFragment: SHADER_FRAG,
    prefixUniforms: "u_",
    prefixVertexAttributes: "in_",
});

const draw = g.draw({
    shader: shader,
    geometry: geometry,
    inputs: {
        "camera": camera,
    },
});

g.canvas({
    renderPasses: [draw],
    depthTesting: true,
    clearColor: [0, 0, 0, 0],
});

const renderGraph = WebGlRenderGraph.build(g.getNodes());

createRoot(document.getElementById("root") || document.createElement("div")).render(
    <>
        <Canvas
            onInitialize={canvas => renderGraph.initializeCanvas(canvas)}
            onUpdate={() => {
                cameraController.updateMovement(keyboardTracker.getKeys())
                renderGraph.execute();
            }}
            onResize={canvas => renderGraph.onResizeCanvas(canvas)}
            onDispose={() => renderGraph.dispose()}
            onMouseMove={(mx, my, x, y, buttons) => cameraController.handleMouseMove(mx, my, x, y, buttons)}
        />
    </>,
);

keyboardTracker.listen()

function deg2rad(degrees: number): number {
    return degrees * (Math.PI / 180);
}