import {GLUniformType} from "../../webgl/glTypes";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";

export interface RenderGraphProperty<TValue> extends RenderGraphNode{
	getType(): GLUniformType | null;
	getValueProvider(context: any): () => TValue;
}

export abstract class AbstractPropertyRenderGraphNode<TValue, TNode extends RenderGraphNode>
	implements RenderGraphNode, RenderGraphProperty<TValue> {

	private readonly changeTests: (() => boolean)[] = [];
	private type: GLUniformType | null = null;
	private valueProvider: (context: any) => (() => TValue) = () => null as any;
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): AbstractPropertyRenderGraphNode<TValue, TNode> {
		this.name = name
		return this;
	}

	public getType(): GLUniformType | null {
		return this.type;
	}

	public getValueProvider(context: any): () => TValue {
		return this.valueProvider(context);
	};

	validate(): string[] {
		const errors: string[] = [];
		if (this.valueProvider == null) {
			errors.push("Property must have a defined (derived) value");
		}
		return errors;
	}

	getInputs(): RenderGraphNode[] {
		return [];
	}

	getName(): string {
		return this.name;
	}

	getChangeTest(): () => boolean {
		return PropertyRenderGraphNodeUtils.mergeChangeTests(this.changeTests);
	}

	protected setType(type: GLUniformType): TNode {
		this.type = type;
		return this as unknown as TNode;
	}

	protected setValueProviderWithContext(provider: (context: any) => (() => TValue)): void {
		this.valueProvider = provider;
	}

	protected setValueProvider(provider: () => TValue): void {
		this.setValueProviderWithContext(() => provider);
	}

	protected addChangeTest(changeTest: () => boolean): void {
		this.changeTests.push(changeTest);
	}

}

export class ConstPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<TValue, ConstPropertyRenderGraphNode<TValue>> {

	public withType(type: GLUniformType): ConstPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withValue(value: TValue): ConstPropertyRenderGraphNode<TValue> {
		this.setValueProvider(() => value);
		return this;
	}

}

export class DynamicPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<TValue, DynamicPropertyRenderGraphNode<TValue>> {

	public withType(type: GLUniformType): DynamicPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withChangeTest(changeTest: () => boolean): DynamicPropertyRenderGraphNode<TValue> {
		this.addChangeTest(changeTest);
		return this;
	}

	public withValue(provider: () => TValue): DynamicPropertyRenderGraphNode<TValue> {
		this.setValueProvider(provider);
		return this;
	}

}


export class DerivedPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<TValue, DerivedPropertyRenderGraphNode<TValue>> {

	public withType(type: GLUniformType): DerivedPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withValue<TInput>(source: RenderGraphProperty<TInput>, transformation: (value: TInput) => TValue): DerivedPropertyRenderGraphNode<TValue> {
		this.setValueProviderWithContext(context => {
			return () => transformation(source.getValueProvider(context)());
		});
		this.addChangeTest(source.getChangeTest())
		return this;
	}

}


export namespace PropertyRenderGraphNodeUtils {

	export function mergeChangeTests(tests: (() => boolean)[]): () => boolean {
		return () => {
			for (let changeTest of tests) {
				if (changeTest()) {
					return true;
				}
			}
			return false;
		};
	}

	export function buildPropertyNameMapping(properties: ({
		property: RenderGraphProperty<any>,
		name: string
	})[]) {
		const propertyMapping: Map<string, string> = new Map<string, string>();
		for (let {property, name} of properties) {
			propertyMapping.set(name, RenderGraphKeys.property(property));
		}
		return propertyMapping;
	}

}