import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {MapMode} from "../../../models/mapMode";
import {TerrainResourceType} from "../../../models/terrainResourceType";
import {Tile, TileIdentifier} from "../../../models/tile";
import {Projections} from "../../../shared/webgl/projections";
import {GameRepository} from "../../../state/gameRepository";

export class ResourceIconsHtmlNode extends HtmlRenderNode {

    private readonly changeProvider: ChangeProvider;
    private readonly gameRepository: GameRepository;
    private readonly camera: () => Camera;

    constructor(
        changeProvider: ChangeProvider,
        gameRepository: GameRepository,
        camera: () => Camera,
    ) {
        super({
            id: "htmlnode.resourceicons",
            input: [],
            output: [
                new NodeOutput.HtmlContainer({
                    id: "game-canvas-overlay",
                }),
                new NodeOutput.HtmlData({
                    name: "htmldata.resourceicons",
                    renderFunction: (element: any, html: HTMLElement) => render(this.camera(), element, html),
                }),
            ],
        });
        this.changeProvider = changeProvider;
        this.gameRepository = gameRepository;
        this.camera = camera;
    }

    public execute(): HtmlDataResource {
        if (!this.changeProvider.hasChange("htmlnode.resourceicons")) {
            return EMPTY_HTML_DATA_RESOURCE;
        }

        const elements: ResourceIconElement[] = [];

        // if (this.camera().getZoom() > 3) {
            // if (this.gameRepository.getMapMode() === MapMode.RESOURCES) {
            //     const tiles = this.gameRepository.getTilesAll();
            //     for (let i = 0, n = tiles.length; i < n; i++) {
            //         const tile = tiles[i];
                    // if (tile.basic.resourceType.visible && tile.basic.resourceType.value !== TerrainResourceType.NONE && this.isVisible(tile, 0)) {
                    //     elements.push({
                    //         tile: tile.identifier,
                    //         type: tile.basic.resourceType.value,
                    //     });
                    // }
            //     }
            // }
        // }

        return new HtmlDataResource({
            outputs: buildMap({
                "htmldata.resourceicons": elements,
            }),
        });
    }

    private isVisible(tile: Tile, padding: number): boolean {
        const camera = this.camera();
        const cameraMin = Projections.screenToWorld(camera, 0, camera.getClientHeight());
        const cameraMax = Projections.screenToWorld(camera, camera.getClientWidth(), 0);
        const tilePos = Projections.hexToWorld(tile.identifier.q, tile.identifier.r);
        return (cameraMin.x - padding) < tilePos.x && tilePos.x < (cameraMax.x + padding)
            && (cameraMin.y - padding) < tilePos.y && tilePos.y < (cameraMax.y + padding);
    }

}

interface ResourceIconElement {
    tile: TileIdentifier,
    type: TerrainResourceType,
}

function render(camera: Camera, element: ResourceIconElement, html: HTMLElement): void {
    const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r);
    pos.y = camera.getClientHeight() - pos.y;
    html.className = "world-ui__icon";
    html.style.left = pos.x + "px";
    html.style.top = pos.y + "px";
    html.style.backgroundImage = "url('" + element.type.icon + "')";
    html.textContent = "";
}