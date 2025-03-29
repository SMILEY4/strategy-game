import {RenderGraphNodeOutputDefinition} from "./renderGraphNodeOutputDefinition";
import {GLAttributeComponentAmount, GLAttributeType} from "../../webgl/glTypes";

export namespace NodeOutputDefinition {

	export class GenericData extends RenderGraphNodeOutputDefinition {

		readonly key: string;

		constructor(config: {
			/**
			 * key/id of this data
			 */
			key: string;
		}) {
			super();
			this.key = config.key;
		}

		getDependencyId(): string {
			return "generic-" + this.key;
		}

	}

	/**
	 * raw vertex data containing data for or more vertex attributes
	 */
	export class VertexBuffer extends RenderGraphNodeOutputDefinition {

		readonly key: string;
		readonly attributes: VertexAttribute[];

		constructor(props: {
			/**
			 * key/id of this buffer
			 */
			key: string,
			/**
			 * attributes contained in this buffer
			 */
			attributes: VertexAttribute[]
		}) {
			super();
			this.key = props.key;
			this.attributes = props.attributes;
		}

		getDependencyId(): string {
			return "vertexbuffer-" + this.key;
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

	/**
	 * Combines vertex buffers and information about data layout
	 */
	export class VertexDescriptor extends RenderGraphNodeOutputDefinition {

		readonly key: string;
		readonly type: "standard" | "instanced";
		readonly buffers: string[];

		constructor(props: {
			/**
			 * the key/id of this vertex descriptor
			 */
			key: string,
			/**
			 * whether this is rendered as instanced of standard
			 */
			type: "standard" | "instanced",
			/**
			 * The buffers required for this vertex descriptor
			 */
			buffers: string[]
		}) {
			super();
			this.key = props.key;
			this.type = props.type;
			this.buffers = props.buffers;
		}

		getDependencyId(): string {
			return "vertexdescriptor-" + this.key;
		}

	}

	export class RenderTarget extends RenderGraphNodeOutputDefinition {

		readonly key: string;
		readonly enableDepth: boolean;
		readonly scalingFactor: number;

		constructor(props: {
			/**
			 * the key of this render target used to reference the resource
			 */
			key: string,
			/**
			 * whether to enable the depth buffer
			 */
			enableDepth: boolean,
			/**
			 * The scaling factor of this render target as multiples of the "screen" size
			 */
			scalingFactor: number
		}) {
			super();
			this.key = props.key;
			this.enableDepth = props.enableDepth;
			this.scalingFactor = props.scalingFactor;
		}

		getDependencyId(): string {
			return "rendertarget-" + this.key;
		}

	}

	export class Screen extends RenderGraphNodeOutputDefinition {

		getDependencyId(): string {
			return "screen";
		}

	}

}