import {RenderGraphNode} from "../renderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";

export class PropertyRenderGraphNode<T> extends RenderGraphNode<PropertyRenderGraphNode<T>> {

	private readonly changeTests: (() => boolean)[] = [];
	private type: GLUniformType | null = null;
	private defaultValue: T = null as any;
	private provider: () => T = () => null as any;

	public withChangeTest(changeTest: () => boolean): PropertyRenderGraphNode<T> {
		this.changeTests.push(changeTest);
		return this;
	}

	public withType(type: GLUniformType): PropertyRenderGraphNode<T> {
		this.type = type;
		return this;
	}

	public withDefault(defaultValue: T): PropertyRenderGraphNode<T> {
		this.defaultValue = defaultValue;
		return this;
	}

	public withProvider(provider: () => T): PropertyRenderGraphNode<T> {
		this.provider = provider;
		return this;
	}

	public getChangeTests(): (() => boolean)[] {
		return this.changeTests;
	}

	public getType(): GLUniformType | null {
		return this.type;
	}

	public getDefault(): T {
		return this.defaultValue;
	}

	public getProvider(): () => T {
		return this.provider;
	}

	validate(): string[] {
		return [];
	}

}