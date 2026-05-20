import type {WebglExecutionContext} from "@rendergraph/execute/webgl/webgl-execution-context.ts";
import {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import type {VertexDataResult} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";
import {GlProgram, type GLProgramUniform, GLUniformType, type GLUniformValueType} from "@rendergraph/webgl/gl-program.ts";
import type {ResourceKey} from "@rendergraph/execute/resource-key.ts";

export type WebGlCommand =
    | WebGlBindFramebufferCommand
    | WebGlBindFramebufferTextureCommand
    | WebGlBindSelectTextureCommand
    | WebGlBindTextureCommand
    | WebGlBindVertexArrayCommand
    | WebGlLoadExternalDataCommand
    | WebGlLoadTransformedDataCommand
    | WebGlLockTextureCommand
    | WebGlSetUniformValuesCommand
    | WebGlTransformCommand
    | WebGlTransformMultiOutCommand
    | WebGlTransformVertexOutCommand
    | WebGlUnbindFramebufferCommand
    | WebGlUseProgramCommand


export interface WebGlBaseCommand {
    execute: (context: WebglExecutionContext) => void;
}


export class WebGlLockTextureCommand implements WebGlBaseCommand {

    readonly resourceKeys: ResourceKey[];

    constructor(options: { resourceKeys: ResourceKey[] }) {
        this.resourceKeys = options.resourceKeys;
    }

    public execute(context: WebglExecutionContext): void {
        context.lockTextures(this.resourceKeys)
    }
}

export class WebGlBindTextureCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        const textureUnit = context.reserveTextureUnit(this.resourceKey);
        const texture = context.getTexture(this.resourceKey);
        texture.bind(textureUnit);
    }
}

export class WebGlBindSelectTextureCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly inputResourceKey: ResourceKey;
    readonly selectorFunc: (args: unknown) => string;
    readonly options: Record<string, ResourceKey>;

    constructor(options: { resourceKey: ResourceKey, inputResourceKey: ResourceKey, selectorFunc: (args: unknown) => string, options: Record<string, ResourceKey> }) {
        this.resourceKey = options.resourceKey;
        this.inputResourceKey = options.inputResourceKey;
        this.selectorFunc = options.selectorFunc;
        this.options = options.options;
    }

    public execute(context: WebglExecutionContext): void {
        const inputData = context.getData(this.inputResourceKey);
        const selectedOption = this.selectorFunc(inputData);
        const selectedResourceKey = this.options[selectedOption];
        context.setData(this.resourceKey, selectedResourceKey);
        const textureUnit = context.reserveTextureUnit(selectedResourceKey);
        const texture = context.getTexture(selectedResourceKey);
        texture.bind(textureUnit);
    }
}


export class WebGlBindFramebufferTextureCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        const textureUnit = context.reserveTextureUnit(this.resourceKey);
        const framebuffer = context.getFramebuffer(this.resourceKey);
        framebuffer.bindTexture(textureUnit);
    }
}

export class WebGlUseProgramCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        const program = context.getProgram(this.resourceKey);
        program.use();
    }
}

export class WebGlLoadExternalDataCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly fetchFunc: () => unknown;
    readonly hasChangedFunc: undefined | ((prev: unknown) => boolean);

    constructor(options: { resourceKey: ResourceKey, fetchFunc: () => unknown, hasChangedFunc: undefined | ((prev: unknown) => boolean) }) {
        this.resourceKey = options.resourceKey;
        this.fetchFunc = options.fetchFunc;
        this.hasChangedFunc = options.hasChangedFunc;
    }

    public execute(context: WebglExecutionContext): void {
        if (this.hasChangedFunc) {
            const prevData = context.getData(this.resourceKey);
            const hasChanged = this.hasChangedFunc(prevData);
            if (hasChanged) {
                const data = this.fetchFunc();
                context.setData(this.resourceKey, data);
            }
        } else {
            const data = this.fetchFunc();
            context.setData(this.resourceKey, data);
        }

    }
}

export class WebGlLoadTransformedDataCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly transformerResourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey, transformerResourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
        this.transformerResourceKey = options.transformerResourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        if (context.isDirty(this.transformerResourceKey)) {
            const data = context.getData(this.transformerResourceKey);
            context.setData(this.resourceKey, data);
        }
    }
}


export class WebGlTransformCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly inputs: ResourceKey[];
    readonly transformFunc: (...args: unknown[]) => unknown | null;

    constructor(options: { resourceKey: ResourceKey, inputs: ResourceKey[], transformFunc: (...args: unknown[]) => unknown | null }) {
        this.resourceKey = options.resourceKey;
        this.inputs = options.inputs;
        this.transformFunc = options.transformFunc;
    }

    public execute(context: WebglExecutionContext): void {
        const needsUpdate = this.inputs.some(key => context.isDirty(key));
        if (needsUpdate) {
            const inputData = this.inputs.map(key => context.getData(key));
            const transformedData = this.transformFunc(inputData);
            if (transformedData !== null) {
                context.setData(this.resourceKey, transformedData);
            }
        }
    }

}

export class WebGlTransformMultiOutCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly inputs: ResourceKey[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly transformFunc: (...args: unknown[]) => Record<string, any | null>;

    constructor(options: {
        resourceKey: ResourceKey,
        inputs: ResourceKey[],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transformFunc: (...args: unknown[]) => Record<string, any | null>
    }) {
        this.resourceKey = options.resourceKey;
        this.inputs = options.inputs;
        this.transformFunc = options.transformFunc;
    }

    public execute(context: WebglExecutionContext): void {
        const needsUpdate = this.inputs.some(key => context.isDirty(key));
        if (needsUpdate) {
            const inputData = this.inputs.map(key => context.getData(key));
            const transformedData = this.transformFunc(inputData);
            Object.entries(transformedData).forEach(([key, value]) => {
                if (value !== null) {
                    context.setData(this.resourceKey + "#" + key, value);
                }
            });
        }
    }

}

export class WebGlTransformVertexOutCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly inputs: ResourceKey[];
    readonly transformFunc: (...args: unknown[]) => Record<string, VertexDataResult | null>;

    constructor(options: {
        resourceKey: ResourceKey,
        inputs: ResourceKey[],
        transformFunc: (...args: unknown[]) => Record<string, VertexDataResult | null>
    }) {
        this.resourceKey = options.resourceKey;
        this.inputs = options.inputs;
        this.transformFunc = options.transformFunc;
    }

    public execute(context: WebglExecutionContext): void {
        const needsUpdate = this.inputs.some(key => context.isDirty(key));
        if (needsUpdate) {
            const inputData = this.inputs.map(key => context.getData(key));
            const transformedData = this.transformFunc(inputData);
            Object.entries(transformedData).forEach(([key, value]) => {
                if (value !== null) {
                    const vertexBuffer = context.getVertexBuffer(this.resourceKey + "#" + key);
                    vertexBuffer.setData(value.data, value.count, true);
                }
            });
        }
    }

}

export class WebGlBindFramebufferCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        const framebuffer = context.getFramebuffer(this.resourceKey);
        framebuffer.bind();
    }

}

export class WebGlUnbindFramebufferCommand implements WebGlBaseCommand {

    public execute(context: WebglExecutionContext): void {
        GlFramebuffer.unbind(context.getGlContext());
    }

}


export class WebGlBindVertexArrayCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;

    constructor(options: { resourceKey: ResourceKey }) {
        this.resourceKey = options.resourceKey;
    }

    public execute(context: WebglExecutionContext): void {
        const vertexArray = context.getVertexArray(this.resourceKey);
        vertexArray.bind();
    }

}

export type WebGlSetUniformValuesCommandInput =
    | { name: string, source: "data", resourceKey: ResourceKey }
    | { name: string, source: "texture", resourceKey: ResourceKey }
    | { name: string, source: "select-texture", resourceKey: ResourceKey }
    | { name: string, source: "framebuffer", resourceKey: ResourceKey }

export class WebGlSetUniformValuesCommand implements WebGlBaseCommand {

    private readonly programResourceKey: ResourceKey;

    private readonly inputs: WebGlSetUniformValuesCommandInput[];

    private cachedUniformInfo: null | ({
        info: GLProgramUniform,
        input: WebGlSetUniformValuesCommandInput
    })[] = null

    constructor(options: { programResourceKey: ResourceKey, inputs: WebGlSetUniformValuesCommandInput[] }) {
        this.programResourceKey = options.programResourceKey;
        this.inputs = options.inputs;
    }

    public execute(context: WebglExecutionContext): void {
        const program = context.getProgram(this.programResourceKey);
        if(!this.cachedUniformInfo) {
            this.cachedUniformInfo = this.findUniformInfo(program, this.inputs)
        }
        this.cachedUniformInfo.forEach(uniform => {
            const input = uniform.input
            if(input.source === "data") {
                const data = context.getData(input.resourceKey)
                program.setUniform(uniform.info.name, GLUniformType.FLOAT, data as GLUniformValueType)
            }
            if(input.source === "texture") {
                const texture = context.getTexture(input.resourceKey)
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, texture)
            }
            if(input.source === "select-texture") {
                const selectedTextureResourceKey = context.getData(input.resourceKey) as ResourceKey
                const texture = context.getTexture(selectedTextureResourceKey)
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, texture)
            }
            if(input.source === "framebuffer") {
                const framebuffer = context.getFramebuffer(input.resourceKey)
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, framebuffer)
            }
        })
    }

    private findUniformInfo(program: GlProgram, inputs: WebGlSetUniformValuesCommandInput[]): ({
        info: GLProgramUniform,
        input: WebGlSetUniformValuesCommandInput
    })[] {
        const uniformInfo = program.getInformation().uniforms;
        return inputs.map(input => {
            const uniform = uniformInfo.find(it => it.name === input.name);
            if (!uniform) throw new Error("Could not find uniform with name " + input.name);
            return {
                info: uniform,
                input: input
            }
        })
    }

}

export class WebGlDrawCommand implements WebGlBaseCommand {

    constructor() {
    }

    public execute(context: WebglExecutionContext): void {
        // TODO
        console.log(context);
    }

}
