import {RenderGraphResource} from "./renderGraphResource";
import {ResourceKey} from "./resourceKey";
import {RenderGraphContext} from "../renderGraphContext";

export interface RenderGraphResourceDefinition<T extends RenderGraphResource> {
	key: ResourceKey,
	load: (context: RenderGraphContext, ) => T,
	unload: (resource: T, context: RenderGraphContext) => void,
}