package de.ruegnerlukas.strategygame.backend.core.actions.turn

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.distance
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileOwner
import de.ruegnerlukas.strategygame.backend.ports.provided.turn.TurnUpdateAction
import de.ruegnerlukas.strategygame.backend.shared.max
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle
import kotlin.math.max

class TurnUpdateActionImpl(
    private val gameConfig: GameConfig
) : TurnUpdateAction {

    override fun perform(game: GameExtendedEntity) {
        updateCountryResources(game)
        updateTileInfluences(game)
        updateTileOwner(game)
        updateDiscoveredTilesByInfluence(game)
        updateDiscoveredTilesByScout(game)
        updateTileContent(game)
    }


    private fun updateCountryResources(game: GameExtendedEntity) {
        game.cities
            .filter { it.city }
            .forEach { city ->
                game.countries.find { it.key == city.countryId }?.let { it.resources.money += gameConfig.cityIncomePerTurn }
                game.countries.find { it.key == city.countryId }?.let { it.resources.food -= if (city.city) 10 else 5 }
            }
        game.tiles.forEach { tile ->
            tile.owner?.countryId.let { ownerId ->
                if (tile.data.resourceType != TileResourceType.NONE.name) {
                    game.countries.find { it.key == ownerId }?.let { country ->
                        when (tile.data.resourceType) {
                            TileResourceType.FISH.name -> country.resources.food += 10
                            TileResourceType.FOREST.name -> country.resources.wood += 10
                            TileResourceType.STONE.name -> country.resources.stone += 10
                            TileResourceType.METAL.name -> country.resources.metal += 10
                        }
                    }
                }
            }
        }
    }


    private fun updateTileInfluences(game: GameExtendedEntity) {
        game.tiles.forEach { tile ->
            updateTileInfluences(game, tile)
        }
    }


    private fun updateTileInfluences(game: GameExtendedEntity, tile: TileEntity) {
        tile.influences.clear()
        game.cities.forEach { city ->
            updateTileInfluences(tile, city)
        }
    }


    private fun updateTileInfluences(tile: TileEntity, city: CityEntity) {
        val cityInfluence = if (city.city) {
            calcInfluence(tile.position.distance(city.tile), gameConfig.cityInfluenceSpread, gameConfig.cityInfluenceAmount)
        } else {
            calcInfluence(tile.position.distance(city.tile), gameConfig.townInfluenceSpread, gameConfig.townInfluenceAmount)
        }
        if (cityInfluence > 0) {
            addTileInfluence(tile, city, cityInfluence)
        }
    }


    private fun addTileInfluence(tile: TileEntity, city: CityEntity, influenceValue: Double) {
        tile.influences.add(
            TileInfluence(
                countryId = city.countryId,
                cityId = city.parentCity ?: city.getKeyOrThrow(),
                amount = influenceValue
            )
        )
    }


    private fun calcInfluence(distance: Int, spread: Float, amount: Float): Double {
        return max((-(distance.toDouble() / spread) + 1) * amount, 0.0)
    }


    private fun updateTileOwner(game: GameExtendedEntity) {
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


    private fun updateDiscoveredTilesByInfluence(game: GameExtendedEntity) {
        game.tiles.forEach { tile ->
            game.countries
                .filter { !hasDiscovered(it.getKeyOrThrow(), tile) }
                .forEach { country ->
                    if (tile.owner?.countryId == country.getKeyOrThrow() || hasInfluence(country.getKeyOrThrow(), tile)) {
                        tile.discoveredByCountries.add(country.getKeyOrThrow())
                    }
                }
        }
    }


    private fun updateDiscoveredTilesByScout(game: GameExtendedEntity) {
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


    private fun updateTileContent(game: GameExtendedEntity) {
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


    private fun hasDiscovered(countryId: String, tile: TileEntity) = tile.discoveredByCountries.contains(countryId)


    private fun hasInfluence(countryId: String, tile: TileEntity) = tile.influences.any { it.countryId == countryId }

}