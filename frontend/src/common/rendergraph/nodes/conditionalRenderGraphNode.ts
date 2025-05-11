import {RenderGraphNode} from "../renderGraphNode";

/**
 * Represents a conditional render graph node that manages a list of options to choose from at runtime based on given conditions.
 */
export class ConditionalRenderGraphNode<TNodeOption extends RenderGraphNode<any>> extends RenderGraphNode<ConditionalRenderGraphNode<any>> {

	private readonly options: ({ value: TNodeOption, condition: () => boolean })[] = [];

	/**
	 * Add the given value with the given condition as a new option to this node.
	 */
	public withOption(value: TNodeOption, condition: () => boolean): ConditionalRenderGraphNode<TNodeOption> {
		this.options.push({
			value: value,
			condition: condition,
		});
		this.registerInput(value);
		return this;
	}

	/**
	 * @returns the list of available options
	 */
	public getOptions(): { value: TNodeOption; condition: () => boolean }[] {
		return this.options;
	}

	validate(): string[] {
		const errors: string[] = [];
		if(this.options.length == 0) {
			errors.push("Conditional node requires at least one option.")
		}
		return errors;
	}

}