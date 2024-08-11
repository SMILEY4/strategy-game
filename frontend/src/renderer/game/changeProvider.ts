import {ChangeDetector} from "../../shared/changeDetector";
import {Camera} from "../../shared/webgl/camera";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";
import {RenderRepository} from "./renderRepository";
import {EntitiesVertexNode} from "./rendernodes/entitiesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {RoutesVertexNode} from "./rendernodes/routesVertexNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {WorldObjectsHtmlNode} from "./rendernodes/worldObjectsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {SettlementsHtmlNode} from "./rendernodes/settlementsHtmlNode";

interface Changes {
    initFrame: boolean,
    turn: boolean,
    mapMode: boolean,
    camera: boolean,
    movementPaths: boolean,
}

/**
 * Detects changes in the game state to determine whether a render node needs to update or not
 */
export class ChangeProvider {

    private readonly repository: RenderRepository;

    private readonly detectorCamera = new ChangeDetector();
    private readonly detectorCurrentTurn = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();
    private readonly detectorMovementPaths = new ChangeDetector();

    private frame: number = 0
    private changes: Changes = {
        initFrame: true,
        turn: true,
        mapMode: true,
        camera: true,
        movementPaths: true,
    }

    constructor(renderRepository: RenderRepository,) {
        this.repository = renderRepository;
    }

    /**
     * Detect changes for the current/upcoming frame
     */
    public prepareFrame(camera: Camera) {
        if(this.frame >= 2) {
            this.changes.initFrame = false
        } else {
            this.changes.initFrame = true
            this.frame ++;
        }
        this.changes.turn = this.detectorCurrentTurn.check(this.repository.getTurn());
        this.changes.mapMode = this.detectorMapMode.check(this.repository.getMapMode())
        this.changes.camera = this.detectorCamera.check(camera.getHash())
        this.changes.movementPaths = this.detectorMovementPaths.check(this.repository.getMovementPathsCheckId())
    }

    /**
     * @return whether there are changes relevant to the action or render-node with the given id
     */
    public hasChange(name: string): boolean {
        if(name === "basemesh") {
            return this.changes.initFrame
        }
        if(name === DetailsVertexNode.ID) {
            return this.changes.turn
        }
        if(name === EntitiesVertexNode.ID) {
            return this.changes.turn
        }
        if(name === OverlayVertexNode.ID) {
            return this.changes.turn || this.changes.mapMode || this.changes.movementPaths
        }
        if(name === RoutesVertexNode.ID) {
            return this.changes.turn
        }
        if(name === TilesVertexNode.ID) {
            return this.changes.turn
        }
        if(name === ResourceIconsHtmlNode.ID) {
            return this.changes.turn || this.changes.mapMode || this.changes.camera
        }
        if(name === WorldObjectsHtmlNode.ID) {
            return this.changes.turn || this.changes.camera
        }
        if(name === PathsHtmlNode.ID) {
            return this.changes.turn || this.changes.camera || this.changes.movementPaths
        }
        if(name === SettlementsHtmlNode.ID) {
            return this.changes.turn || this.changes.camera
        }
        return true;
    }

}