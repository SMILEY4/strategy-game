import {RenderGraphCompiler} from "../compiler/renderGraphCompiler";
import {RenderCommand} from "../compiler/renderCommand";
import {
    AbstractRenderNode,
    RenderNodeConfig,
    RenderNodeInputEntry,
    RenderNodeOutputEntry,
} from "../nodes/abstractRenderNode";
import {WebglRenderCommand} from "./webglRenderCommand";
import {RenderTargetInputConfig, RenderTargetOutputConfig} from "../resources/renderTargetRenderResource";
import {VertexDataInputConfig} from "../resources/vertexDataRenderResource";
import {TextureInputConfig} from "../resources/textureRenderResource";
import {ShaderInputConfig} from "../resources/shaderRenderResource";
import {TextureBindingHandler} from "./textureBindingHandler";
import {ProgramUniformEntry} from "./programUniformEntry";
import {GLUniformType} from "../../../shared/webgl/glTypes";
import {PropertyInputConfig} from "../resources/propertyRenderResource";
import {WebGlResourceManager} from "./webglResourceManager";
import {WebglGraphSorter} from "./webglGraphSorter";

export class WebGlRenderGraphCompiler extends RenderGraphCompiler<WebGlResourceManager> {

    public compile(nodes: AbstractRenderNode[]): RenderCommand<WebGlResourceManager>[] {

        const sortedNodes = new WebglGraphSorter().sort(nodes);

        const commands: WebglRenderCommand.BaseCommand[] = [];

        const textureBindingHandler = new TextureBindingHandler(8);

        for (let i = 0; i < sortedNodes.length; i++) {
            const node = sortedNodes[i];
            const inputs = node.getConfig().inputs;
            const outputs = node.getConfig().outputs;

            this.validateNode(node.getConfig());

            this.startRenderTargets(outputs, commands);

            this.setupTextures(inputs, textureBindingHandler, commands);

            this.startShader(inputs, commands);
            this.setShaderParameters(inputs, textureBindingHandler, commands);

            this.startVertexArray(inputs, commands);

            this.drawCall(commands);

            this.stopVertexArray(inputs, commands);

            this.stopRenderTargets(outputs, commands);
        }

        return commands;
    }

    private validateNode(config: RenderNodeConfig): void {

        // output contains only 0 or 1 render-targets
        if (config.outputs.filter(e => e.type === "render-target").length > 1) {
            throw new Error("Invalid render-node configuration: multiple output render-targets");
        }

        // input contains only 0 or 1 shaders
        if (config.inputs.filter(e => e.type === "shader").length > 1) {
            throw new Error("Invalid render-node configuration: multiple input shaders");
        }

        // input contains only 0 or 1 vertex-data
        if (config.inputs.filter(e => e.type === "vertexdata").length > 1) {
            throw new Error("Invalid render-node configuration: multiple vertex-data");
        }

        // if shader is present, exactly one vertex-data is required
        const countShader = config.inputs.filter(e => e.type === "shader").length;
        const countVertexData = config.inputs.filter(e => e.type === "vertexdata").length;
        if (countShader === 1 && countVertexData !== 1) {
            throw new Error("Invalid render-node configuration: shader is present, but with an invalid amount of vertex-data");
        }

        // shader properties must have a value
        for (let input of config.inputs) {
            if (input.type === "property") {
                const resourceConfig = input as PropertyInputConfig;
                if (resourceConfig.valueConstant === null && resourceConfig.valueProvider === null) {
                    throw new Error("Invalid render-node configuration: property has no value");
                }
            }
        }

    }

