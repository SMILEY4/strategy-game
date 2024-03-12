import {EMPTY_HTML_DATA_RESOURCE, HtmlDataResource, HtmlRenderNode} from "../../core/graph/htmlRenderNode";
import {NodeOutput} from "../../core/graph/nodeOutput";
import {Camera} from "../../../shared/webgl/camera";
import {ChangeProvider} from "../changeProvider";
import {buildMap} from "../../../shared/utils";
import {TileIdentifier} from "../../../models/tile";
import {Projections} from "../../../shared/webgl/projections";
import {CityDatabase} from "../../../state/cityDatabase";

export class HtmlCityLabelsNode extends HtmlRenderNode {

    private readonly changeProvider: ChangeProvider;
    private readonly cityDb: CityDatabase;
    private readonly camera: () => Camera;

    constructor(
        changeProvider: ChangeProvider,
        cityDb: CityDatabase,
        camera: () => Camera,
    ) {
        super({
            id: "htmlnode.citylabels",
            input: [],
            output: [
                new NodeOutput.HtmlContainer({
                    id: "game-canvas-overlay",
                }),
                new NodeOutput.HtmlData({
                    name: "htmldata.citylabels",
                    renderFunction: (element: any, html: HTMLElement) => render(this.camera(), element, html),
                }),
            ],
        });
        this.changeProvider = changeProvider;
        this.cityDb = cityDb;
        this.camera = camera;
    }

    public execute(): HtmlDataResource {
        console.log(this.camera().getZoom());
        if (!this.changeProvider.hasChange("htmlnode.citylabels")) {
            return EMPTY_HTML_DATA_RESOURCE;
        }

        const elements: CityLabelElement[] = [];

        const cities = this.cityDb.queryMany(CityDatabase.QUERY_ALL, null);
        for (let i = 0, n = cities.length; i < n; i++) {
            const city = cities[i];
            if (this.isVisible(city.tile, 0)) {
                elements.push({
                    tile: city.tile,
                    name: city.identifier.name,
                });
            }
        }

        return new HtmlDataResource({
            outputs: buildMap({
                "htmldata.citylabels": elements,
            }),
        });
    }

    private isVisible(tile: TileIdentifier, padding: number): boolean {
        const camera = this.camera();
        const cameraMin = Projections.screenToWorld(camera, 0, camera.getClientHeight());
        const cameraMax = Projections.screenToWorld(camera, camera.getClientWidth(), 0);
        const tilePos = Projections.hexToWorld(tile.q, tile.r);
        return (cameraMin.x - padding) < tilePos.x && tilePos.x < (cameraMax.x + padding)
            && (cameraMin.y - padding) < tilePos.y && tilePos.y < (cameraMax.y + padding);
    }

}

interface CityLabelElement {
    tile: TileIdentifier,
    name: string,
}

function render(camera: Camera, element: CityLabelElement, html: HTMLElement): void {
    const pos = Projections.hexToScreen(camera, element.tile.q, element.tile.r, [0, -6]);
    pos.y = camera.getClientHeight() - pos.y;
    html.className = "world-ui__label";
    html.style.left = pos.x + "px";
    html.style.top = pos.y + "px";
    html.style.backgroundImage = "";
    html.textContent = element.name;
}