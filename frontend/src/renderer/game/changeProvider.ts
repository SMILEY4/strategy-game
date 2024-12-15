import {ChangeDetector} from "../../common/changeDetector";
import {Camera} from "../../common/webgl/camera";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";
import {EntitiesVertexNode} from "./rendernodes/entitiesVertexNode";
import {OverlayVertexNode} from "./rendernodes/overlayVertexNode";
import {RoutesVertexNode} from "./rendernodes/routesVertexNode";
import {TilesVertexNode} from "./rendernodes/tilesVertexNode";
import {ResourceIconsHtmlNode} from "./rendernodes/resourceIconsHtmlNode";
import {WorldObjectsHtmlNode} from "./rendernodes/worldObjectsHtmlNode";
import {PathsHtmlNode} from "./rendernodes/pathsHtmlNode";
import {SettlementsHtmlNode} from "./rendernodes/settlementsHtmlNode";
import {SessionRepository} from "../../state/repository/sessionRepository";
import {WorldObjectRepository} from "../../state/repository/worldObjectRepository";

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

    private readonly sessionRepository: SessionRepository;
    private readonly worldObjectRepository: WorldObjectRepository;

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

    constructor(
        sessionRepository: SessionRepository,
        worldObjectRepository: WorldObjectRepository
    ) {
        this.sessionRepository = sessionRepository;
        this.worldObjectRepository = worldObjectRepository;
    }

    /**
     * Resets this change provider to an initial state
     */
    public reset() {
        this.frame = 0;
        this.changes = {
            initFrame: true,
            turn: true,
            mapMode: true,
            camera: true,
            movementPaths: true,
        };
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
        this.changes.turn = this.detectorCurrentTurn.check(this.sessionRepository.getTurn());
        this.changes.mapMode = this.detectorMapMode.check(this.sessionRepository.getMapMode())
        this.changes.camera = this.detectorCamera.check(camera.getHash())
        this.changes.movementPaths = this.detectorMovementPaths.check(this.getMovementPathsCheckId())
    }

    /**
     * @return whether there are changes relevant to the action or render-node with the given id
     */
    public hasChange(name: string): boolean {
        if(this.changes.initFrame) {
            return true;
        }
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

    private getMovementPathsCheckId(): string {
        let str = "";
        this.worldObjectRepository.getMovementPaths().forEach(path => {
            path.positions.forEach(pos => {
                str += pos.q + "," + pos.r + "/";
            });
            str += path.pending + "/"
        });
        return str;
    }

}