import {ChangeDetector} from "../../shared/changeDetector";
import {Camera} from "../../shared/webgl/camera";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";
import {RenderRepository} from "./RenderRepository";
import {EntitiesVertexNode} from "./rendernodes/entitiesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {RoutesVertexNode} from "./rendernodes/routesVertexNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";

interface Changes {
    initFrame: boolean,
    turn: boolean,
    commands: boolean,
    mapMode: boolean,
    camera: boolean
}

/**
 * Detects changes in the game state to determine whether a render node needs to update or not
 */
export class ChangeProvider {

    private readonly repository: RenderRepository;

    private readonly detectorCamera = new ChangeDetector();
    private readonly detectorCurrentTurn = new ChangeDetector();

    private frame: number = 0
    private changes: Changes = {
        initFrame: true,
        turn: true,
        commands: true,
        mapMode: true,
        camera: true,
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
        this.changes.commands = false; // todo this.detectorCommandRevId.check(this.commandDb.getRevId());
        this.changes.mapMode = false; // todo this.detectorMapMode.check(this.gameSessionDb.getMapMode())
        this.changes.camera = this.detectorCamera.check(camera.getHash())
    }

    /**
     * @return whether there are changes relevant to the render node with the given id
     */
    public hasChange(name: string): boolean {
        if(name === "basemesh") {
            return this.changes.initFrame
        }
        if(name === DetailsVertexNode.ID) {
            return this.changes.turn
        }
        if(name === EntitiesVertexNode.ID) {
            return this.changes.turn || this.changes.commands
        }
        if(name === OverlayVertexNode.ID) {
            return this.changes.turn || this.changes.mapMode
        }
        if(name === RoutesVertexNode.ID) {
            return this.changes.turn
        }
        if(name === TilesVertexNode.ID) {
            return this.changes.turn
        }
        return true;
    }

}