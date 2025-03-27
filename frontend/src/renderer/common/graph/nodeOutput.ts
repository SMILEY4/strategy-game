import {GLAttributeComponentAmount, GLAttributeType} from "../../../common/webgl/glTypes";

/**
 * Outputs of render nodes
 **/
export namespace NodeOutput {

	/**
	 * Draw to the given render target
	 */
	export class RenderTarget {
		readonly renderTargetId: string;
		readonly depth: boolean;
		readonly scale: number;

		constructor(props: { renderTargetId: string, scale: number, depth: boolean }) {
			this.renderTargetId = props.renderTargetId;
			this.depth = props.depth;
			this.scale = props.scale;
		}
	}

	/**
	 * Draw to the screen
	 */
	export class Screen {
	}

	/**
	 * Draw/Add elements to a html element
	 */
	export class HtmlContainer {
		readonly id: string;

		constructor(props: { id: string }) {
			this.id = props.id;
		}
	}


	export class HtmlData<TContext> {
		readonly name: string;
		readonly boundsRadiusTiles: number | null;
		readonly lowQualityThreshold: number | null;
		readonly templateFunc: () => HTMLElement;
		readonly renderFunc: (ctx: TContext, obj: any, target: HTMLElement, lowQuality: boolean) => void;

		constructor(props: {
			name: string,
			boundsRadiusTiles: number | null,
			lowQualityThreshold: number | null,
			htmlFactory: () => HTMLElement,
			renderFunc: (ctx: TContext, obj: any, target: HTMLElement, lowQuality: boolean) => void,
		}) {
			this.name = props.name;
			this.boundsRadiusTiles = props.boundsRadiusTiles;
			this.lowQualityThreshold = props.lowQualityThreshold;
			this.templateFunc = props.htmlFactory;
			this.renderFunc = props.renderFunc;
		}
	}


	/**
	 * Writes to a vertex-buffer
	 */
	export class VertexBuffer {
		readonly name: string;
		readonly attributes: VertexAttribute[];


		constructor(props: { name: string, attributes: VertexAttribute[] }) {
			this.name = props.name;
			this.attributes = props.attributes;
		}
	}

	/**
	 * Combines vertex buffers and information about data layout
	 */
	export class VertexDescriptor {
		readonly name: string;
		readonly type: "standart" | "instanced";
		readonly buffers: string[];

		constructor(props: { name: string, type: "standart" | "instanced", buffers: string[] }) {
			this.name = props.name;
			this.type = props.type;
			this.buffers = props.buffers;
		}
	}

	/**
	 * The configuration for a single vertex attribute
	 */
	export interface VertexAttribute {
		name: string,
		type: GLAttributeType,
		amountComponents: GLAttributeComponentAmount,
		normalized?: boolean,
		stride?: number,
		offset?: number,
		divisor?: number,
	}

}