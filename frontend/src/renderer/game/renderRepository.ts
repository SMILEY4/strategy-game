import {Tile, TileIdentifier} from "../../models/tile";
import {TileDatabase} from "../../state/database/tileDatabase";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {CameraDatabase} from "../../state/database/cameraDatabase";
import {MapMode} from "../../models/mapMode";
import {CameraData} from "../../models/cameraData";
import {WorldObjectDatabase} from "../../state/database/objectDatabase";
import {WorldObject} from "../../models/worldObject";
import {MovementModeState} from "../../state/movementModeState";
import {CommandDatabase} from "../../state/database/commandDatabase";
import {CommandType, MoveCommand} from "../../models/command";
import {TilePosition} from "../../models/tilePosition";
import {Settlement} from "../../models/Settlement";
import {SettlementDatabase} from "../../state/database/settlementDatabase";

export class RenderRepository {

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cameraDb: CameraDatabase;
	private readonly tileDb: TileDatabase;
	private readonly worldObjectDb: WorldObjectDatabase;
	private readonly settlementDb: SettlementDatabase;
	private readonly commandDb: CommandDatabase;

	constructor(
		gameSessionDb: GameSessionDatabase,
		cameraDb: CameraDatabase,
		tileDb: TileDatabase,
		worldObjectDb: WorldObjectDatabase,
		settlementDb: SettlementDatabase,
		commandDb: CommandDatabase,
	) {
		this.gameSessionDb = gameSessionDb;
		this.cameraDb = cameraDb;
		this.tileDb = tileDb;
		this.worldObjectDb = worldObjectDb;
		this.settlementDb= settlementDb;
		this.commandDb = commandDb;
	}

	public getCamera(): CameraData {
		return this.cameraDb.get();
	}

	public getTurn(): number {
		return this.gameSessionDb.get().turn;
	}

	public getTilesAll(): Tile[] {
		return this.tileDb.queryMany(TileDatabase.QUERY_ALL, null);
	}

	public getTileAt(q: number, r: number): Tile | null {
		return this.tileDb.querySingle(TileDatabase.QUERY_BY_POSITION, [q, r]);
	}

	public getSelectedTile(): TileIdentifier | null {
		return this.gameSessionDb.getSelectedTile();
	}

	public getHoverTile(): TileIdentifier | null {
		return this.gameSessionDb.getHoverTile();
	}

	public getMapMode(): MapMode {
		return this.gameSessionDb.getMapMode();
	}

	public getWorldObjects(): WorldObject[] {
		return this.worldObjectDb.queryMany(WorldObjectDatabase.QUERY_ALL, null);
	}

	public getSettlements(): Settlement[] {
		return this.settlementDb.queryMany(SettlementDatabase.QUERY_ALL, null)
	}

	public getMovementPaths(): {positions: TilePosition[], pending: boolean}[] {

		const paths: {positions: TilePosition[], pending: boolean}[] = [];

		const movementState = MovementModeState.useState.getState();
		if(movementState.worldObjectId !== null){
			paths.push({positions: movementState.path.map(it => it.tile), pending: true})
		}

		const moveCommands = this.commandDb.queryMany(CommandDatabase.QUERY_ALL, null).filter(it => it.type === CommandType.MOVE)
		moveCommands.forEach(cmd => {
			const path = (cmd as MoveCommand).path.map(tile => ({q: tile.q, r: tile.r}))
			paths.push({positions: path, pending: false})
		})

		return paths;
	}

	public getMovementPathsCheckId(): string {
		let str = "";
		this.getMovementPaths().forEach(path => {
			path.positions.forEach(pos => {
				str += pos.q + "," + pos.r + "/";
			});
			str += path.pending + "/"
		});
		return str;
	}

	public getHighlightMovementTileIds(): Set<string> {
		return new Set<string>(MovementModeState.useState.getState().availableTargets.map(it => it.tile.q + "/" + it.tile.r)) // todo: temp key
	}
}