import {GLUniformType} from "../../webgl/glTypes";
import {RenderGraphKeys} from "../renderGraphKeys";
import {RenderGraphNode} from "../renderGraphNode";
import {UID} from "../../uid";
import {IntermediateDataGeneratorOutputDefinition} from "./intermediateDataGeneratorRenderGraphNode";
import {RenderGraphResourceManager} from "../renderGraphResourceManager";
import {DataGeneratorOutputDefinition} from "./dataGeneratorRenderGraphNode";

export interface RenderGraphProperty<TValue> extends RenderGraphNode {
	getType(): GLUniformType | null;
	getValueProvider(context: any): () => TValue;
}

export abstract class AbstractPropertyRenderGraphNode<TValue, TNode extends RenderGraphNode>
	implements RenderGraphNode, RenderGraphProperty<TValue> {

	private readonly inputNodes: RenderGraphNode[] = [];
	private type: GLUniformType | null = null;
	private valueProvider: (context: any) => (() => TValue) = () => null as any;
	private name: string = UID.generate();

	/**
	 * Set the name of this node to a given custom name. Names must be unique in the render graph.
	 */
	public withName(name: string): AbstractPropertyRenderGraphNode<TValue, TNode> {
		this.name = name;
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
		return this.inputNodes;
	}

	getName(): string {
		return this.name;
	}

	protected registerInputNode(node: RenderGraphNode): void {
		this.inputNodes.push(node)
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

	private readonly changeTests: ((resourceManager: RenderGraphResourceManager) => boolean)[] = [];

	public withType(type: GLUniformType): DynamicPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withChangeTest(changeTest: (resourceManager: RenderGraphResourceManager) => boolean): DynamicPropertyRenderGraphNode<TValue> {
		this.changeTests.push(changeTest);
		return this;
	}

	public withValue(provider: () => TValue): DynamicPropertyRenderGraphNode<TValue> {
		this.setValueProvider(provider);
		return this;
	}

	public getChangeTests(): ((resourceManager: RenderGraphResourceManager) => boolean)[] {
		return this.changeTests
	}
}


export class DerivedPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<TValue, DerivedPropertyRenderGraphNode<TValue>> {

	private source: AbstractPropertyRenderGraphNode<any, any> = null as any;

	public withType(type: GLUniformType): DerivedPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withValue<TInput>(source: AbstractPropertyRenderGraphNode<TInput, any>, transformation: (value: TInput) => TValue): DerivedPropertyRenderGraphNode<TValue> {
		this.setValueProviderWithContext(context => {
			return () => transformation(source.getValueProvider(context)());
		});
		this.registerInputNode(source)
		this.source = source;
		return this;
	}

	public getSource(): AbstractPropertyRenderGraphNode<any, any> {
		return this.source;
	}

}

export class WasmPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<void, WasmPropertyRenderGraphNode<TValue>> {

	private source: AbstractPropertyRenderGraphNode<any, any> = null as any;

	public withValue(source: AbstractPropertyRenderGraphNode<TValue, any>, wasmUpload: (value: TValue) => void): WasmPropertyRenderGraphNode<TValue> {
		this.setValueProviderWithContext(context => {
			return () => {
				const value = source.getValueProvider(context)();
				wasmUpload(value);
			}
		});
		this.registerInputNode(source)
		this.source = source;
		return this;
	}

	public getSource(): AbstractPropertyRenderGraphNode<any, any> {
		return this.source;
	}

}


export class GeneratedPropertyRenderGraphNode<TValue> extends AbstractPropertyRenderGraphNode<TValue, GeneratedPropertyRenderGraphNode<TValue>> {

	private source: IntermediateDataGeneratorOutputDefinition = null as any;

	public withType(type: GLUniformType): GeneratedPropertyRenderGraphNode<TValue> {
		this.setType(type);
		return this;
	}

	public withValue(source: IntermediateDataGeneratorOutputDefinition): GeneratedPropertyRenderGraphNode<TValue> {
		this.setValueProviderWithContext(context => {
			const resourceManager = context as RenderGraphResourceManager;
			const dataName = RenderGraphKeys.genericData(source);
			return () => resourceManager.getResource(dataName);
		});
		this.registerInputNode(source.generator)
		this.source= source;
		return this;
	}

	public getSource(): IntermediateDataGeneratorOutputDefinition {
		return this.source;
	}

}


export namespace PropertyRenderGraphNodeUtils {

	export function buildPropertyNameMapping(
		properties: ({ property: RenderGraphProperty<any>, name: string, })[],
		outputDefinitions: DataGeneratorOutputDefinition<any>[],
	) {
		const propertyMapping: Map<string, string> = new Map<string, string>();

		for (let {property, name} of properties) {
			propertyMapping.set(name, RenderGraphKeys.property(property));
		}

		for (let outputDefinition of outputDefinitions) {
			propertyMapping.set("_this." + outputDefinition.name, RenderGraphKeys.genericData(outputDefinition));
		}

		return propertyMapping;
	}

}