import {RenderGraphCompiler} from "../graph/renderGraphCompiler";
import {WebGLRenderCommand} from "./webGLRenderCommand";
import {AbstractRenderNode} from "../graph/abstractRenderNode";
import {DrawRenderNode, DrawRenderNodeInput, DrawRenderNodeOutput} from "../graph/drawRenderNode";
import {VertexRenderNode} from "../graph/vertexRenderNode";
import {TextureBindingHandler} from "./textureBindingHandler";
import {ProgramUniformEntry} from "./programUniformEntry";
import {GLUniformType} from "../../../shared/webgl/glTypes";

export class WebGLRenderGraphCompiler implements RenderGraphCompiler<WebGLRenderCommand.Base> {

    /**
     * VertexRenderNode
     * - must have at least one vertex output
     * - all vertex outputs must have unique ids
     * DrawRenderNode
     * - must have exactly one vertex input
     * - must have exactly one shader input
     * - must have exactly one render target output
     */
    public validate(nodes: AbstractRenderNode[]): [boolean, string] {
        if (nodes.length === 0) {
            return [false, "graph is empty"];
        }
        for (let node of nodes) {
            if (node instanceof VertexRenderNode) {
                if (node.config.outputData.length === 0) {
                    return [false, "vertex-render-node " + node.id + " has no output defined"];
                }
                const distinctOutIds = node.config.outputData.map(it => it.id).distinct();
                if (node.config.outputData.length !== distinctOutIds.length) {
                    return [false, "vertex-render-node " + node.id + " has outputs with duplicate ids"];
                }
            }
            if (node instanceof DrawRenderNode) {
                const vertexInputCount = node.config.input.count(it => it instanceof DrawRenderNodeInput.VertexData);
                if (vertexInputCount !== 1) {
                    return [false, "draw-render-node " + node.id + " has amount of vertex-data-inputs =/= 1 "];
                }
                const shaderInputCount = node.config.input.count(it => it instanceof DrawRenderNodeInput.Shader);
                if (shaderInputCount !== 1) {
                    return [false, "draw-render-node " + node.id + " has amount of shader-inputs =/= 1 "];
                }
                const screenOutputCount = node.config.output.count(it => it instanceof DrawRenderNodeOutput.Screen);
                if (screenOutputCount > 1) {
                    return [false, "draw-render-node " + node.id + " has amount of screen outputs > 1 "];
                }
                const renderTargetOutputCount = node.config.output.count(it => it instanceof DrawRenderNodeOutput.RenderTarget);
                if (screenOutputCount === 0 && renderTargetOutputCount !== 1) {
                    return [false, "draw-render-node " + node.id + " has amount of render-target outputs =/= 1 "];
                }
            }
        }
        return [true, ""];
    }

    public compile(nodes: AbstractRenderNode[]): WebGLRenderCommand.Base[] {
        const commands: WebGLRenderCommand.Base[] = [];
        const textureBindingHandler = new TextureBindingHandler(8);

        for (let node of nodes) {
            if (node instanceof VertexRenderNode) {
                this.compileVertex(node, commands);
            }
            if (node instanceof DrawRenderNode) {
                this.compileDraw(node, textureBindingHandler, commands);
            }
        }

        return commands;
    }

    private compileVertex(node: VertexRenderNode, outCommands: WebGLRenderCommand.Base[]) {
        outCommands.push(new WebGLRenderCommand.UpdateVertexBufferData(node));
    }

