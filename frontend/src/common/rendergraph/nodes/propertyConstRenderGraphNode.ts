import {RenderGraphNode} from "../renderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";

export class PropertyConstRenderGraphNode<T> extends RenderGraphNode<PropertyConstRenderGraphNode<T>> {

	private type: GLUniformType | null = null;
	private value: T = null as any;

	public withType(type: GLUniformType): PropertyConstRenderGraphNode<T> {
		this.type = type;
		return this;
	}

	public withValue(value: T): PropertyConstRenderGraphNode<T> {
		this.value = value;
		return this;
	}


	public getType(): GLUniformType | null {
		return this.type;
	}

	public getValue(): T {
		return this.value;
	}

	getInputs(): RenderGraphNode<any>[] {
		return [];
	}

}