import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";

/**
 * Downloads a render graph as a Graphviz `.dot` file.
 */
export const downloadRenderGraphAsGraphviz = (
    nodes: readonly RenderGraphNode[],
    filename = "render-graph.dot",
    options: GraphvizExportOptions = {},
): void => {
    const blob = new Blob([exportRenderGraphAsGraphviz(nodes, options)], {type: "text/vnd.graphviz"});
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
export const copyRenderGraphAsGraphviz = async (
    nodes: readonly RenderGraphNode[],
    options: GraphvizExportOptions = {},
): Promise<void> => {
    await navigator.clipboard.writeText(exportRenderGraphAsGraphviz(nodes, options));
};

export interface GraphvizExportOptions {
    name?: string,
    /** Whether regular and WASM data nodes should be included in the output. */
    includeDataNodes?: boolean,
    /** Replaces the default label content. Returned strings become separate lines in the node. */
    nodeLabel?: (node: RenderGraphNode) => readonly string[],
}

/**
 * Creates a Graphviz DOT representation of render nodes and their dependencies.
 */
export const exportRenderGraphAsGraphviz = (
    nodesToExport: readonly RenderGraphNode[],
    options: GraphvizExportOptions = {},
): string => {
    const nodes = new Map<string, RenderGraphNode>();
    const edgeLabels = new Map<string, Set<string>>();
    const visitedNodes = new Set<string>();
    const visitedObjectsByConsumer = new WeakMap<RenderGraphNode, WeakSet<object>>();

    const visitNode = (node: RenderGraphNode): void => {
        nodes.set(node.id, node);
        if (visitedNodes.has(node.id)) return;
        visitedNodes.add(node.id);
        visitedObjectsByConsumer.set(node, new WeakSet<object>());

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
        if (typeof value !== "object" || value === null) return;
        const visitedObjects = visitedObjectsByConsumer.get(consumer);
        if (visitedObjects === undefined || visitedObjects.has(value)) return;
        visitedObjects.add(value);
        for (const [key, child] of Object.entries(value)) {
            if (typeof child !== "function") visitValue(child, consumer, `${path}.${key}`);
        }
    };

    for (const node of nodesToExport) visitNode(node);

    const includedNodes = [...nodes.values()].filter(node =>
        options.includeDataNodes !== false || (node.type !== "data" && node.type !== "wasm-data"),
    );
    const includedNodeIds = new Set(includedNodes.map(node => node.id));
    const dotIds = new Map<string, string>();
    includedNodes.forEach((node, index) => dotIds.set(node.id, `node${index}`));
    const graphName = dotEscape(options.name ?? "render_graph");
    const lines = [
        `digraph "${graphName}" {`,
        "    graph [rankdir=LR, bgcolor=\"transparent\", nodesep=0.45, ranksep=0.8, pad=0.2];",
        "    node [shape=box, style=\"rounded,filled\", color=\"#64748b\", fontname=\"Arial\", fontsize=10, margin=\"0.16,0.10\"];",
        "    edge [color=\"#64748b\", fontname=\"Arial\", fontsize=8, arrowsize=0.7];",
    ];

    for (const node of includedNodes) {
        const label = options.nodeLabel
            ? `label="${options.nodeLabel(node).map(dotEscape).join("\\n")}"`
            : `label=<${defaultHtmlNodeLabel(node)}>`;
        lines.push(`    ${dotIds.get(node.id)} [${label}, fillcolor="${colors[node.type] ?? "#f8fafc"}"];`);
    }
    for (const [edgeKey, labels] of edgeLabels) {
        const [dependencyId, consumerId] = edgeKey.split("->");
        if (!includedNodeIds.has(dependencyId) || !includedNodeIds.has(consumerId)) continue;
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

const htmlEscape = (value: string): string => value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

const shortNodeId = (id: string): string => id.length > 8 ? `${id.slice(0, 8)}...` : id;

const defaultNodeLabel = (node: RenderGraphNode): string[] => {
    const identity = (...details: string[]): string[] => [
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

const defaultHtmlNodeLabel = (node: RenderGraphNode): string => {
    const title = node.debugName
        ? `<B>${htmlEscape(node.debugName)}</B> <FONT POINT-SIZE="8"><I>${htmlEscape(shortNodeId(node.id))}</I></FONT>`
        : `<B>${htmlEscape(shortNodeId(node.id))}</B>`;
    const details = defaultNodeLabel(node)
        .map(detail => `<TR><TD ALIGN="LEFT">${htmlEscape(detail)}</TD></TR>`)
        .join("");

    return `<TABLE BORDER="0" CELLBORDER="0" CELLSPACING="0" CELLPADDING="2">` +
        `<TR><TD ALIGN="LEFT">${title}</TD></TR>` +
        `<TR><TD ALIGN="LEFT">${htmlEscape(node.type)}</TD></TR>` +
        `<TR><TD HEIGHT="8"></TD></TR>` +
        details +
        `</TABLE>`;
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
