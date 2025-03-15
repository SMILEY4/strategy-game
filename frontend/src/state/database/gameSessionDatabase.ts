import {AbstractSingletonDatabase} from "../../common/db/database/abstractSingletonDatabase";
import {GameSession} from "../../models/misc/gameSession";
import {MapMode} from "../../models/misc/mapMode";

export class GameSessionDatabase extends AbstractSingletonDatabase<GameSession> {

	constructor() {
		super({
			sessionState: "none",
			turnState: "playing",
			turn: -1,
			selectedTile: null,
			hoverTile: null,
			mapMode: MapMode.DEFAULT,
		});
	}

}
