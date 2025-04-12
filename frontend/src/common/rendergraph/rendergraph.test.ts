import {RenderGraph} from "./renderGraph";

describe("render graph", () => {

	test("playground", () => {

		const graph = new RenderGraph();

		const texture = graph.createTexture()
			.withUrl("/test.png");

		const vertexCreatorMesh = graph.createVertexCreator();
		const vertexCreatorInstancesOut = vertexCreatorMesh.createOutput("mesh");

		const vertexCreatorInstances = graph.createVertexCreator();
		const vertexCreatorInstancesWaterOut = vertexCreatorInstances.createOutput("water");
		const vertexCreatorInstancesLandOut = vertexCreatorInstances.createOutput("land");

		const verticesMesh = graph.createVertexBuffer()
			.withInput(vertexCreatorInstancesLandOut);

		const verticesInstancesWater = graph.createVertexBuffer()
			.withInput(vertexCreatorInstancesWaterOut);

		const verticesInstancesLand = graph.createVertexBuffer()
			.withInput(vertexCreatorInstancesOut)

		const meshWater = graph.createVertexDescriptor()
			.withInput(verticesMesh)
			.withInput(verticesInstancesWater);

		const meshLand = graph.createVertexDescriptor()
			.withInput(verticesMesh)
			.withInput(verticesInstancesWater);

		const shader = graph.createShader()
			.withVertexShader("...")
			.withFragmentShader("...")
			.withInput(texture, "u_texture")
			.withInput(meshWater);

		const canvas = graph.createCanvas()
			.withInput(shader);

	});

});