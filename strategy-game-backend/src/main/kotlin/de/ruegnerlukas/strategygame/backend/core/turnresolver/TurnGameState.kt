package de.ruegnerlukas.strategygame.backend.core.turnresolver

/**
 * - "modifiable" state of complete game/world
 * - keeps track of changes/diff
 * - changes/diff can then later be saved to the db (instead of overwriting whole state)
 */

interface TurnGameState {
	val tiles: List<TileState>
}

interface TileState {
	val id: String
	val q: Int
	val r: Int
	val type: String
	val markers: List<MarkerState>

	fun addMarker(marker: MarkerState)
	fun addCity(city: CityState)

}

interface MarkerState {
	val id: String
	val q: Int
	val r: Int
	val playerId: String
	val userId: String?

	companion object {
		fun create(playerId: String, q: Int, r: Int): MarkerState {
			TODO("as extension function? -> not in interface?")
		}
	}
}


interface CityState {
	val id: String
	val q: Int
	val r: Int

	companion object {
		fun create(q: Int, r: Int): CityState {
			TODO("as extension function? -> not in interface?")
		}
	}
}