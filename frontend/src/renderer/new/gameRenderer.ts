import {RenderGraph} from "../../common/rendergraph/renderGraph";

export class GameRenderer {

	private readonly renderGraph: RenderGraph;

	constructor() {
		this.renderGraph = new RenderGraph();

		const creatorTilesVertexData = this.renderGraph.createVertexCreator();

		const creatorTilesInstanceData = this.renderGraph.createVertexCreator();

		const vertexBufferTilesVertexData = this.renderGraph.createVertexBuffer()
			.withInput(creatorTilesVertexData.createOutput("tiles.vertexdata"));

		const vertexBufferTilesWater = this.renderGraph.createVertexBuffer()
			.withInput(creatorTilesInstanceData.createOutput("tiles.instances.water"));

		const vertexBufferTilesLand = this.renderGraph.createVertexBuffer()
			.withInput(creatorTilesInstanceData.createOutput("tiles.instances.land"));

		const vertexBufferTilesFog = this.renderGraph.createVertexBuffer()
			.withInput(creatorTilesInstanceData.createOutput("tiles.instances.fog"));

		const vertexDescriptorTilesWater = this.renderGraph.createVertexDescriptor()
			.withInput(vertexBufferTilesVertexData)
			.withInput(vertexBufferTilesWater);

		const vertexDescriptorTilesLand = this.renderGraph.createVertexDescriptor()
			.withInput(vertexBufferTilesVertexData)
			.withInput(vertexBufferTilesLand);

		const vertexDescriptorTilesFog = this.renderGraph.createVertexDescriptor()
			.withInput(vertexBufferTilesVertexData)
			.withInput(vertexBufferTilesFog);

		const shaderTilesWater = this.renderGraph.createShader()
			.withVertexShader("...")
			.withFragmentShader("...")
			.withInput(vertexDescriptorTilesWater);

		const shaderTilesLand = this.renderGraph.createShader()
			.withVertexShader("...")
			.withFragmentShader("...")
			.withInput(vertexDescriptorTilesLand);

		const shaderTilesFog = this.renderGraph.createShader()
			.withVertexShader("...")
			.withFragmentShader("...")
			.withInput(vertexDescriptorTilesFog);

		this.renderGraph.createCanvas()
			.withInput(shaderTilesWater)
			.withInput(shaderTilesLand)
			.withInput(shaderTilesFog);

	}
}