    private compileDraw(node: DrawRenderNode, textureBindingHandler: TextureBindingHandler, outCommands: WebGLRenderCommand.Base[]) {

        // todo optimize

        const inputTextureIds: string[] = node.config.input
            .map(e => {
                if (e instanceof DrawRenderNodeInput.Texture) {
                    return e.path;
                } else if (e instanceof DrawRenderNodeInput.RenderTarget) {
                    return e.renderTargetId;
                } else {
                    return null;
                }
            })
            .filterDefined();

        const inputShader = node.config.input.find(e => e instanceof DrawRenderNodeInput.Shader)! as DrawRenderNodeInput.Shader;
        const inputVertexData = node.config.input.find(e => e instanceof DrawRenderNodeInput.VertexData)! as DrawRenderNodeInput.VertexData;

        // bind framebuffer
        let renderToTexture = false;
        for (let output of node.config.output) {
            if (output instanceof DrawRenderNodeOutput.RenderTarget) {
                outCommands.push(new WebGLRenderCommand.BindFramebuffer(output.renderTargetId));
                renderToTexture = true;
            }
        }

        // bind textures
        for (let input of node.config.input) {
            if (input instanceof DrawRenderNodeInput.Texture) {
                const textureId = input.path;
                const textureUnit = textureBindingHandler.requestUnit(textureId, inputTextureIds);
                outCommands.push(new WebGLRenderCommand.BindTexture(textureId, textureUnit));
            }
            if (input instanceof DrawRenderNodeInput.RenderTarget) {
                const textureId = input.renderTargetId;
                const textureUnit = textureBindingHandler.requestUnit(textureId, inputTextureIds);
                outCommands.push(new WebGLRenderCommand.BindFramebufferTexture(textureId, textureUnit));
            }
        }

        // use shader
        outCommands.push(new WebGLRenderCommand.UseShader(inputShader.vertexId, inputShader.fragmentId));

        // set uniforms
        const uniforms: ProgramUniformEntry[] = [];
        for (let input of node.config.input) {
            if (input instanceof DrawRenderNodeInput.Property) {
                uniforms.push(new ProgramUniformEntry({
                    valueConstant: input.valueConstant,
                    valueProvider: input.valueProvider,
                    binding: input.binding,
                    type: input.type,
                }));
            }
            if (input instanceof DrawRenderNodeInput.Texture) {
                const textureId = input.path;
                uniforms.push(new ProgramUniformEntry({
                    valueConstant: null,
                    valueProvider: () => textureBindingHandler.getUnit(textureId)!,
                    binding: input.binding,
                    type: GLUniformType.SAMPLER_CUBE,
                }));
            }
            if (input instanceof DrawRenderNodeInput.RenderTarget) {
                const textureId = input.renderTargetId;
                uniforms.push(new ProgramUniformEntry({
                    valueConstant: null,
                    valueProvider: () => textureBindingHandler.getUnit(textureId)!,
                    binding: input.binding,
                    type: GLUniformType.SAMPLER_CUBE,
                }));
            }
        }
        if (uniforms.length > 0) {
            outCommands.push(new WebGLRenderCommand.SetUniforms(uniforms, inputShader.vertexId, inputShader.fragmentId));
        }

        // bind vertex arrays
        outCommands.push(new WebGLRenderCommand.BindVertexArray(inputVertexData.vertexDataId, inputShader.vertexId, inputShader.fragmentId));

        // draw call
        outCommands.push(new WebGLRenderCommand.Draw(inputVertexData.vertexDataId, this.getClearColor(node), renderToTexture));

        // unbind vertex arrays
        outCommands.push(new WebGLRenderCommand.UnbindVertexArray(inputVertexData.vertexDataId, inputShader.vertexId, inputShader.fragmentId));

        // unbind framebuffer
        for (let output of node.config.output) {
            if (output instanceof DrawRenderNodeOutput.RenderTarget) {
                outCommands.push(new WebGLRenderCommand.UnbindFramebuffer());
            }
        }
    }

    private getClearColor(node: DrawRenderNode): [number, number, number, number] {
        const config = node.config.input.find(e => e instanceof DrawRenderNodeInput.ClearColor)
        if(config) {
            return (config as DrawRenderNodeInput.ClearColor).clearColor
        } else {
            return [0,0,0,1]
        }
    }

}