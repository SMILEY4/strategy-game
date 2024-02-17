export type RenderResourceType = "render-target" | "texture" | "vertexdata" | "shader" | "property";


export interface RenderResourceConfig {
    /**
     * the type of the resource
     */
    type: RenderResourceType;
}
