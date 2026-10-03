import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";

/**
 * Downloads a render graph as a Graphviz `.dot` file.
 */
export const downloadRenderGraphAsGraphviz = (
    roots: readonly RenderGraphNode[],
    filename = "render-graph.dot",
): void => {
    const blob = new Blob([exportRenderGraphAsGraphviz(roots)], {type: "text/vnd.graphviz"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
};

/**
 * Copies a render graph's Graphviz DOT representation to the clipboard.
 */
export const copyRenderGraphAsGraphviz = async (roots: readonly RenderGraphNode[]): Promise<void> => {
    await navigator.clipboard.writeText(exportRenderGraphAsGraphviz(roots));
};

export interface GraphvizExportOptions {
    name?: string,
    /** Replaces the default label content. Returned strings become separate lines in the node. */
    nodeLabel?: (node: RenderGraphNode) => readonly string[],
}

/**
 * Creates a Graphviz DOT representation of render nodes and their dependencies.
 */
export const exportRenderGraphAsGraphviz = (
    roots: readonly RenderGraphNode[],
    options: GraphvizExportOptions = {},
): string => {
    const nodes = new Map<string, RenderGraphNode>();
    const edgeLabels = new Map<string, Set<string>>();
    const visitedNodes = new Set<string>();
    const visitedObjects = new WeakSet<object>();

    const visitNode = (node: RenderGraphNode): void => {
        nodes.set(node.id, node);
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);

        for (const [key, value] of Object.entries(node)) {
            if (key === "type" || key === "id" || typeof value === "function") continue;
            visitValue(value, node, key);
        }
    };

    const visitValue = (value: unknown, consumer: RenderGraphNode, path: string): void => {
        if (isRenderGraphNode(value)) {
            nodes.set(value.id, value);
            const edgeKey = `${value.id}->${consumer.id}`;
            const labels = edgeLabels.get(edgeKey) ?? new Set<string>();
            labels.add(path);
            edgeLabels.set(edgeKey, labels);
            visitNode(value);
            return;
        }
        if (typeof value !== "object" || value === null || visitedObjects.has(value)) return;
        visitedObjects.add(value);
        for (const [key, child] of Object.entries(value)) {
            if (typeof child !== "function") visitValue(child, consumer, `${path}.${key}`);
        }
    };

    for (const root of roots) visitNode(root);

    const dotIds = new Map<string, string>();
    [...nodes.keys()].forEach((id, index) => dotIds.set(id, `node${index}`));
    const graphName = dotEscape(options.name ?? "render_graph");
    const lines = [
        `digraph "${graphName}" {`,
        "    graph [rankdir=LR, bgcolor=\"transparent\", nodesep=0.45, ranksep=0.8, pad=0.2];",
        "    node [shape=box, style=\"rounded,filled\", color=\"#64748b\", fontname=\"Arial\", fontsize=10, margin=\"0.16,0.10\"];",
        "    edge [color=\"#64748b\", fontname=\"Arial\", fontsize=8, arrowsize=0.7];",
    ];

    for (const node of nodes.values()) {
        const labelLines = options.nodeLabel?.(node) ?? [node.type, ...defaultNodeLabel(node)];
        const label = labelLines.map(dotEscape).join("\\n");
        lines.push(`    ${dotIds.get(node.id)} [label="${label}", fillcolor="${colors[node.type] ?? "#f8fafc"}"];`);
    }
    for (const [edgeKey, labels] of edgeLabels) {
        const [dependencyId, consumerId] = edgeKey.split("->");
        const label = [...labels].join(", ");
        lines.push(`    ${dotIds.get(dependencyId)} -> ${dotIds.get(consumerId)} [label="${dotEscape(label)}"];`);
    }
    lines.push("}");
    return lines.join("\n");
};

const isRenderGraphNode = (value: unknown): value is RenderGraphNode => {
    if (typeof value !== "object" || value === null) return false;
    const candidate = value as { type?: unknown, id?: unknown };
    return typeof candidate.id === "string" && typeof candidate.type === "string" && nodeTypes.has(candidate.type);
};

const dotEscape = (value: string): string => value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("\n", "\\n")
    .replaceAll("\r", "");

const defaultNodeLabel = (node: RenderGraphNode): string[] => {
    const id = `id: ${node.id}`;
    const identity = (...details: string[]): string[] => [
        id,
        ...(node.debugName === undefined ? [] : [`name: ${node.debugName}`]),
        ...details,
    ];
    switch (node.type) {
        case "canvas":
            return identity(`passes: ${node.renderPasses.length}`, `clear: ${node.clearColor === null ? "none" : "yes"}`);
        case "canvas-size":
            return identity();
        case "camera":
            return identity(`projection: ${node.data.type}`);
        case "data":
            return identity(`source: ${node.source.type}`);
        case "draw":
            return identity(`inputs: ${Object.keys(node.inputs).length}`, `depth write: ${node.writeDepth}`, `depth test: ${node.testDepth.glEnum}`);
        case "geometry":
            return identity(`primitive: ${node.primitiveTypes}`, `sources: ${node.sources.length}`);
        case "html-container":
            return identity(`element: ${node.elementId}`, `passes: ${node.renderPasses.length}`);
        case "html-draw":
            return identity("elements and instances");
        case "pick-rendertarget-attachment":
            return identity(`attachment: ${node.attachment}`);
        case "rendertarget":
            return identity(`passes: ${node.renderPasses.length}`, `attachments: ${Object.keys(node.attachments).join(", ")}`);
        case "select-texture":
            return identity(`inputs: ${node.inputs.length}`, `options: ${Object.keys(node.options).join(", ")}`);
        case "shader":
            return identity(`vertex source: ${node.srcVertex.length} characters`, `fragment source: ${node.srcFragment.length} characters`);
        case "texture":
            return identity(`url: ${node.url}`, `wrap: ${node.wrap}`, `min/mag: ${node.filterMin} / ${node.filterMag}`);
        case "transform":
            return identity(`inputs: ${node.inputs.length}`);
        case "transform-multi-out":
            return identity(`inputs: ${node.inputs.length}`, `outputs: ${node.outputs.join(", ")}`);
        case "transform-vertex-out":
            return identity(`inputs: ${node.inputs.length}`, `outputs: ${Object.keys(node.outputs).join(", ")}`);
        case "wasm-data":
            return identity(`source: ${node.source.type}`, ...(node.source.type === "wasm" && node.source.key ? [`key: ${node.source.key}`] : []));
        case "wasm-operation":
            return identity(`wasm inputs: ${node.wasmInputs.length}`, `data inputs: ${node.dataInputs.length}`, `outputs: ${node.outputs.join(", ")}`);
    }
};

const nodeTypes = new Set([
    "canvas",
    "canvas-size",
    "camera",
    "data",
    "draw",
    "geometry",
    "html-container",
    "html-draw",
    "pick-rendertarget-attachment",
    "rendertarget",
    "select-texture",
    "shader",
    "texture",
    "transform",
    "transform-multi-out",
    "transform-vertex-out",
    "wasm-data",
    "wasm-operation",
]);

const colors: Record<string, string> = {
    canvas: "#dbeafe",
    "canvas-size": "#dbeafe",
    camera: "#ede9fe",
    data: "#dcfce7",
    draw: "#fef3c7",
    geometry: "#fce7f3",
    "html-container": "#cffafe",
    "html-draw": "#cffafe",
    "pick-rendertarget-attachment": "#ffedd5",
    rendertarget: "#ffedd5",
    "select-texture": "#f3e8ff",
    shader: "#e0e7ff",
    texture: "#e0f2fe",
    transform: "#dcfce7",
    "transform-multi-out": "#dcfce7",
    "transform-vertex-out": "#dcfce7",
    "wasm-data": "#f1f5f9",
    "wasm-operation": "#f1f5f9",
};
