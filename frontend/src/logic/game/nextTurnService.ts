import {GameStateMessage} from "./models/gameStateMessage";
import {GameLoopService} from "./gameLoopService";
import {ValueHistory} from "../../shared/valueHistory";
import {GameSessionDatabase} from "../../state/database/gameSessionDatabase";
import {CityDatabase} from "../../state/database/cityDatabase";
import {CountryDatabase} from "../../state/database/countryDatabase";
import {ProvinceDatabase} from "../../state/database/provinceDatabase";
import {RouteDatabase} from "../../state/database/routeDatabase";
import {TileDatabase} from "../../state/database/tileDatabase";
import {MonitoringRepository} from "../../state/database/monitoringRepository";
import {Transaction} from "../../shared/db/database/transaction";
import {Tile} from "../../models/tile";

export class NextTurnService {

	private readonly gameLoopService: GameLoopService;

	private readonly monitoringRepository: MonitoringRepository;

	private readonly gameSessionDb: GameSessionDatabase;
	private readonly cityDb: CityDatabase;
	private readonly countryDb: CountryDatabase;
	private readonly provinceDb: ProvinceDatabase;
	private readonly routeDb: RouteDatabase;
	private readonly tileDb: TileDatabase;

	private readonly durationHistory = new ValueHistory(10);

	constructor(
		gameLoopService: GameLoopService,
		gameSessionDb: GameSessionDatabase,
		monitoringRepository: MonitoringRepository,
		cityDb: CityDatabase,
		countryDb: CountryDatabase,
		provinceDb: ProvinceDatabase,
		routeDb: RouteDatabase,
		tileDb: TileDatabase,
	) {
		this.gameLoopService = gameLoopService;
		this.gameSessionDb = gameSessionDb;
		this.monitoringRepository = monitoringRepository;
		this.cityDb = cityDb;
		this.countryDb = countryDb;
		this.provinceDb = provinceDb;
		this.routeDb = routeDb;
		this.tileDb = tileDb;
	}

	public handleNextTurn(game: GameStateMessage) {
		const timeStart = Date.now();

		Transaction.run([this.countryDb, this.provinceDb, this.cityDb, this.tileDb, this.routeDb, this.gameSessionDb], () => {

			this.countryDb.deleteAll();
			this.provinceDb.deleteAll();
			this.cityDb.deleteAll();
			this.tileDb.deleteAll();
			this.routeDb.deleteAll();

			this.tileDb.insertMany(this.buildTiles(game));

			this.gameSessionDb.setTurn(game.meta.turn);

			if (this.gameSessionDb.getState() === "loading") {
				this.gameSessionDb.setState("playing");
			}

		});

		this.gameLoopService.onGameStateUpdate();

		const timeEnd = Date.now();
		this.durationHistory.set(timeEnd - timeStart);
		this.monitoringRepository.setNextTurnDurations(this.durationHistory.getHistory());
	}


	private buildTiles(game: GameStateMessage): Tile[] {
		return game.tiles.map(tileMsg => ({identifier: tileMsg.identifier}));
	}

}