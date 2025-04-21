import {RenderGraphNode} from "../renderGraphNode";
import {GLUniformValueType} from "../../webgl/glTypes";

export class PropertyRenderGraphNode<T> extends RenderGraphNode<PropertyRenderGraphNode<T>> {

	private readonly changeTests: (() => boolean)[] = [];
	private readonly trackedChangeKeys: string[] = [];
	private type: GLUniformValueType | null = null;
	private provider: () => T = () => null as any;

	public withTrackedChange(trackedChangeKey: string): PropertyRenderGraphNode<T> {
		this.trackedChangeKeys.push(trackedChangeKey);
		return this;
	}

	public withChangeTest(changeTest: () => boolean): PropertyRenderGraphNode<T> {
		this.changeTests.push(changeTest);
		return this;
	}

	public withType(type: GLUniformValueType): PropertyRenderGraphNode<T> {
		this.type = type;
		return this;
	}

	public withProvider(provider: () => T): PropertyRenderGraphNode<T> {
		this.provider = provider;
		return this;
	}

	public getTrackedChangeKeys(): string[] {
		return this.trackedChangeKeys;
	}

	public getChangeTests(): (() => boolean)[] {
		return this.changeTests;
	}

	public getType(): GLUniformValueType | null {
		return this.type;
	}

	public getProvider(): () => T {
		return this.provider;
	}


	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}