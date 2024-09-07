package io.github.smiley4.strategygame.backend.playerpov.module

import io.github.smiley4.strategygame.backend.common.jsondsl.JsonType
import io.github.smiley4.strategygame.backend.common.jsondsl.obj
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.WorldObject


internal class POVCache(
    val povCountryId: Country.Id,
    private val game: GameExtended,
    private val tileVisibilityCalculator: TileVisibilityCalculator
) {

    // json-objects for all identifiers in the game
    private val countryIdentifiers = mutableMapOf<Country.Id, JsonType>()
    private val tileIdentifiers = mutableMapOf<Tile.Id, JsonType>()


    // visibility states for all things
    private val tileVisibilities = mutableMapOf<Tile.Id, TileVisibilityDTO>()
    private val settlementVisibilities = mutableMapOf<Settlement.Id, TileVisibilityDTO>()
    private val worldObjectVisibilities = mutableMapOf<WorldObject.Id, TileVisibilityDTO>()

    init {

        // build json-identifiers for all things in the game
        game.countries.forEach { country ->
            countryIdentifiers[country.id] = obj {
                "id" to country.id.value
                "name" to country.id.value
                "color" to country.color
            }
        }
        game.tiles.forEach { tile ->
            tileIdentifiers[tile.id] = obj {
                "id" to tile.id.value
                "q" to tile.position.q
                "r" to tile.position.r
            }
        }

        // calculate visibility state for all tiles
        game.tiles.forEach { tile ->
            tileVisibilities[tile.id] = tileVisibilityCalculator.calculateVisibility(game, povCountryId, tile)
        }

        // calculate visibility state for all settlements
        game.settlements.forEach { settlement ->
            settlementVisibilities[settlement.id] = tileVisibilities[settlement.tile.id] ?: TileVisibilityDTO.UNKNOWN
        }

        // calculate visible world objects
        game.worldObjects.forEach { worldObject ->
            worldObjectVisibilities[worldObject.id] =
                if (tileVisibility(worldObject.tile.id).isAtLeast(TileVisibilityDTO.VISIBLE)) TileVisibilityDTO.VISIBLE
                else TileVisibilityDTO.UNKNOWN
        }
    }


    fun countryIdentifier(countryId: Country.Id): JsonType =
        countryIdentifiers[countryId] ?: throw Exception("No country identifier for $countryId")

    fun countryIdentifierOrNull(countryId: Country.Id?): JsonType? =
        countryId?.let { countryIdentifiers[countryId] }

    fun tileIdentifier(tileId: Tile.Id): JsonType =
        tileIdentifiers[tileId] ?: throw Exception("No tile identifier for $tileId")

    fun tileIdentifierOrNull(tileId: Tile.Id?): JsonType? =
        tileId?.let { tileIdentifiers[tileId] }

    fun tileVisibility(tileId: Tile.Id): TileVisibilityDTO =
        tileVisibilities[tileId] ?: throw Exception("No visibility for tile $tileId")

    fun settlementVisibility(settlementId: Settlement.Id): TileVisibilityDTO =
        settlementVisibilities[settlementId] ?: throw Exception("No visibility for settlement $settlementId")

    fun worldObjectVisibility(worldObjectId: WorldObject.Id): TileVisibilityDTO =
        worldObjectVisibilities[worldObjectId] ?: throw Exception("No visibility for world-object $worldObjectId")
}