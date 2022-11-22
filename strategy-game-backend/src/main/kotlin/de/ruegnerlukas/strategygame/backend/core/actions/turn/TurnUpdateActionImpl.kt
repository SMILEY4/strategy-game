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
import de.ruegnerlukas.strategygame.backend.ports.required.Monitoring
import de.ruegnerlukas.strategygame.backend.ports.required.MonitoringService.Companion.metricCoreAction
import de.ruegnerlukas.strategygame.backend.shared.distance
import de.ruegnerlukas.strategygame.backend.shared.max
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import kotlin.math.max

class TurnUpdateActionImpl(
    private val gameConfig: GameConfig
) : TurnUpdateAction {

    private val metricId = metricCoreAction(TurnUpdateAction::class)

    override fun perform(game: GameExtended) {
        Monitoring.time(metricId) {
            updateCountryResources(game)
            updateDiscoveredTilesByScout(game)
            updateTileContent(game)
        }
    }


    private fun updateCountryResources(game: GameExtended) {
        game.cities.forEach { city ->
            val country = game.countries.find { it.countryId == city.countryId }
            if (country != null) {
                country.resources.money += gameConfig.cityIncomePerTurn
                country.resources.food -= if (city.isProvinceCapital) gameConfig.cityFoodCostPerTurn else gameConfig.townFoodCostPerTurn
                city.buildings
                    .filter { it.tile != null }
                    .forEach { building ->
                        val production = if(city.isProvinceCapital) {
                            gameConfig.cityBuildingProductionPerTurn
                        } else {
                            gameConfig.townBuildingProductionPerTurn
                        }
                        when (building.type) {
                            BuildingType.LUMBER_CAMP -> country.resources.wood += production
                            BuildingType.MINE -> country.resources.metal += production
                            BuildingType.QUARRY -> country.resources.stone += production
                            BuildingType.HARBOR -> country.resources.food += production
                            BuildingType.FARM -> country.resources.food += production
                        }
                    }
            }
        }
    }


    private fun updateDiscoveredTilesByScout(game: GameExtended) {
        game.tiles
            .asSequence()
            .filter { tile -> tile.content.any { it is ScoutTileContent } }
            .forEach { tile ->
                tile.content
                    .filterIsInstance<ScoutTileContent>()
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

}