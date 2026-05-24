import type {WebglExecutionContext} from "@rendergraph/execute/webgl/webgl-execution-context.ts";
import {GlFramebuffer} from "@rendergraph/webgl/gl-framebuffer.ts";
import type {VertexDataResult} from "@rendergraph/nodes/rg-node.transform-vertex-out.ts";
import {GlProgram, type GLProgramUniform, GLUniformType, type GLUniformValueType} from "@rendergraph/webgl/gl-program.ts";
import type {ResourceKey} from "@rendergraph/execute/resource-key.ts";
import {GlError} from "@rendergraph/webgl/gl-error.ts";
import {checkExhaustive} from "@/common/common.ts";
import {mat4, vec3} from "gl-matrix";

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
    | WebGlUpdatePerspectiveCameraCommand


export interface WebGlBaseCommand {
    execute: (context: WebglExecutionContext) => void;
    toDebugInfo: () => object;
}


export class WebGlLockTextureCommand implements WebGlBaseCommand {

    readonly resourceKeys: ResourceKey[];

    constructor(options: { resourceKeys: ResourceKey[] }) {
        this.resourceKeys = options.resourceKeys;
    }

    public execute(context: WebglExecutionContext): void {
        context.lockTextures(this.resourceKeys);
    }

    public toDebugInfo(): object {
        return {
            command: "WebGlLockTextureCommand",
            resourceKeys: this.resourceKeys,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlBindTextureCommand",
            resourceKey: this.resourceKey,
        };
    }
}

export class WebGlBindSelectTextureCommand implements WebGlBaseCommand {

    readonly resourceKey: ResourceKey;
    readonly inputResourceKey: ResourceKey;
    readonly selectorFunc: (args: unknown) => string;
    readonly options: Record<string, ResourceKey>;

    constructor(options: {
        resourceKey: ResourceKey,
        inputResourceKey: ResourceKey,
        selectorFunc: (args: unknown) => string,
        options: Record<string, ResourceKey>
    }) {
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

    public toDebugInfo(): object {
        return {
            command: "WebGlBindSelectTextureCommand",
            resourceKey: this.resourceKey,
            inputResourceKey: this.inputResourceKey,
            options: this.options,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlBindFramebufferTextureCommand",
            resourceKey: this.resourceKey,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlUseProgramCommand",
            resourceKey: this.resourceKey,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlLoadExternalDataCommand",
            resourceKey: this.resourceKey,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlLoadTransformedDataCommand",
            resourceKey: this.resourceKey,
            transformerResourceKey: this.transformerResourceKey,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlTransformCommand",
            resourceKey: this.resourceKey,
            inputs: this.inputs,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlTransformMultiOutCommand",
            resourceKey: this.resourceKey,
            inputs: this.inputs,
        };
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
                    context.setVertexBufferElementCount(this.resourceKey + "#" + key, value.count);
                }
            });
        }
    }

    public toDebugInfo(): object {
        return {
            command: "WebGlTransformVertexOutCommand",
            resourceKey: this.resourceKey,
            inputs: this.inputs,
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlBindFramebufferCommand",
            resourceKey: this.resourceKey,
        };
    }
}

export class WebGlUnbindFramebufferCommand implements WebGlBaseCommand {

    public execute(context: WebglExecutionContext): void {
        GlFramebuffer.unbind(context.getGlContext());
    }

    public toDebugInfo(): object {
        return {
            command: "WebGlUnbindFramebufferCommand",
        };
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

    public toDebugInfo(): object {
        return {
            command: "WebGlBindVertexArrayCommand",
            resourceKey: this.resourceKey,
        };
    }
}

export type WebGlSetUniformValuesCommandInput =
    | { name: string, source: "data", resourceKey: ResourceKey }
    | { name: string, source: "data-const", value: unknown }
    | { name: string, source: "texture", resourceKey: ResourceKey }
    | { name: string, source: "select-texture", resourceKey: ResourceKey }
    | { name: string, source: "framebuffer", resourceKey: ResourceKey }

export class WebGlSetUniformValuesCommand implements WebGlBaseCommand {

