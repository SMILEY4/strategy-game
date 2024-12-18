import {DrawRenderNode} from "../../common/graph/drawRenderNode";
import {GLUniformType} from "../../../common/webgl/glTypes";
import {NodeInput} from "../../common/graph/nodeInput";
import {NodeOutput} from "../../common/graph/nodeOutput";
import {TileRepository} from "../../../state/repository/tileRepository";

export class OverlayDrawNode extends DrawRenderNode {

	public static readonly ID = "drawnode.tilesoverlay";

	private readonly tileRepository: TileRepository;

	constructor(
		tileRepository: TileRepository,
		vpMatrixProvider: () => Float32Array,
	) {
		super({
			id: OverlayDrawNode.ID,
			input: [
				new NodeInput.ClearColor({
					clearColor: [0, 0, 0, 0],
				}),
				new NodeInput.Shader({
					vertexId: "overlay.vert",
					fragmentId: "overlay.frag",
				}),
				new NodeInput.VertexDescriptor({
					id: "vertexdata.overlay",
				}),
				new NodeInput.Property({
					binding: "u_viewProjection",
					type: GLUniformType.MAT3,
					valueConstant: null,
					valueProvider: vpMatrixProvider,
				}),
				new NodeInput.Texture({
					path: "/textures/noise_watercolor.png",
					binding: "u_noise",
				}),
				new NodeInput.Property({
					binding: "u_time",
					type: GLUniformType.FLOAT,
					valueConstant: null,
					valueProvider: () => (Date.now() / 1000) % 10000,
				}),
				//==== OVERLAY =======================================
				new NodeInput.Property({
					binding: "u_overlay.borderThickness",
					type: GLUniformType.FLOAT,
					valueConstant: 0.15,
				}),
				new NodeInput.Property({
					binding: "u_overlay.borderOpacity",
					type: GLUniformType.FLOAT,
					valueConstant: 1.0,
				}),
				new NodeInput.Property({
					binding: "u_overlay.fillOpacity",
					type: GLUniformType.FLOAT,
					valueConstant: 0.7,
				}),
				//==== TILE SELECTION ================================
				new NodeInput.Property({
					binding: "u_tileSelection.position",
					type: GLUniformType.INT_VEC2,
					valueConstant: null,
					valueProvider: () => {
						const tile = this.tileRepository.getSelected();
						if (tile) {
							return [tile.q, tile.r];
						} else {
							return [99999, 99999];
						}
					},
				}),
				new NodeInput.Property({
					binding: "u_tileSelection.thickness",
					type: GLUniformType.FLOAT,
					valueConstant: 0.1,
				}),
				new NodeInput.Property({
					binding: "u_tileSelection.color0",
					type: GLUniformType.VEC4,
					valueConstant: [255/255,215/255,0/255, 1.0],
				}),
				new NodeInput.Property({
					binding: "u_tileSelection.color1",
					type: GLUniformType.VEC4,
					valueConstant: [1.0, 1.0, 1.0, 1.0],
				}),
			],
			output: [
				new NodeOutput.RenderTarget({
					renderTargetId: "rendertarget.overlay",
					depth: false,
					scale: 1,
				}),
			],
		});
		this.tileRepository = tileRepository;
	}
}