import {RenderGraphNode} from "../renderGraphNode";

export class ConditionalRenderGraphNode<T extends RenderGraphNode<any>> extends RenderGraphNode<ConditionalRenderGraphNode<any>> {

	private readonly options: ({ value: T, condition: () => boolean })[] = [];

	public withOption(value: T, condition: () => boolean): ConditionalRenderGraphNode<T> {
		this.options.push({
			value: value,
			condition: condition
		})
		return this;
	}

	public getOptions(): { value: T; condition: () => boolean }[] {
		return this.options;
	}

	getInputs(): RenderGraphNode<any>[] {
		return this.options.map(it => it.value);
	}

}