    private readonly programResourceKey: ResourceKey;
    private readonly inputs: WebGlSetUniformValuesCommandInput[];

    private cachedUniformInfo: null | ({
        info: GLProgramUniform,
        input: WebGlSetUniformValuesCommandInput
    })[] = null;

    constructor(options: { programResourceKey: ResourceKey, inputs: WebGlSetUniformValuesCommandInput[] }) {
        this.programResourceKey = options.programResourceKey;
        this.inputs = options.inputs;
    }

    public execute(context: WebglExecutionContext): void {
        const program = context.getProgram(this.programResourceKey);
        if (!this.cachedUniformInfo) {
            this.cachedUniformInfo = this.findUniformInfo(program, this.inputs);
        }
        this.cachedUniformInfo.forEach(uniform => {
            const input = uniform.input;
            if (input.source === "data") {
                const data = context.getData(input.resourceKey);
                program.setUniform(uniform.info.name, GLUniformType.FLOAT, data as GLUniformValueType); // todo: datatype
                return;
            }
            if (input.source === "data-const") {
                const data = input.value;
                program.setUniform(uniform.info.name, GLUniformType.FLOAT, data as GLUniformValueType); // todo: datatype
                return;
            }
            if (input.source === "texture") {
                const texture = context.getTexture(input.resourceKey);
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, texture);
                return;
            }
            if (input.source === "select-texture") {
                const selectedTextureResourceKey = context.getData(input.resourceKey) as ResourceKey;
                const texture = context.getTexture(selectedTextureResourceKey);
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, texture);
                return;
            }
            if (input.source === "framebuffer") {
                const framebuffer = context.getFramebuffer(input.resourceKey);
                program.setUniform(uniform.info.name, GLUniformType.SAMPLER_2D, framebuffer);
                return;
            }
            checkExhaustive(input);
        });
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
                input: input,
            };
        });
    }

    public toDebugInfo(): object {
        return {
            command: "WebGlSetUniformValuesCommand",
            programResourceKey: this.programResourceKey,
            inputs: this.inputs,
        };
    }
}

export class WebGlUpdatePerspectiveCameraCommand implements WebGlBaseCommand {

    private readonly resourceKey: ResourceKey;
    private readonly up: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
    private readonly position: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
    private readonly direction: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
    private readonly aspect: { type: "ref", key: ResourceKey } | { type: "const", value: number };
    private readonly fov: { type: "ref", key: ResourceKey } | { type: "const", value: number };
    private readonly near: { type: "ref", key: ResourceKey } | { type: "const", value: number };
    private readonly far: { type: "ref", key: ResourceKey } | { type: "const", value: number };

    constructor(options: {
        resourceKey: ResourceKey;
        up: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
        position: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
        direction: { type: "ref", key: ResourceKey } | { type: "const", value: vec3 };
        aspect: { type: "ref", key: ResourceKey } | { type: "const", value: number };
        fov: { type: "ref", key: ResourceKey } | { type: "const", value: number };
        near: { type: "ref", key: ResourceKey } | { type: "const", value: number };
        far: { type: "ref", key: ResourceKey } | { type: "const", value: number };
    }) {
        this.resourceKey = options.resourceKey;
        this.up = options.up;
        this.position = options.position;
        this.direction = options.direction;
        this.aspect = options.aspect;
        this.fov = options.fov;
        this.near = options.near;
        this.far = options.far;
    }

