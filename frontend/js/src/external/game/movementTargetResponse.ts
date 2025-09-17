interface MovementTargetResponse {
	tile: {
		id: string,
		position: {
			q: number,
			r: number
		}
	},
	cost: number
}