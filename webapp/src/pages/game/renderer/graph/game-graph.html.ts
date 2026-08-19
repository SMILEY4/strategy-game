import type {GameRendererDataProvider} from "@pages/game/renderer/data/game-renderer-data-provider.ts";
import type {RenderGraphBuilder} from "@modules/rendergraph/render-graph-builder.ts";
import type {CommandCollection, EntityCollection, RenderCamera} from "@pages/game/renderer/data/models.ts";
import type {DataRenderGraphNode} from "@modules/rendergraph/nodes/rg-node.data.ts";
import type {HtmlDrawElement, HtmlDrawInstance} from "@modules/rendergraph/nodes/rg-node.html-draw.ts";
import {EntityUtils} from "@app/features/game/models/entity.ts";
import {mat4, vec3, vec4} from "gl-matrix";
import type {Camera} from "@app/features/game/models/camera.ts";
import type {HexPosition} from "@app/features/game/models/hex-position.ts";


export function gameGraphHtml(
    g: RenderGraphBuilder,
    dataProvider: GameRendererDataProvider,
    inputs: {
        dataCamera: DataRenderGraphNode<RenderCamera>
    },
) {

    const dataAllEntities = g.dataExternal<EntityCollection>(
        () => dataProvider.getEntities(),
        prev => prev?.revId !== dataProvider.getEntitiesRevId(),
    );

    const dataAllCommands = g.dataExternal<CommandCollection>(
        () => dataProvider.getCommands(),
        prev => prev?.revId !== dataProvider.getCommandsRevId(),
    );

    const elementsTransformer = g.transform<[EntityCollection, CommandCollection], HtmlDrawElement[]>({
        inputs: [dataAllEntities, dataAllCommands],
        func: (entities, commands) => {
            return [
                ...entities.entities.map(entity => {
                    if (EntityUtils.hasComponent(entity, "settlement")) {
                        return {
                            key: "entity/" + entity.id,
                            element: buildLabel("entity/settlement"),
                        } satisfies HtmlDrawElement;
                    }
                    return null;
                }),
                ...commands.commands.map(command => {
                    if (command.type === "found-capital") {
                        return {
                            key: "command/" + command.id,
                            element: buildLabel("cmd/found-capital"),
                        } satisfies  HtmlDrawElement;
                    }
                    return null;
                }),
            ].filter(it => !!it);
        },
    });

    const instancesTransformer = g.transform<[EntityCollection, CommandCollection, RenderCamera], HtmlDrawInstance[]>({
        inputs: [dataAllEntities, dataAllCommands, inputs.dataCamera],
        func: (entities, commands, camera) => {
            return [
                ...entities.entities.map(entity => {
                    if (EntityUtils.hasComponent(entity, "settlement")) {
                        return {
                            key: "entity/" + entity.id,
                            ...worldToView(hexToWorld(entity.position, 1, 1), camera)!,
                            positioning: "centered"
                        } satisfies HtmlDrawInstance;
                    }
                    return null;
                }),
                ...commands.commands.map(command => {
                    if (command.type === "found-capital") {
                        return {
                            key: "command/" + command.id,
                            ...worldToView(hexToWorld(command.location, 1, 1), camera)!,
                            positioning: "centered"
                        } satisfies  HtmlDrawInstance;
                    }
                    return null;
                }),
            ].filter(it => !!it);
        },
    });

    const draw = g.htmlDraw({
        elements: g.dataTransformer(elementsTransformer),
        instances: g.dataTransformer(instancesTransformer),
    });

    return {
        htmlDraw: draw,
    };
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

function hexToWorld(hex: HexPosition, radius: number, height: number): vec3 {
    const x = radius * (Math.sqrt(3) * hex.q + (Math.sqrt(3) / 2) * hex.r);
    const y = height;
    const z = radius * (1.5 * hex.r);
    return vec3.fromValues(x, y, z);
}

function buildLabel(text: string): HTMLElement {
    const box = document.createElement("div");
    box.textContent = text;
    box.style.display = "block";
    box.style.fontFamily = "sans-serif";
    box.style.fontSize = "14px";
    box.style.backgroundColor = "white";
    box.style.border = "1px solid black";
    box.style.color = "black";
    box.style.borderRadius = "4px";
    box.style.padding = "4px";
    return box;

}