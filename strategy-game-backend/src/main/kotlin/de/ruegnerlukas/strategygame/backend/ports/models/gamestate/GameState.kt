package de.ruegnerlukas.strategygame.backend.ports.models.gamestate

import de.ruegnerlukas.strategygame.backend.ports.models.world.TileType
import de.ruegnerlukas.strategygame.backend.shared.dirty.DirtyObject


class GameState( // TODO: = WorldState ?
	val worldId: String,
	val countries: List<CountryState>,
	val tiles: List<TileState>,
	cities: List<CityState>,
	markers: List<MarkerState>
) : DirtyObject() {
	val cities = list(cities) { it.id }
	val markers = list(markers) { it.id }
}


class CountryState(
	val id: String,
	val playerId: String,
	amountMoney: Float
) : DirtyObject() {
	val amountMoney = value(amountMoney)
}


class TileState(
	val id: String,
	val q: Int,
	val r: Int,
	val type: TileType
)


class CityState(
	val id: String,
	val tileId: String,
	val q: Int,
	val r: Int,
)

class MarkerState(
	val id: String,
	val tileId: String,
	val q: Int,
	val r: Int,
	val playerId: String,
)