    public execute(context: WebglExecutionContext): void {

        const resourceKeyProjectionMatrix = this.resourceKey + "#proj";
        let matProjection = context.getData(resourceKeyProjectionMatrix) as mat4;
        if(!matProjection) {
            matProjection = mat4.create();
            context.setData(resourceKeyProjectionMatrix, matProjection);
        }

        const updateProjection =
            (this.aspect.type === "ref" && context.isDirty(this.aspect.key))
            || (this.fov.type === "ref" && context.isDirty(this.fov.key))
            || (this.near.type === "ref" && context.isDirty(this.near.key))
            || (this.far.type === "ref" && context.isDirty(this.far.key));

        if (updateProjection) {

            const valueAspect = this.aspect.type === "ref"
                ? context.getData(this.aspect.key) as number
                : this.aspect.value;

            const valueFoV = this.fov.type === "ref"
                ? context.getData(this.fov.key) as number
                : this.fov.value;

            const valueNear = this.near.type === "ref"
                ? context.getData(this.near.key) as number
                : this.near.value;

            const valueFar = this.far.type === "ref"
                ? context.getData(this.far.key) as number
                : this.far.value;

            mat4.perspective(matProjection, valueFoV, valueAspect, valueNear, valueFar);
            context.setDirty(resourceKeyProjectionMatrix);
        }

        const resourceKeyViewMatrix = this.resourceKey + "#view";
        let matView = context.getData(resourceKeyViewMatrix) as mat4;
        if(!matView) {
            matView = mat4.create();
            context.setData(resourceKeyViewMatrix, matView);
        }

        const updateView =
            (this.up.type === "ref" && context.isDirty(this.up.key))
            || (this.position.type === "ref" && context.isDirty(this.position.key))
            || (this.direction.type === "ref" && context.isDirty(this.direction.key))

        if(updateView) {

            const valueUp = this.up.type === "ref"
                ? context.getData(this.up.key) as vec3
                : this.up.value;

            const valuePosition = this.position.type === "ref"
                ? context.getData(this.position.key) as vec3
                : this.position.value;

            const valueDirection = this.direction.type === "ref"
                ? context.getData(this.direction.key) as vec3
                : this.direction.value;

            const target = vec3.create()
            vec3.add(target, valuePosition, valueDirection)

            mat4.lookAt(matView, valuePosition, target, valueUp)
            context.setDirty(resourceKeyViewMatrix);
        }

        const resourceKeyViewProjectionMatrix = this.resourceKey + "#viewproj";
        let matViewProjection = context.getData(resourceKeyViewProjectionMatrix) as mat4;
        if(!matViewProjection) {
            matViewProjection = mat4.create();
            context.setData(resourceKeyViewProjectionMatrix, matViewProjection);
        }

        if(updateView || updateProjection) {
            mat4.multiply(matViewProjection, matProjection, matView)
            context.setDirty(resourceKeyViewProjectionMatrix)
        }

    }

    public toDebugInfo(): object {
        return {
            command: "WebGlUpdatePerspectiveCameraCommand",
        };
    }
}

export class WebGlDrawCommand implements WebGlBaseCommand {

    private readonly vertexBufferResourceKeys: ResourceKey[];
    private readonly instanceBufferResourceKeys: ResourceKey[];

    constructor(options: { vertexBufferResourceKeys: ResourceKey[], instanceBufferResourceKeys: ResourceKey[] }) {
        this.vertexBufferResourceKeys = options.vertexBufferResourceKeys;
        this.instanceBufferResourceKeys = options.instanceBufferResourceKeys;
    }

    public execute(context: WebglExecutionContext): void {

        const gl = context.getGlContext();

        let vertexCount: number | null = null;
        if (this.vertexBufferResourceKeys.length > 0) {
            vertexCount = context.getVertexBufferElementCount(this.vertexBufferResourceKeys[0]);
        }

        let instanceCount: number | null = null;
        if (this.instanceBufferResourceKeys.length > 0) {
            instanceCount = context.getVertexBufferElementCount(this.instanceBufferResourceKeys[0]);
        }

        if (vertexCount === null) {
            throw new Error("No vertex data for draw command.");
        }

        if (instanceCount === null) {
            gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
            GlError.check(gl, "drawArrays", "drawing");
        } else {
            gl.drawArraysInstanced(gl.TRIANGLES, 0, vertexCount, instanceCount);
            GlError.check(gl, "drawArraysInstanced", "drawing instanced");
        }
    }

    public toDebugInfo(): object {
        return {
            command: "WebGlDrawCommand",
            vertexBufferResourceKeys: this.vertexBufferResourceKeys,
            instanceBufferResourceKeys: this.instanceBufferResourceKeys,
        };
    }
}
