package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.GameExtended


internal class POVCache(
    private val game: GameExtended,
    private val povCountryId: String,
    private val tileVisibilityCalculator: TileVisibilityCalculator
) {

    // json-objects for all identifiers in the game
    private val countryIdentifiers = mutableMapOf<String, JsonType>()
    private val tileIdentifiers = mutableMapOf<String, JsonType>()


    // visibility states for all things
    private val tileVisibilities = mutableMapOf<String, TileVisibilityDTO>()
    private val worldObjectVisibilities = mutableMapOf<String, TileVisibilityDTO>()

    init {

        // build json-identifiers for all things in the game
        game.countries.forEach { country ->
            countryIdentifiers[country.countryId] = obj {
                "id" to country.countryId
                "name" to country.countryId
                "color" to country.color
            }
        }
        game.tiles.forEach { tile ->
            tileIdentifiers[tile.tileId] = obj {
                "id" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
            }
        }

        // calculate visibility state for all tiles
        game.tiles.forEach { tile ->
            tileVisibilities[tile.tileId] = tileVisibilityCalculator.calculateVisibility(game, povCountryId, tile)
        }

        // calculate visible world objects
        game.worldObjects.forEach { worldObject ->
            worldObjectVisibilities[worldObject.id] =
                if (tileVisibility(worldObject.tile.id).isAtLeast(TileVisibilityDTO.VISIBLE)) TileVisibilityDTO.VISIBLE
                else TileVisibilityDTO.UNKNOWN
        }
    }


    fun countryIdentifier(countryId: String): JsonType =
        countryIdentifiers[countryId] ?: throw Exception("No country identifier for $countryId")

    fun countryIdentifierOrNull(countryId: String?): JsonType? =
        countryId?.let { countryIdentifiers[countryId] }

    fun tileIdentifier(tileId: String): JsonType =
        tileIdentifiers[tileId] ?: throw Exception("No tile identifier for $tileId")

    fun tileIdentifierOrNull(tileId: String?): JsonType? =
        tileId?.let { tileIdentifiers[tileId] }

    fun tileVisibility(tileId: String): TileVisibilityDTO =
        tileVisibilities[tileId] ?: throw Exception("No visibility for tile $tileId")

    fun worldObjectVisibility(worldObjectId: String): TileVisibilityDTO =
        worldObjectVisibilities[worldObjectId] ?: throw Exception("No visibility for world-object $worldObjectId")
}