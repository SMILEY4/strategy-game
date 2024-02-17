import {RenderCommand} from "../compiler/renderCommand";
import {ProgramUniformEntry} from "./programUniformEntry";
import {WebGlResourceManager} from "./webglResourceManager";
import {BasicWebglVertexDataResource, InstancedWebglVertexDataResource} from "./webglVertexDataResource";


export namespace WebglRenderCommand {

    /**
     * Base webgl render command
     */
    export interface BaseCommand extends RenderCommand<WebGlResourceManager> {
    }

    /**
     * Bind a render-target to start rendering to  it
     */
    export class BindRenderTarget implements BaseCommand {

        private readonly name: string;

        constructor(name: string) {
            this.name = name;
        }

        public execute(context: WebGlResourceManager): void {
            context.getFramebuffer(this.name).bind();
        }
    }

    /**
     * Unbind a render-target to stop rendering to  it
     */
    export class UnbindRenderTarget implements BaseCommand {

        private readonly name: string;

        constructor(rtName: string) {
            this.name = rtName;
        }

        public execute(context: WebGlResourceManager): void {
            context.getFramebuffer(this.name).unbind();
        }
    }

    /**
     * Bind a texture to the given texture textureUnit
     */
    export class BindTexture implements BaseCommand {

        private readonly name: string;
        private readonly textureUnit: number;

        constructor(name: string, slot: number) {
            this.name = name;
            this.textureUnit = slot;
        }

        public execute(context: WebGlResourceManager): void {
            context.getTexture(this.name).bind(this.textureUnit);
        }
    }

    /**
     * Bind the texture of a render-target to the given texture textureUnit
     */
    export class BindRenderTargetTexture implements BaseCommand {

        private readonly name: string;
        private readonly textureUnit: number;

        constructor(name: string, slot: number) {
            this.name = name;
            this.textureUnit = slot;
        }

        public execute(context: WebGlResourceManager): void {
            context.getFramebuffer(this.name).bindTexture(this.textureUnit);
        }
    }

    /**
     * Bind a vertex-array to render it
     */
    export class BindVertexArray implements BaseCommand {

        private readonly name: string;

        constructor(name: string) {
            this.name = name;
        }

        public execute(context: WebGlResourceManager): void {
            context.getVertexData(this.name).getVertexArray().bind();
        }
    }

    /**
     * Unbind a vertex-array to stop using it
     */
    export class UnbindVertexArray implements BaseCommand {

        private readonly name: string;

        constructor(name: string) {
            this.name = name;
        }

        public execute(context: WebGlResourceManager): void {
            context.getVertexData(this.name).getVertexArray().unbind();
        }
    }

    /**
     * Start using the shader
     */
    export class UseShader implements BaseCommand {

        private readonly name: string;

        constructor(shaderName: string) {
            this.name = shaderName;
        }

        public execute(context: WebGlResourceManager): void {
            context.getProgram(this.name).use();
        }
    }

    /**
     * Set the shader uniform values
     */
    export class SetUniforms implements BaseCommand {

        private readonly name: string;
        private readonly uniforms: ProgramUniformEntry[];

        constructor(shaderName: string, uniforms: ProgramUniformEntry[]) {
            this.name = shaderName;
            this.uniforms = uniforms;
        }

        public execute(context: WebGlResourceManager): void {
            const program = context.getProgram(this.name);
            for (let i = 0; i < this.uniforms.length; i++) {
                const uniform = this.uniforms[i];
                if (uniform.valueConstant !== null) {
                    program.setUniform(uniform.binding, uniform.type, uniform.valueConstant);
                }
                if (uniform.valueProvider !== null) {
                    program.setUniform(uniform.binding, uniform.type, uniform.valueProvider());
                }
            }
        }
    }

    /**
     * Make a draw call
     */
    export class Draw implements BaseCommand {

        private readonly vertexDataName: string;

        constructor(vertexDataName: string) {
            this.vertexDataName = vertexDataName;
        }

        public execute(context: WebGlResourceManager): void {
            const data = context.getVertexData(this.vertexDataName);
            if (data instanceof BasicWebglVertexDataResource) {
                context.getRenderer().draw(data.getVertexCount());
                return;
            }
            if (data instanceof InstancedWebglVertexDataResource) {
                context.getRenderer().drawInstanced(data.getVertexCount(), data.getInstanceCount());
                return;
            }
        }
    }

}

