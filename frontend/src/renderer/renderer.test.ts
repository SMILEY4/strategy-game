// import {GameRenderGraph} from "./game/gameRenderGraph";
// import {WebGlRenderGraphCompiler} from "./core/webgl/webglRenderGraphCompiler";
// import {WebglRenderContext} from "./core/webgl/webglRenderContext";
// import {WebglGraphSorter} from "./core/webgl/webglGraphSorter";
// import {AbstractRenderNode, RenderNodeConfig} from "./core/nodes/abstractRenderNode";
// import {TextureInputConfig} from "./core/resources/textureRenderResource";
// import {RenderTargetInputConfig, RenderTargetOutputConfig} from "./core/resources/renderTargetRenderResource";
//
// describe("renderer", () => {
//
//     test("basic", () => {
//
//         const graph = new GameRenderGraph();
//         graph.compile(new WebGlRenderGraphCompiler());
//
//         const context = new WebglRenderContext();
//         graph.execute(context);
//     });
//
//     describe("webgl sort", () => {
//
//         test("a", () => {
//             const sorted = new WebglGraphSorter().sort([
//                 renderNode({
//                     id: "A",
//                     inputs: [
//                         textureInput("path/texture/x"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.A"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "B",
//                     inputs: [
//                         textureInput("path/texture/v"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.B"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "C",
//                     inputs: [
//                         textureInput("path/texture/w"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.C"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "D",
//                     inputs: [
//                         renderTargetInput("output.A"),
//                         textureInput("path/texture/w"),
//                         textureInput("path/texture/x"),
//                         textureInput("path/texture/y"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.D"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "E",
//                     inputs: [
//                         renderTargetInput("output.D"),
//                         renderTargetInput("output.B"),
//                         renderTargetInput("output.C"),
//                     ],
//                     outputs: [],
//                 }),
//             ]);
//             console.log("SORTED:", sorted);
//         });
//
//         test("b", () => {
//             const sorted = new WebglGraphSorter().sort([
//                 renderNode({
//                     id: "A",
//                     inputs: [
//                         textureInput("path/texture/x"),
//                         textureInput("path/texture/t"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.A"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "B",
//                     inputs: [
//                         textureInput("path/texture/v"),
//                         textureInput("path/texture/t"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.B"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "C",
//                     inputs: [
//                         textureInput("path/texture/w"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.C"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "D",
//                     inputs: [
//                         renderTargetInput("output.A"),
//                         textureInput("path/texture/w"),
//                         textureInput("path/texture/x"),
//                         textureInput("path/texture/y"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("output.D"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "E",
//                     inputs: [
//                         renderTargetInput("output.D"),
//                         renderTargetInput("output.B"),
//                         renderTargetInput("output.C"),
//                     ],
//                     outputs: [],
//                 }),
//             ]);
//             console.log("SORTED:", sorted);
//         });
//
//         test("c", () => {
//             const sorted = new WebglGraphSorter().sort([
//                 renderNode({
//                     id: "A",
//                     inputs: [
//                         textureInput("v"),
//                         textureInput("x")
//                     ],
//                     outputs: [
//                         renderTargetOutput(".A"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "B",
//                     inputs: [
//                         renderTargetInput("A"),
//                     ],
//                     outputs: [
//                         renderTargetOutput("B"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "C",
//                     inputs: [
//                         textureInput("x"),
//                         textureInput("y")
//
//                     ],
//                     outputs: [
//                         renderTargetOutput("C"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "D",
//                     inputs: [
//                     ],
//                     outputs: [
//                         renderTargetOutput("D"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "E",
//                     inputs: [
//                         textureInput("y"),
//                         textureInput("z")
//                     ],
//                     outputs: [
//                         renderTargetOutput("E"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "F",
//                     inputs: [
//                         textureInput("w"),
//                         textureInput("y"),
//                         textureInput("z")
//                     ],
//                     outputs: [
//                         renderTargetOutput("F"),
//                     ],
//                 }),
//                 renderNode({
//                     id: "G",
//                     inputs: [
//                         textureInput("v"),
//                         textureInput("w"),
//                         renderTargetInput("B"),
//                         renderTargetInput("C"),
//                         renderTargetInput("D"),
//                         renderTargetInput("E"),
//                         renderTargetInput("F"),
//                     ],
//                     outputs: [],
//                 }),
//             ]);
//             console.log("SORTED:", sorted);
//             sorted.forEach(e => console.log("- " + e))
//         });
//
//     })
//
//
// });
//
// function textureInput(path: string): TextureInputConfig {
//     return {
//         type: "texture",
//         path: path,
//         binding: "",
//     };
// }
//
// function renderTargetInput(id: string): RenderTargetInputConfig {
//     return {
//         type: "render-target",
//         name: id,
//         binding: "",
//     };
// }
//
// function renderTargetOutput(id: string): RenderTargetOutputConfig {
//     return {
//         type: "render-target",
//         name: id,
//     };
// }
//
// function renderNode(config: RenderNodeConfig): AbstractRenderNode {
//     return new DummyRenderNode(config);
// }
//
// class DummyRenderNode extends AbstractRenderNode {
//
//     constructor(config: RenderNodeConfig) {
//         super(config);
//     }
//
//     execute(): void {
//     }
//
// }