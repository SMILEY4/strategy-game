import {GLUniformType, GLUniformValueType} from "../../../../common/webgl/glTypes";
import {GLTexture} from "../../../../common/webgl/glTexture";

/**
 * Inputs of render nodes
 */
export namespace NodeInput {

	/**
	 * Vertex buffer
	 */
	export class VertexBuffer {
		readonly name: string;

		constructor(props: { name: string }) {
			this.name = props.name;
		}
	}

	/**
	 * Vertex data
	 */
	export class VertexDescriptor {
		readonly vertexDataId: string;

		constructor(props: { id: string }) {
			this.vertexDataId = props.id;
		}
	}

	/**
	 * Shader program
	 */
	export class Shader {
		readonly vertexId: string;
		readonly fragmentId: string;

		constructor(props: { vertexId: string, fragmentId: string }) {
			this.vertexId = props.vertexId;
			this.fragmentId = props.fragmentId;
		}
	}

	/**
	 * Texture (2d or 3d lut cube)
	 */
	export class Texture {
		readonly path: string;
		readonly binding: string;
		readonly config: GLTexture.Config;

		constructor(props: { path: string, binding: string, config?: GLTexture.Config }) {
			this.path = props.path;
			this.binding = props.binding;
			this.config = props.config ? props.config : {};
		}
	}

	/**
	 * Texture (2d or 3d lut cube)
	 */
	export class ConditionalTexture<TContext> {
		readonly id: string;
		readonly paths: ({ path: string, condition: (ctx: TContext) => boolean })[];
		readonly binding: string;
		readonly config: GLTexture.Config;

		constructor(props: {
			id: string,
			paths: ({ path: string, condition: (ctx: TContext) => boolean })[],
			binding: string,
			config?: GLTexture.Config
		}) {
			this.id = props.id;
			this.paths = props.paths;
			this.binding = props.binding;
			this.config = props.config ? props.config : {};
		}
	}

	/**
	 * Texture Atlas
	 */
	export class TextureAtlas {
		readonly path: string;
		readonly binding: string;

		constructor(props: { path: string, binding: string }) {
			this.path = props.path;
			this.binding = props.binding;
		}
	}

	/**
	 * Texture Atlas data (data only, no textures)
	 */
	export class TextureAtlasData {
		readonly name: string;

		constructor(props: { name: string }) {
			this.name = props.name;
		}
	}

	/**
	 * Render target (treated as texture)
	 */
	export class RenderTarget {
		readonly renderTargetId: string;
		readonly binding: string;

		constructor(props: { renderTargetId: string, binding: string }) {
			this.renderTargetId = props.renderTargetId;
			this.binding = props.binding;
		}
	}

	/**
	 * the color to clear the screen/rendertarget with
	 */
	export class ClearColor {
		readonly clearColor: [number, number, number, number];

		constructor(props: { clearColor: [number, number, number, number] }) {
			this.clearColor = props.clearColor;
		}
	}

	/**
	 * the blend function
	 */
	export class BlendMode {

		readonly func: (gl: WebGL2RenderingContext) => void;

		constructor(props: { func: (gl: WebGL2RenderingContext) => void }) {
			this.func = props.func;
		}
	}

	/**
	 * Property, usually accessible in the shader
	 */
	export class Property<TContext> {
		readonly valueConstant: GLUniformValueType | null;
		readonly valueProvider: ((context: TContext) => GLUniformValueType) | null;
		readonly type: GLUniformType;
		readonly binding: string;

		constructor(props: {
			valueConstant?: GLUniformValueType | null,
			valueProvider?: ((context: TContext) => GLUniformValueType) | null,
			type: GLUniformType,
			binding: string
		}) {
			this.valueConstant = props.valueConstant !== undefined ? props.valueConstant : null;
			this.valueProvider = props.valueProvider !== undefined ? props.valueProvider : null;
			this.type = props.type;
			this.binding = props.binding;
		}
	}

}