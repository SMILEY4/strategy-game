export class KeyboardTracker {
    private pressedKeys = new Set<string>();

    constructor() {
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
        // otherwise keys get stuck "down" dforever.
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
        if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)) {
            event.preventDefault();
        }
        this.pressedKeys.add(event.key.toLowerCase());
    }

    private handleKeyUp(event: KeyboardEvent): void {
        this.pressedKeys.delete(event.key.toLowerCase());
    }

    private handleBlur(): void {
        this.pressedKeys.clear();
    }
}