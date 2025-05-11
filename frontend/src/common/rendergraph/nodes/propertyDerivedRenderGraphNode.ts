import {RenderGraphNode} from "../renderGraphNode";
import {GLUniformType} from "../../webgl/glTypes";
import {PropertyRenderGraphNode} from "./propertyRenderGraphNode";
import {PropertyConstRenderGraphNode} from "./propertyConstRenderGraphNode";

export class PropertyDerivedRenderGraphNode<T> extends RenderGraphNode<PropertyDerivedRenderGraphNode<T>> { // todo

	private type: GLUniformType | null = null;
	private source: PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> = null as any;
	private transformation: (value: any) => T = null as any;

	public withType(type: GLUniformType): PropertyDerivedRenderGraphNode<T> {
		this.type = type;
		return this;
	}

	public withValue<I>(source: PropertyRenderGraphNode<I> | PropertyConstRenderGraphNode<I>, transformation: (value: I) => T): PropertyDerivedRenderGraphNode<T> {
		this.source = source;
		this.transformation = transformation;
		return this;
	}

	public getType(): GLUniformType | null {
		return this.type;
	}

	public getSource(): PropertyRenderGraphNode<any> | PropertyConstRenderGraphNode<any> {
		return this.source;
	}

	public getTransformation(): (value: any) => T {
		return this.transformation;
	}

	validate(): string[] {
		return [];
	}

}