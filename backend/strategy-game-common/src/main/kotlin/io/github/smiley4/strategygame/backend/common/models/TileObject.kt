package io.github.smiley4.strategygame.backend.common.models

sealed interface TileObject {
    val countryId: String
}

class MarkerTileObject(
    override val countryId: String,
    val label: String
) : TileObject

class ScoutTileObject(
    override val countryId: String,
    val creationTurn: Int,
) : TileObject

class CityTileObject(
    override val countryId: String,
    val cityId: String,
) : TileObject