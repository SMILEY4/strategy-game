import {RenderGraphNode} from "../renderGraphNode";
import {RenderGraphNodeContext} from "../renderGraphNodeContext";

export interface DataGeneratorRenderGraphNode<TOutputDefinition, TResult> extends RenderGraphNode {
	getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, TResult>
	getOutputDefinitions(): TOutputDefinition[]
	useOutput(name: string): TOutputDefinition
}

export interface DataGeneratorOutputDefinition<TGenerator extends DataGeneratorRenderGraphNode<any, any>> {
	name: string,
	generator: TGenerator
}

// export abstract class AbstractDataGeneratorRenderGraphNode<TOutputDefinition, TResult> implements DataGeneratorRenderGraphNode<TOutputDefinition, TResult> {
//
// 	validate(): string[] {
// 		return [];
// 	}
//
// 	getGeneratorFunction(): (context: RenderGraphNodeContext) => Map<string, TResult> {
// 		return null as any;
// 	}
//
// 	getInputs(): RenderGraphNode[] {
// 		return [];
// 	}
//
// 	getName(): string {
// 		return "";
// 	}
//
// 	getOutputDefinitions(): TOutputDefinition[] {
// 		return [];
// 	}
//
// 	useOutput(name: string): TOutputDefinition {
// 		return undefined;
// 	}
//
// 	getChangeTest(): () => boolean {
// 		return function () {
// 			return false;
// 		};
// 	}
//
// }