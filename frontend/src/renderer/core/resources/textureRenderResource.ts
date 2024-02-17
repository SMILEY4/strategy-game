import {RenderResourceConfig} from "./renderResource";

export namespace TextureResource {

    export function generateId(config: TextureConfig): string {
        return config.path
    }

}

export interface TextureConfig extends RenderResourceConfig {
    /**
     * this resource is of type "texture"
     */
    type: "texture",
    /**
     * the filepath for this texture
     */
    path: string
}

export interface TextureInputConfig extends TextureConfig {
    /**
     * the binding name in the shader
     */
    binding: string;
}

