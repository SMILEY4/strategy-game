import {RenderGraphNodeInputDefinition} from "./renderGraphNodeInputDefinition";
import {UID} from "../../uid";
import {GLTexture} from "../../webgl/glTexture";

export namespace NodeInputDefinition {

	/**
	 * Input to trigger execution of node by an external change.
	 */
	export class ExternalChangeTrigger extends RenderGraphNodeInputDefinition {

		readonly key: string;

		constructor(config: {
			/**
			 * key referencing the trigger
			 */
			key: string;
		}) {
			super();
			this.key = config.key;
		}

		getDependencyId(): string {
			return "external-" + UID.generate();
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return [this.key];
		}

	}

	/**
	 * any generic data
	 */
	export class GenericData extends RenderGraphNodeInputDefinition {

		readonly key: string;

		constructor(config: {
			/**
			 * key referencing the data resource
			 */
			key: string;
		}) {
			super();
			this.key = config.key;
		}

		getDependencyId(): string {
			return "generic-" + this.key;
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return [this.key];
		}

	}

	/**
	 * raw vertex data containing data for or more vertex attributes
	 */
	export class VertexBuffer extends RenderGraphNodeInputDefinition {

		readonly key: string;

		constructor(config: {
			/**
			 * key referencing the vertex buffer resource
			 */
			key: string;
		}) {
			super();
			this.key = config.key;
		}

		getDependencyId(): string {
			return "vertexbuffer-" + this.key;
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return [this.key];
		}

	}

	/**
	 * Describes combined vertex data / mesh used for rendering
	 */
	export class VertexDescriptor extends RenderGraphNodeInputDefinition {

		readonly key: string;

		constructor(config: {
			/**
			 * key referencing the vertex descriptor resource
			 */
			key: string;
		}) {
			super();
			this.key = config.key;
		}

		getDependencyId(): string {
			return "vertexdescriptor-" + this.key;
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return [this.key];
		}

	}

	/**
	 * Shader program (vertex & fragment shader) used for rendering.
	 */
	export class ShaderProgram extends RenderGraphNodeInputDefinition {

		readonly vertexKey: string;
		readonly fragmentKey: string;

		constructor(config: {
			/**
			 * key referencing the vertex shader resource
			 */
			vertexKey: string,
			/**
			 * key referencing the fragment shader resource
			 */
			fragmentKey: string
		}) {
			super();
			this.vertexKey = config.vertexKey;
			this.fragmentKey = config.fragmentKey;
		}

		getDependencyId(): string {
			return "shader-" + this.vertexKey + "-" + this.fragmentKey;
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return ["shader-" + this.vertexKey + "-" + this.fragmentKey];
		}

	}

	/**
	 * A texture loaded from an image url
	 */
	export class Texture extends RenderGraphNodeInputDefinition {

		readonly path: string;
		readonly binding: string;
		readonly config: GLTexture.Config;

		constructor(config: {
			/**
			 * the path/url to the image, used as a key to reference the resource
			 */
			path: string,
			/**
			 * the name to bind this resource to
			 */
			binding: string,
			/**
			 * the configuration of this texture
			 */
			config: GLTexture.Config
		}) {
			super();
			this.path = config.path;
			this.binding = config.binding;
			this.config = config.config;
		}

		getDependencyId(): string {
			return "texture-" + this.path;
		}

		getSharedResourceIds(): string[] {
			return ["texture-" + this.path];
		}

		getChangeKeys(): string[] {
			return ["texture-" + this.path];
		}

	}

	/**
	 * Textures loaded from an image url chosen by a given condition.
	 */
	export class ConditionalTexture extends RenderGraphNodeInputDefinition {

		private readonly key: string;
		private readonly entries: ({ path: string; condition: () => boolean })[];
		private readonly binding: string;
		readonly config: GLTexture.Config;

		constructor(config: {
			/**
			 * The key for this conditional texture
			 */
			key: string;
			/**
			 * The entries of this texture
			 */
			entries: ({
				/**
				 * Path/url to the image
				 */
				path: string,
				/**
				 * Condition, choose this path if condition is true
				 */
				condition: () => boolean,
			})[],
			/**
			 * the name to bind this resource to
			 */
			binding: string,
			/**
			 * the configuration of this texture
			 */
			config: GLTexture.Config
		}) {
			super();
			this.key = config.key;
			this.entries = config.entries;
			this.binding = config.binding;
			this.config = config.config;
		}

		getDependencyId(): string {
			return "conditionaltexture-" + this.key;
		}

		getSharedResourceIds(): string[] {
			return [];
		}

		getChangeKeys(): string[] {
			return ["conditionaltexture-" + this.key];
		}

	}

	/**
	 * A dynamic texture "created" by the renderer
	 */
	export class RenderTarget extends RenderGraphNodeInputDefinition {

		private readonly key: string;
		private readonly binding: string;

		constructor(config: {
			/**
			 * the key referencing the render target resource
			 */
			key: string,
			/**
			 * the name to bind this resource to
			 */
			binding: string,
		}) {
			super();
			this.key = config.key;
			this.binding = config.binding;
		}

		getDependencyId(): string {
			return "rendertarget-" + this.key;
		}

		getSharedResourceIds(): string[] {
			return ["rendertarget-" + this.key];
		}

		getChangeKeys(): string[] {
			return ["rendertarget-" + this.key];
		}

	}

}