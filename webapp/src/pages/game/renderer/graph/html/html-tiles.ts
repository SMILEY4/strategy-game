import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {VersionedContainer} from "@pages/game/renderer/data/versioned-data.ts";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {HtmlDrawElement, HtmlDrawInstance} from "@modules/rendergraph/nodes/rg-node.html-draw.ts";
import {mat4, vec3, vec4} from "gl-matrix";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";
import type {Tile} from "@app/features/game/models/tile.ts";
import {ResourceLabel} from "@pages/game/overlay/ResourceLabel.ts";

export function gameGraphHtmlTiles(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataCamera: DataRenderGraphNode<VersionedContainer<Camera>>
    },
) {

    const dataAllTiles = g.dataExternal<VersionedContainer<Tile[]>>( // todo: reuse from world-data.ts
        prev => prev?.revId !== dataProvider.getTiles().revId,
        () => dataProvider.getTiles().load(), "all tiles",
    );

    const elementsTransformer = g.transform<[VersionedContainer<Tile[]>], HtmlDrawElement[]>({
        inputs: [dataAllTiles],
        func: (tiles) => {
            return tiles.data
                .flatMap(tile => buildResourceIconElements(tile))
                .filter(it => !!it);
        },
    });

    const instancesTransformer = g.transform<[VersionedContainer<Tile[]>, VersionedContainer<Camera>], HtmlDrawInstance[]>({
        inputs: [dataAllTiles, inputs.dataCamera],
        func: (tiles, camera) => {
            return tiles.data
                .flatMap(tile => buildResourceIconInstances(tile, camera.data))
                .filter(it => !!it);
        },
    });

    const draw = g.htmlDraw({
        elements: g.dataTransformer(elementsTransformer),
        instances: g.dataTransformer(instancesTransformer),
    });

    return {
        htmlDrawTiles: draw,
    };
}

function buildResourceIconElements(tile: Tile): null | HtmlDrawElement[] {
    if (!tile.world.visible) {
        return null;
    }
    const elements: HtmlDrawElement[] = [];

    for (let index = 0; index < tile.world.value.resources.length; index++) {
        const resource = tile.world.value.resources[index];
        elements.push({
            key: "resource/" + tile.id + "/" + resource.type + "/" + index,
            element: ResourceLabel({
                type: resource.type,
            }),
        } satisfies HtmlDrawElement);
    }

    return elements;
}

function buildResourceIconInstances(tile: Tile, camera: Camera): HtmlDrawInstance[] | null {
    if (!tile.world.visible) {
        return null;
    }
    const elements: HtmlDrawInstance[] = [];

    const offsets = getResourceIconOffsets(tile.world.value.resources.length);

    for (let index = 0; index < tile.world.value.resources.length; index++) {
        const resource = tile.world.value.resources[index];
        const offset = offsets[index];

        const worldPosition = hexToWorld(tile.position, 1, 0.1);
        worldPosition[0] += offset.x;
        worldPosition[1] += offset.y;
        worldPosition[2] += offset.z;

        const position = worldToView(worldPosition, camera)!;

        elements.push({
            key: "resource/" + tile.id + "/" + resource.type + "/" + index,
            x: position.x,
            y: position.y,
            positioning: "centered",
        } satisfies HtmlDrawInstance);
    }

    return elements;
}

/** Returns centered screen-space offsets for resource labels within one tile. */
export function getResourceIconOffsets(count: number): { x: number, y: number, z: number }[] {
    if (count <= 0) {
        return [];
    }

    const spacing = 0.2;
    if (count === 1) {
        return [{x: 0, y: 0, z: 0}];
    }
    if (count === 2) {
        return [{x: -spacing, y: 0, z: 0}, {x: spacing, y: 0, z: 0}];
    }
    if (count === 3) {
        return [
            {x: -spacing, y: 0, z: -spacing * 0.6},
            {x: spacing, y: 0, z: -spacing * 0.6},
            {x: 0, y: 0, z: spacing * 0.6},
        ];
    }
    if (count === 4) {
        return [
            {x: -spacing / 2, y: 0, z: -spacing / 2},
            {x: spacing / 2, y: 0, z: -spacing / 2},
            {x: -spacing / 2, y: 0, z: spacing / 2},
            {x: spacing / 2, y: 0, z: spacing / 2},
        ];
    }

    const columns = Math.ceil(Math.sqrt(count));
    const offsets: { x: number, y: number, z: number }[] = [];
    let index = 0;
    let row = 0;
    while (index < count) {
        const rowLength = Math.min(columns, count - index);
        const rows = Math.ceil(count / columns);
        const z = (row - (rows - 1) / 2) * spacing;
        for (let column = 0; column < rowLength; column++) {
            offsets.push({
                x: (column - (rowLength - 1) / 2) * spacing,
                y: 0,
                z: z,
            });
            index++;
        }
        row++;
    }
    return offsets;
}

/**
 * Transforms given point in world to screen space
 * input: 3d point in world units
 * output: 2d point as normalized device coordinates [-1,+1]
 */
function worldToView(worldPoint: vec3, camera: Camera): { x: number, y: number } | null {

    const target = vec3.create();
    vec3.add(target, camera.position, camera.direction);

    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, camera.position, target, camera.up);

    const projMatrix = mat4.create();
    mat4.perspective(projMatrix, camera.fov, camera.aspect, camera.near, camera.far);

    const viewProjMatrix = mat4.create();
    mat4.multiply(viewProjMatrix, projMatrix, viewMatrix);

    const clipSpace = vec4.fromValues(
        worldPoint[0],
        worldPoint[1],
        worldPoint[2],
        1.0,
    );
    vec4.transformMat4(clipSpace, clipSpace, viewProjMatrix);

    const w = clipSpace[3];
    if (w <= 0) {
        return null;
    }

    const ndcX = clipSpace[0] / w;
    const ndcY = clipSpace[1] / w;
    return {x: ndcX, y: ndcY};
}

/**
 * Transforms given point in hex to world space
 */
function hexToWorld(hex: HexPosition, radius: number, height: number): vec3 {
    const x = radius * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    const y = height;
    const z = radius * (1.5 * hex.r);
    return vec3.fromValues(x, y, z);
}
