import {RenderResourceConfig} from "./renderResource";

export namespace RenderTargetResource {

    export function generateId(config: RenderTargetConfig): string {
        return config.name
    }

}

export interface RenderTargetConfig extends RenderResourceConfig {
    /**
     * this resource is of type "render-target"
     */
    type: "render-target",
    /**
     * the identifying name of the render-target
     */
    name: string,
}

export interface RenderTargetInputConfig extends RenderTargetConfig {
    /**
     * the binding name in the shader
     */
    binding: string;
}


export interface RenderTargetOutputConfig extends RenderTargetConfig {
    /**
     * the size of the render target, either in pixel or as a percentage of the current screen size
     */
    size: RenderTargetAbsoluteSize | RenderTargetRelativeSize
}

export interface RenderTargetAbsoluteSize {
    /**
     * the width in pixel
     */
    pxWidth: number,
    /**
     * the height in pixel
     */
    pxHeight: number,
}


export interface RenderTargetRelativeSize {
    /**
     * the width as a fraction of the screen size
     * E.g. 0.5 = 50% of screen width, 1 = 100% of screen width, 2 = 200% of screen width
     */
    fractionWidth: number,
    /**
     * the height as a fraction of the screen size
     * E.g. 0.5 = 50% of screen height, 1 = 100% of screen height, 2 = 200% of screen height
     */
    fractionHeight: number,
}