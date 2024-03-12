import {RenderGraph} from "../core/graph/renderGraph";
import {Camera} from "../../shared/webgl/camera";
import {TileDatabase} from "../../state/tileDatabase";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {ChangeProvider} from "./changeProvider";
import {HtmlResourceIconsNode} from "./rendernodes/htmlResourceIconsNode";
import {HtmlRenderContext} from "../core/html/htmlRenderCommand";
import {NoOpRenderGraphSorter} from "../core/prebuilt/NoOpRenderGraphSorter";
import {HtmlResourceManager} from "../core/html/htmlResourceManager";
import {HtmlRenderGraphCompiler} from "../core/html/htmlRenderGraphCompiler";


export class GameHtmlRenderGraph extends RenderGraph<HtmlRenderContext> {

    private camera: Camera = new Camera();

    constructor(
        changeProvider: ChangeProvider,
        tileDb: TileDatabase,
        gameSessionDb: GameSessionDatabase,
    ) {
        super({
            sorter: new NoOpRenderGraphSorter(),
            resourceManager: new HtmlResourceManager(),
            compiler: new HtmlRenderGraphCompiler(),
            nodes: [
                new HtmlResourceIconsNode(changeProvider, tileDb, gameSessionDb, () => this.camera),
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