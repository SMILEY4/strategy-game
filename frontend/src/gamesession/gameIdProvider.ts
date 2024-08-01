
export class GameIdProvider {

	public getGameIdOrThrow(): string {
		const urlParams = new URLSearchParams(window.location.search);
		const gameId = urlParams.get('id');
		if(gameId) {
			return gameId
		} else {
			throw new Error("Could not get game-id from url")
		}
	}

}