    private startRenderTargets(outputs: RenderNodeOutputEntry[], outCommands: WebglRenderCommand.BaseCommand[]) {
        for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j];
            if (output.type === "render-target") {
                const resourceConfig = output as RenderTargetOutputConfig;
                outCommands.push(new WebglRenderCommand.BindRenderTarget(resourceConfig.name));
            }
        }
    }

    private stopRenderTargets(outputs: RenderNodeOutputEntry[], outCommands: WebglRenderCommand.BaseCommand[]) {
        for (let j = 0; j < outputs.length; j++) {
            const output = outputs[j];
            if (output.type === "render-target") {
                const resourceConfig = output as RenderTargetOutputConfig;
                outCommands.push(new WebglRenderCommand.UnbindRenderTarget(resourceConfig.name));
            }
        }
    }

    private setupTextures(inputs: RenderNodeInputEntry[], bindingHandler: TextureBindingHandler, outCommands: WebglRenderCommand.BaseCommand[]) {

        // reserve texture units
        const textureNames: string[] = [];
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === "texture") {
                const resourceConfig = input as TextureInputConfig;
                textureNames.push(resourceConfig.path);
            }
        }
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === "render-target") {
                const resourceConfig = input as RenderTargetInputConfig;
                textureNames.push(resourceConfig.name);
            }
        }
        const units = bindingHandler.requestUnits(textureNames);

        // create commands
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === "texture") {
                const resourceConfig = input as TextureInputConfig;
                if (units.has(resourceConfig.path)) {
                    const textureUnit = units.get(resourceConfig.path)!;
                    outCommands.push(new WebglRenderCommand.BindTexture(resourceConfig.path, textureUnit));
                }
            }
        }
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === "render-target") {
                const resourceConfig = input as RenderTargetInputConfig;
                if (units.has(resourceConfig.name)) {
                    const textureUnit = units.get(resourceConfig.name)!;
                    outCommands.push(new WebglRenderCommand.BindRenderTargetTexture(resourceConfig.name, textureUnit));
                }
            }
        }
    }

    private startVertexArray(inputs: RenderNodeInputEntry[], outCommands: WebglRenderCommand.BaseCommand[]) {
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            if (input.type === "vertexdata") {
                const resourceConfig = input as VertexDataInputConfig;
                outCommands.push(new WebglRenderCommand.BindVertexArray(resourceConfig.name));
            }
        }
    }

    private stopVertexArray(inputs: RenderNodeInputEntry[], outCommands: WebglRenderCommand.BaseCommand[]) {
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            if (input.type === "vertexdata") {
                const resourceConfig = input as VertexDataInputConfig;
                outCommands.push(new WebglRenderCommand.UnbindVertexArray(resourceConfig.name));
            }
        }
    }

    private startShader(inputs: RenderNodeInputEntry[], outCommands: WebglRenderCommand.BaseCommand[]) {
        for (let j = 0; j < inputs.length; j++) {
            const input = inputs[j];
            if (input.type === "shader") {
                const resourceConfig = input as ShaderInputConfig;
                outCommands.push(new WebglRenderCommand.UseShader(resourceConfig.name));
            }
        }
    }

    private setShaderParameters(inputs: RenderNodeInputEntry[], bindingHandler: TextureBindingHandler, outCommands: WebglRenderCommand.BaseCommand[]) {
        // find shader
        const shaderConfig = inputs.find(input => input.type === "shader") as (ShaderInputConfig | null);
        if (!shaderConfig) {
            return;
        }
        // collect uniforms
        const uniforms: ProgramUniformEntry[] = [];
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            if (input.type === "texture") {
                const resourceConfig = input as TextureInputConfig;
                const textureUnit = bindingHandler.getUnit(resourceConfig.path);
                uniforms.push({
                    binding: resourceConfig.binding,
                    type: GLUniformType.SAMPLER_2D,
                    valueConstant: textureUnit,
                    valueProvider: null,
                });
            }
            if (input.type === "render-target") {
                const resourceConfig = input as RenderTargetInputConfig;
                const textureUnit = bindingHandler.getUnit(resourceConfig.name);
                uniforms.push({
                    binding: resourceConfig.binding,
                    type: GLUniformType.SAMPLER_2D,
                    valueConstant: textureUnit,
                    valueProvider: null,
                });
            }
            if (input.type === "property") {
                const resourceConfig = input as PropertyInputConfig;
                uniforms.push({
                    binding: resourceConfig.binding,
                    type: resourceConfig.valueType,
                    valueConstant: resourceConfig.valueConstant === undefined ? null : resourceConfig.valueConstant,
                    valueProvider: resourceConfig.valueProvider === undefined ? null : resourceConfig.valueProvider,
                });
            }
        }
        // create command
        if (uniforms) {
            outCommands.push(new WebglRenderCommand.SetUniforms(shaderConfig.name, uniforms));
        }
    }

    private drawCall(outCommands: WebglRenderCommand.BaseCommand[]) {
        outCommands.push(new WebglRenderCommand.Draw());
    }

}