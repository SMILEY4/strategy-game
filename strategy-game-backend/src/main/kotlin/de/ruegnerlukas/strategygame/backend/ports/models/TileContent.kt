package de.ruegnerlukas.strategygame.backend.ports.models

sealed class TileContent

class MarkerTileContent(
    val countryId: String
) : TileContent()

class ScoutTileContent(
    val countryId: String,
    val turn: Int
) : TileContent()