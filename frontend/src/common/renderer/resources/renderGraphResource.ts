export abstract class RenderGraphResource {

	readonly key: string;

	protected constructor(key: string) {
		this.key = key;
	}
}