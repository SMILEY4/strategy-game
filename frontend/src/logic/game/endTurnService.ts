import {GameSessionClient} from "../gamesession/gameSessionClient";

export class EndTurnService {

	private readonly gameSessionClient: GameSessionClient;

	constructor(gameSessionClient: GameSessionClient) {
		this.gameSessionClient = gameSessionClient;
	}

	public endTurn() {
		this.gameSessionClient.sendMessage(
			"submit-turn",
			{commands: []},
		);
		// this.commandDb.deleteAll();
	}

}