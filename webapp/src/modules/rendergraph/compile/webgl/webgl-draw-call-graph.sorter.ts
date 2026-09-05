import type {WebGlDrawCallNode} from "@modules/rendergraph/compile/webgl/webgl-draw-call-graph.node.ts";
import type {RenderGraphNode} from "@modules/rendergraph/nodes/rg-node.ts";
import {tracer} from "@modules/monitoring/tracer.ts";

interface WebGlState {
    activeShader: RenderGraphNode | null;
    activeGeometry: RenderGraphNode | null;
    activeRendertarget: RenderGraphNode | null;
    activeTextures: (RenderGraphNode | null)[];
}

interface StepResult {
    order: WebGlDrawCallNode[];
    cost: number;
}

interface SortContext {
    memo: Map<string, StepResult>;
    nodeIds: Map<WebGlDrawCallNode, number>;
    resourceIds: WeakMap<object, number>;
    nextResourceId: number;
}

const MAX_CANDIDATE_WIDTH_TO_EXPLORE = 3;
const COST_CHANGE_RENDERTARGET = 100;
const COST_CHANGE_SHADER = 70;
const COST_CHANGE_GEOMETRY = 30;
const COST_CHANGE_TEXTURE = 10;

export function sortWebGlDrawCallNodes(nodes: WebGlDrawCallNode[], maxAmountActiveTextures: number) {
    const initialWebGlState: WebGlState = {
        activeShader: null,
        activeGeometry: null,
        activeRendertarget: null,
        activeTextures: Array(maxAmountActiveTextures).fill(null),
    };
    const context: SortContext = {
        memo: new Map(),
        nodeIds: new Map(nodes.map((node, index) => [node, index])),
        resourceIds: new WeakMap(),
        nextResourceId: 0,
    };
    const {order} = step(initialWebGlState, nodes, context);
    return order;
}

function step(currentState: WebGlState, openDrawCalls: WebGlDrawCallNode[], context: SortContext): StepResult {
    return tracer.span({ name: "step"}, ( )=> {
        if (openDrawCalls.length === 0) {
            return {order: [], cost: 0};
        }

        const key = stateKey(currentState, openDrawCalls, context);
        const cached = context.memo.get(key);
        if (cached !== undefined) {
            return cached;
        }

        // A set avoids scanning the remaining calls once for every dependency.
        const openSet = new Set(openDrawCalls);
        const candidates = openDrawCalls.filter(open => {
            return !open.dependsOn.some(dep => openSet.has(dep));
        });

        if (candidates.length === 0) {
            throw new Error("Invalid graph: no candidates found, but open draw calls remaining (possible cycle detected).");
        }

        const candidateEstimationsSorted = candidates
            .map(candidate => {
                const {nextState, transitionCost} = computeNextWebGlState(currentState, candidate);
                return {candidate, nextState, transitionCost};
            })
            .sort((a, b) => a.transitionCost - b.transitionCost);

        let bestResult: { candidate: WebGlDrawCallNode; cost: number; order: WebGlDrawCallNode[] } | null = null;
        for (let i = 0; i < Math.min(MAX_CANDIDATE_WIDTH_TO_EXPLORE, candidateEstimationsSorted.length); i++) {
            const {candidate, nextState, transitionCost} = candidateEstimationsSorted[i];
            const remaining = openDrawCalls.filter(it => it !== candidate);
            const subResult = step(nextState, remaining, context);
            const totalCost = transitionCost + subResult.cost;

            if (bestResult == null || totalCost < bestResult.cost) {
                bestResult = {
                    candidate,
                    cost: totalCost,
                    order: subResult.order,
                };
            }
        }

        if (bestResult === null) {
            throw new Error("Illegal state: no best result found");
        }

        const result = {
            order: [bestResult.candidate, ...bestResult.order],
            cost: bestResult.cost,
        };
        context.memo.set(key, result);
        return result;
    })
}

function stateKey(state: WebGlState, openDrawCalls: WebGlDrawCallNode[], context: SortContext): string {
    const openKey = openDrawCalls.map(node => context.nodeIds.get(node)).join(",");
    const resources = [
        state.activeShader,
        state.activeGeometry,
        state.activeRendertarget,
        ...state.activeTextures,
    ].map(resource => resource === null ? "-" : resourceId(resource, context));
    return `${openKey}|${resources.join(",")}`;
}

function resourceId(resource: RenderGraphNode, context: SortContext): string {
    let id = context.resourceIds.get(resource);
    if (id === undefined) {
        id = context.nextResourceId++;
        context.resourceIds.set(resource, id);
    }
    return String(id);
}

function computeNextWebGlState(previous: WebGlState, node: WebGlDrawCallNode): { nextState: WebGlState; transitionCost: number } {
    let cost = 0;

    const nextShader = node.requiresResources.shader;
    if (previous.activeShader !== nextShader) cost += COST_CHANGE_SHADER;

    const nextGeometry = node.requiresResources.geometry;
    if (previous.activeGeometry !== nextGeometry) cost += COST_CHANGE_GEOMETRY;

    const nextRendertarget = node.rendertarget;
    if (previous.activeRendertarget !== nextRendertarget) cost += COST_CHANGE_RENDERTARGET;

    const {nextTextures, diffCount} = computeNextTextures(previous.activeTextures, node.requiresResources.textures);
    cost += diffCount * COST_CHANGE_TEXTURE;

    return {
        nextState: {
            activeShader: nextShader,
            activeGeometry: nextGeometry,
            activeRendertarget: nextRendertarget,
            activeTextures: nextTextures,
        },
        transitionCost: cost,
    };
}

function computeNextTextures(prevTextures: (RenderGraphNode | null)[], requiredTextures: RenderGraphNode[]): { nextTextures: (RenderGraphNode | null)[]; diffCount: number } {
    let diffCount = 0;
    const nextTextures = [...prevTextures];
    const requiredTextureSet = new Set(requiredTextures);
    const activeTextureSet = new Set(nextTextures);

    requiredTextures.forEach(texture => {
        if (activeTextureSet.has(texture)) {
            return;
        }

        const emptySlot = nextTextures.findIndex(it => it === null);
        if (emptySlot !== -1) {
            nextTextures[emptySlot] = texture;
            activeTextureSet.add(texture);
            diffCount++;
            return;
        }

        const unusedSlot = nextTextures.findIndex(it => it === null || !requiredTextureSet.has(it));
        if (unusedSlot !== -1) {
            const evictedTexture = nextTextures[unusedSlot];
            if (evictedTexture !== null) {
                activeTextureSet.delete(evictedTexture);
            }
            nextTextures[unusedSlot] = texture;
            activeTextureSet.add(texture);
            diffCount++;
            return;
        }

        throw new Error("Could not find slot for required texture");
    });

    return {nextTextures, diffCount};
}
