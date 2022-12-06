package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventBuildingCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandBuildingCreate
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.Country
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

/**
 * Adds the given building to the city
 * - triggered by [GameEventCommandBuildingCreate]
 * - triggers [GameEventBuildingCreate]
 */
class GameActionBuildingCreation : GameAction<GameEventCommandBuildingCreate>(GameEventCommandBuildingCreate.TYPE) {

    override suspend fun perform(event: GameEventCommandBuildingCreate): List<GameEvent> {
        val city = getCity(event)
        val buildingType = getBuildingType(event)
        addBuilding(event.game, city, buildingType)
        return listOf(GameEventBuildingCreate(event.game, getCountry(event)))
    }


    private fun addBuilding(game: GameExtended, city: City, buildingType: BuildingType) {
        decideTargetTile(game, city, buildingType)
            .let { Building(type = buildingType, tile = it) }
            .also { city.buildings.add(it) }
    }


    private fun decideTargetTile(game: GameExtended, city: City, buildingType: BuildingType): TileRef? {
        if (buildingType.templateData.requiredTileResource == null) {
            return null
        } else {
            return positionsCircle(city.tile, 1)
                .asSequence()
                .filter { !isSameTile(city, it) }
                .mapNotNull { getTile(game, it) }
                .filter { isTileFreeForBuilding(it, city) }
                .filter { it.data.resourceType == buildingType.templateData.requiredTileResource }
                .toList()
                .randomOrNull()
                ?.let { TileRef(it.tileId, it.position.q, it.position.r) }
        }
    }


    private fun getCountry(event: GameEventCommandBuildingCreate): Country {
        return event.game.countries.find { it.countryId == event.command.countryId }!!
    }


    private fun getCity(event: GameEventCommandBuildingCreate): City {
        return event.game.cities.find { it.cityId == event.command.data.cityId }!!
    }


    private fun getBuildingType(event: GameEventCommandBuildingCreate): BuildingType {
        return event.command.data.buildingType
    }


    private fun isSameTile(city: City, pos: TilePosition): Boolean {
        return city.tile.q == pos.q && city.tile.r == pos.r
    }


    private fun getTile(game: GameExtended, pos: TilePosition): Tile? {
        return game.tiles.find { it.position.q == pos.q && it.position.r == pos.r }
    }


    private fun isTileFreeForBuilding(tile: Tile, city: City): Boolean {
        return city.buildings.none { tile.tileId == it.tile?.tileId }
    }

}