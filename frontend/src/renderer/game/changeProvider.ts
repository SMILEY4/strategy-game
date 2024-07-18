import {ChangeDetector} from "../../shared/changeDetector";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {TileDatabase} from "../../state/database/tileDatabase";
import {CommandDatabase} from "../../state/database/commandDatabase";
import {Camera} from "../../shared/webgl/camera";
import {GameRepository} from "../../state/gameRepository";
import {DetailsVertexNode} from "./rendernodes/detailsVertexNode";

interface Changes {
    initFrame: boolean,
    turn: boolean,
    commands: boolean,
    mapMode: boolean,
    camera: boolean
}

export class ChangeProvider {

    private readonly gameRepository: GameRepository;

    private readonly detectorRemoteGameStateRevId = new ChangeDetector();
    private readonly detectorCommandRevId = new ChangeDetector();
    private readonly detectorMapMode = new ChangeDetector();
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

    constructor(gameRepository: GameRepository,) {
        this.gameRepository = gameRepository;
    }

    public prepareFrame(camera: Camera) {
        if(this.frame >= 2) {
            this.changes.initFrame = false
        } else {
            this.changes.initFrame = true
            this.frame ++;
        }
        this.changes.turn = this.detectorCurrentTurn.check(this.gameRepository.getTurn());
        this.changes.commands = false; // todo this.detectorCommandRevId.check(this.commandDb.getRevId());
        this.changes.mapMode = false; // todo this.detectorMapMode.check(this.gameSessionDb.getMapMode())
        this.changes.camera = this.detectorCamera.check(camera.getHash())
    }

    public hasChange(name: string): boolean {
        if(name === "basemesh") {
            return this.changes.initFrame
        }
        if(name === DetailsVertexNode.ID) {
            return this.changes.turn
        }
        if(name === "vertexnode.entities") {
            return this.changes.turn || this.changes.commands
        }
        if(name === "vertexnode.overlay") {
            return this.changes.turn || this.changes.mapMode
        }
        if(name === "vertexnode.routes") {
            return this.changes.turn
        }
        if(name === "vertexnode.tiles") {
            return this.changes.turn
        }
        if(name === "htmlnode.resourceicons") {
            return this.changes.turn || this.changes.mapMode || this.changes.camera
        }
        if(name === "htmlnode.citylabels"){
            return this.changes.turn || this.changes.camera
        }
        return true;
    }

}