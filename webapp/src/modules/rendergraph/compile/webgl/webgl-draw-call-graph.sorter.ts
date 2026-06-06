import type {WebGlDrawCallNode} from "@/modules/rendergraph/compile/webgl/webgl-draw-call-graph.node.ts";
import type {RenderGraphNode} from "@/modules/rendergraph/nodes/rg-node.ts";


interface WebGlState {
    activeShader: RenderGraphNode | null;
    activeGeometry: RenderGraphNode | null;
    activeRendertarget: RenderGraphNode | null;
    activeTextures: (RenderGraphNode | null)[];
}

interface StepResult {
    order: WebGlDrawCallNode[],
    cost: number
}

const MAX_CANDIDATE_WIDTH_TO_EXPLORE = 3;
const COST_CHANGE_RENDERTARGET = 100
const COST_CHANGE_SHADER = 70
const COST_CHANGE_GEOMETRY = 30
const COST_CHANGE_TEXTURE = 10

export function sortWebGlDrawCallNodes(nodes: WebGlDrawCallNode[], maxAmountActiveTextures: number) {
    const initialWebGlState: WebGlState = {
        activeShader: null,
        activeGeometry: null,
        activeRendertarget: null,
        activeTextures: Array(maxAmountActiveTextures).map(() => null),
    };
    const {order} = step(initialWebGlState, nodes);
    return order;
}

function step(currentState: WebGlState, openDrawCalls: WebGlDrawCallNode[]): StepResult {

    // no more open calls to sort
    if (openDrawCalls.length === 0) {
        return {order: [], cost: 0};
    }


    // find candidates, i.e. draw calls that do not depend on any other remaining draw call
    const candidates = openDrawCalls.filter(open => {
        return !open.dependsOn.some(dep => openDrawCalls.includes(dep))
    })

    // no candidates, but open draw calls remaining => invalid graph
    if (candidates.length == 0) {
        throw new Error("Invalid graph: no candidates found, but open draw calls remaining (possible cycle detected).");
    }

    // evaluate candidates
    const candidateData = candidates.map(candidate => {
        const {nextState, transitionCost} = computeNextWebGlState(currentState, candidate);
        return { candidate, nextState, transitionCost}
    })
    const candidateEstimationsSorted = candidateData.sort((a, b) => a.transitionCost - b.transitionCost);

    // explore top n candidates
    let bestResult: { candidate: WebGlDrawCallNode, cost: number, order: WebGlDrawCallNode[] } | null = null
    for (let i = 0; i < Math.min(MAX_CANDIDATE_WIDTH_TO_EXPLORE, candidateEstimationsSorted.length); i++) {
        const {candidate, nextState, transitionCost} = candidateEstimationsSorted[i];

        const remaining = openDrawCalls.filter(it => it != candidate)

        const subResult = step(nextState, remaining);

        const totalCost = transitionCost + subResult.cost

        if (bestResult == null || totalCost < bestResult.cost) {
            bestResult = {
                candidate,
                cost: subResult.cost + transitionCost,
                order: subResult.order
            };
        }
    }

    if (bestResult === null) {
        throw new Error("Illegal state: no best result found")
    }

    return {
        order: [bestResult.candidate, ...bestResult.order],
        cost: bestResult.cost,
    }
}


function computeNextWebGlState(previous: WebGlState, node: WebGlDrawCallNode): { nextState: WebGlState, transitionCost: number } {

    let cost = 0

    const nextShader = node.requiresResources.shader
    if (previous.activeShader !== nextShader) cost += COST_CHANGE_SHADER

    const nextGeometry = node.requiresResources.geometry
    if (previous.activeGeometry !== nextGeometry) cost += COST_CHANGE_GEOMETRY

    const nextRendertarget = node.rendertarget
    if (previous.activeRendertarget !== nextRendertarget) cost += COST_CHANGE_RENDERTARGET

    const { nextTextures, diffCount} = computeNextTextures(previous.activeTextures, node.requiresResources.textures)
    cost += diffCount * COST_CHANGE_TEXTURE

    return {
        nextState: {
            activeShader: nextShader,
            activeGeometry: nextGeometry,
            activeRendertarget: nextRendertarget,
            activeTextures: nextTextures
        },
        transitionCost: cost
    }
}

function computeNextTextures(prevTextures: (RenderGraphNode | null)[], requiredTextures: RenderGraphNode[]): { nextTextures: (RenderGraphNode | null)[], diffCount: number } {

    let diffCount = 0

    const nextTextures = [...prevTextures]

    requiredTextures.forEach(texture => {

        // check if already active
        if(nextTextures.some(it => it === texture)) {
            return
        }

        // find first empty slot
        const emptySlot = nextTextures.findIndex(it => it === null)
        if(emptySlot !== -1) {
            nextTextures[emptySlot] = texture
            diffCount++
            return
        }

        // find first unused slot
        const unusedSlot = nextTextures.findIndex(it => it === null || !requiredTextures.includes(it))
        if(unusedSlot !== -1) {
            nextTextures[unusedSlot] = texture
            diffCount++
            return
        }

        throw new Error("Could not find slot for required texture")
    })

    return {nextTextures, diffCount,}
}
