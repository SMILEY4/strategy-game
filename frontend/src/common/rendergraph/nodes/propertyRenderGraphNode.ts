import {RenderGraphNode} from "../renderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";

export class PropertyRenderGraphNode<T> extends RenderGraphNode<PropertyRenderGraphNode<T>> {

	private readonly changeTests: (() => boolean)[] = [];
	private type: GLUniformType | null = null;
	private provider: () => T = () => null as any;

	public withChangeTest(changeTest: () => boolean): PropertyRenderGraphNode<T> {
		this.changeTests.push(changeTest);
		return this;
	}

	public withType(type: GLUniformType): PropertyRenderGraphNode<T> {
		this.type = type;
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

	public getProvider(): () => T {
		return this.provider;
	}

	validate(): string[] {
		return [];
	}

}