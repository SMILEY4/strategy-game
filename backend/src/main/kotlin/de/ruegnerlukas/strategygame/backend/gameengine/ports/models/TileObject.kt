package de.ruegnerlukas.strategygame.backend.gameengine.ports.models

sealed interface TileObject {
    val countryId: String
}

class MarkerTileObject(
    override val countryId: String,
) : TileObject

class ScoutTileObject(
    override val countryId: String,
    val creationTurn: Int,
) : TileObject

class CityTileObject(
    override val countryId: String,
    val cityId: String,
) : TileObject