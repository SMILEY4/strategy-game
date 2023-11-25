import {RenderModule} from "../renderModule";
import {Camera} from "../../shared/webgl/camera";
import {RenderData} from "../data/renderData";
import {Stamp} from "../data/builders/stamps/stamp";

export class StampRenderer implements RenderModule {

    private containerElement: HTMLElement | null = null;

    public initialize(): void {
        this.containerElement = document.getElementById("game-canvas-overlay");
    }

    public dispose(): void {
    }

    public render(camera: Camera, data: RenderData): void {
        if (this.containerElement && data.stamps.dirty) {

            const elementPool = this.prepareElements(this.containerElement, data.stamps.items.length);

            for (let i = 0, n = data.stamps.items.length; i < n; i++) {
                const stamp = data.stamps.items[i];
                const pooledElement = elementPool[i];
                this.configure(stamp, pooledElement);
            }

            // this.containerElement.replaceChildren(...elementPool);
        }
    }

    private prepareElements(container: HTMLElement, required: number): HTMLElement[] {
        const sizeDiff = required - container.childElementCount;

        if (Math.abs(sizeDiff) < 100) {

            if (sizeDiff < 0) {
                for (let i = -sizeDiff; i >= 0; i--) {
                    container.children.item(required + i)?.remove();
                }
            }
            if (sizeDiff > 0) {
                for (let i = 0; i < sizeDiff; i++) {
                    container.appendChild(document.createElement("div"));
                }
            }
            const pool = [...container.children];
            // container.replaceChildren();
            return pool as HTMLElement[];

        } else {

            const elements: HTMLElement[] = []
            for(let i=0; i<required; i++) {
                elements.push(document.createElement("div"))
            }
            container.replaceChildren(...elements);
            return elements
        }


    }

    private configure(stamp: Stamp, element: HTMLElement): HTMLElement {
        switch (stamp.type) {
            case "icon":
                return this.configureIcon(stamp.screenX, stamp.screenY, stamp.content, element);
            case "text":
                return this.configureLabel(stamp.screenX, stamp.screenY, stamp.content, element);
        }
    }

    private configureLabel(x: number, y: number, label: string, element: HTMLElement): HTMLElement {
        element.className = "world-ui__label";
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.backgroundImage = "";
        element.textContent = label;
        return element;
    }

    private configureIcon(x: number, y: number, icon: string, element: HTMLElement): HTMLElement {
        element.className = "world-ui__icon";
        element.style.left = x + "px";
        element.style.top = y + "px";
        element.style.backgroundImage = "url('" + icon + "')";
        element.textContent = "";
        return element;
    }

}