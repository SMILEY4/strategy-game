package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TileContent
import de.ruegnerlukas.strategygame.backend.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.max
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import kotlin.math.max

class TurnUpdateActionImpl(
    private val gameConfig: GameConfig
) : TurnUpdateAction {

    override fun perform(game: GameExtended) {
        updateCountryResources(game)
        updateTileInfluences(game)
        updateTileOwner(game)
        updateDiscoveredTilesByInfluence(game)
        updateDiscoveredTilesByScout(game)
        updateTileContent(game)
    }


    private fun updateCountryResources(game: GameExtended) {
        game.cities.forEach { city ->
            val country = game.countries.find { it.countryId == city.countryId }
            if (country != null) {
                country.resources.money += gameConfig.cityIncomePerTurn
                country.resources.food -= if (city.city) 10 else 5
                city.buildings
                    .filter { it.tile != null }
                    .forEach { building ->
                        when (building.type) {
                            BuildingType.LUMBER_CAMP -> country.resources.wood += if (city.city) 10 else 5
                            BuildingType.MINE -> country.resources.metal += if (city.city) 10 else 5
                            BuildingType.QUARRY -> country.resources.stone += if (city.city) 10 else 5
                            BuildingType.HARBOR -> country.resources.food += if (city.city) 10 else 5
                            BuildingType.FARM -> country.resources.food += if (city.city) 10 else 5
                        }
                    }
            }
        }
    }


    private fun updateTileInfluences(game: GameExtended) {
        game.tiles.forEach { tile ->
            updateTileInfluences(game, tile)
        }
    }


    private fun updateTileInfluences(game: GameExtended, tile: Tile) {
        tile.influences.clear()
        game.cities.forEach { city ->
            updateTileInfluences(tile, city)
        }
    }


    private fun updateTileInfluences(tile: Tile, city: City) {
        val cityInfluence = if (city.city) {
            calcInfluence(tile.position.distance(city.tile), gameConfig.cityInfluenceSpread, gameConfig.cityInfluenceAmount)
        } else {
            calcInfluence(tile.position.distance(city.tile), gameConfig.townInfluenceSpread, gameConfig.townInfluenceAmount)
        }
        if (cityInfluence > 0) {
            addTileInfluence(tile, city, cityInfluence)
        }
    }


    private fun addTileInfluence(tile: Tile, city: City, influenceValue: Double) {
        tile.influences.add(
            TileInfluence(
                countryId = city.countryId,
                cityId = city.parentCity ?: city.cityId,
                amount = influenceValue
            )
        )
    }


    private fun calcInfluence(distance: Int, spread: Float, amount: Float): Double {
        return max((-(distance.toDouble() / spread) + 1) * amount, 0.0)
    }


    private fun updateTileOwner(game: GameExtended) {
        game.tiles.filter { it.owner == null }.forEach { tile ->
            val maxInfluence = tile.influences.max { it.amount }
            if (maxInfluence != null && maxInfluence.amount >= gameConfig.tileOwnerInfluenceThreshold) {
                tile.owner = TileOwner(
                    countryId = maxInfluence.countryId,
                    cityId = maxInfluence.cityId
                )
            }
        }
    }


    private fun updateDiscoveredTilesByInfluence(game: GameExtended) {
        game.tiles.forEach { tile ->
            game.countries
                .filter { !hasDiscovered(it.countryId, tile) }
                .forEach { country ->
                    if (tile.owner?.countryId == country.countryId || hasInfluence(country.countryId, tile)) {
                        tile.discoveredByCountries.add(country.countryId)
                    }
                }
        }
    }


    private fun updateDiscoveredTilesByScout(game: GameExtended) {
        game.tiles
            .asSequence()
            .filter { tile -> tile.content.any { it.type == ScoutTileContent.TYPE } }
            .forEach { tile ->
                tile.content
                    .filter { it.type == ScoutTileContent.TYPE }
                    .map { it as ScoutTileContent }
                    .forEach { scout ->
                        positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                            .asSequence()
                            .mapNotNull { pos -> game.tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
                            .filter { !hasDiscovered(scout.countryId, it) }
                            .forEach { it.discoveredByCountries.add(scout.countryId) }
                    }
            }
    }


    private fun updateTileContent(game: GameExtended) {
        game.tiles
            .asSequence()
            .filter { tile -> tile.content.isNotEmpty() }
            .forEach { tile ->
                val contentToRemove = mutableListOf<TileContent>()
                tile.content.forEach { content ->
                    when (content) {
                        is ScoutTileContent -> {
                            val lifetime = game.game.turn - content.turn
                            if (lifetime > gameConfig.scoutLifetime) {
                                contentToRemove.add(content)
                            }
                        }
                        else -> {
                            /*Nothing to do*/
                        }
                    }
                }
                tile.content.removeAll(contentToRemove)
            }
    }


    private fun hasDiscovered(countryId: String, tile: Tile) = tile.discoveredByCountries.contains(countryId)


    private fun hasInfluence(countryId: String, tile: Tile) = tile.influences.any { it.countryId == countryId }

}