import {RenderGraph} from "../core/graph/renderGraph";
import {Camera} from "../../shared/webgl/camera";
import {ChangeProvider} from "./changeProvider";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {HtmlRenderCommand} from "../core/html/htmlRenderCommand";
import {NoOpRenderGraphSorter} from "../core/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../core/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../core/html/htmlRenderGraphCompiler";
import {CityLabelsHtmlNode} from "./rendernodes/cityLabelsHtmlNode";
import {GameRepository} from "../../state/gameRepository";


export class GameHtmlRenderGraph extends RenderGraph<HtmlRenderCommand.Context> {

    private camera: Camera = new Camera();

    constructor(
        changeProvider: ChangeProvider,
        gameRepository: GameRepository
    ) {
        super({
            sorter: new NoOpRenderGraphSorter(),
            resourceManager: new HtmlResourceManager(),
            compiler: new HtmlRenderGraphCompiler(),
            nodes: [
                new ResourceIconsHtmlNode(changeProvider, gameRepository, () => this.camera),
                new CityLabelsHtmlNode(changeProvider, gameRepository, () => this.camera)
            ],
        });
    }

    public initialize() {
        super.initialize({});
    }

    public updateCamera(camera: Camera) {
        this.camera = camera;
        this.updateContext(ctx => ({
            ...ctx,
            camera: this.camera,
        }));
    }

    public execute() {
        super.execute();
    }
}