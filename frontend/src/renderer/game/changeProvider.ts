import {ChangeDetector} from "../../shared/changeDetector";
import {GameSessionDatabase} from "../../state/gameSessionDatabase";
import {TileDatabase} from "../../state/tileDatabase";
import {CommandDatabase} from "../../state/commandDatabase";
import {Camera} from "../../shared/webgl/camera";

interface Changes {
    initFrame: boolean,
    turn: boolean,
    commands: boolean,
    mapMode: boolean,
    camera: boolean
}

export class ChangeProvider {

    private readonly gameSessionDb: GameSessionDatabase;
    private readonly tileDb: TileDatabase;
    private readonly commandDb: CommandDatabase;

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

    constructor(
        gameSessionDb: GameSessionDatabase,
        tileDb: TileDatabase,
        commandDb: CommandDatabase,
    ) {
        this.gameSessionDb = gameSessionDb;
        this.tileDb = tileDb;
        this.commandDb = commandDb;
    }

    public prepareFrame(camera: Camera) {
        if(this.frame >= 2) {
            this.changes.initFrame = false
        } else {
            this.changes.initFrame = true
            this.frame ++;
        }
        this.changes.turn = this.detectorCurrentTurn.check(this.gameSessionDb.get().turn);
        this.changes.commands = this.detectorCommandRevId.check(this.commandDb.getRevId());
        this.changes.mapMode = this.detectorMapMode.check(this.gameSessionDb.getMapMode())
        this.changes.camera = this.detectorCamera.check(camera.getHash())
    }

    public hasChange(name: string): boolean {
        if(name === "basemesh") {
            return this.changes.initFrame
        }
        if(name === "vertexnode.details") {
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
        return true;
    }

}