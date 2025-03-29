import {RenderGraphResource} from "./renderGraphResource";

export class GenericDataResource<T> extends RenderGraphResource {

	data: T;

	constructor(key: string, initialData: T) {
		super(key);
		this.data = initialData;
	}

}