package de.ruegnerlukas.strategygame.backend.core.actions.events.actions

import de.ruegnerlukas.strategygame.backend.core.actions.events.GameAction
import de.ruegnerlukas.strategygame.backend.core.actions.events.GameEvent
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventCommandBuildingCreate
import de.ruegnerlukas.strategygame.backend.core.actions.events.events.GameEventBuildingCreate
import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.ports.models.TileResourceType
import de.ruegnerlukas.strategygame.backend.ports.models.TileType
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class GameActionBuildingCreation : GameAction<GameEventCommandBuildingCreate>(GameEventCommandBuildingCreate.TYPE) {

    override suspend fun perform(event: GameEventCommandBuildingCreate): List<GameEvent> {
        val city = getCity(event)
        val buildingType = getBuildingType(event)
        city.buildings.add(
            Building(
                type = buildingType,
                tile = decideTargetTile(event.game, city, buildingType)
            )
        )
        return listOf(GameEventBuildingCreate(event.game, event.command.countryId))
    }


    private fun getCity(event: GameEventCommandBuildingCreate): City {
        return event.game.cities.find { it.cityId == event.command.data.cityId }!!
    }


    private fun getBuildingType(event: GameEventCommandBuildingCreate): BuildingType {
        return event.command.data.buildingType
    }


    private fun decideTargetTile(game: GameExtended, city: City, buildingType: BuildingType): TileRef? {
        return positionsCircle(city.tile, 1)
            .asSequence()
            .filter { it.q != city.tile.q && it.r != city.tile.r }
            .mapNotNull { pos -> game.tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
            .filter { tile -> city.buildings.none { tile.tileId == it.tile?.tileId } }
            .filter {
                when (buildingType) {
                    BuildingType.LUMBER_CAMP -> it.data.resourceType == TileResourceType.FOREST.name
                    BuildingType.MINE -> it.data.resourceType == TileResourceType.METAL.name
                    BuildingType.QUARRY -> it.data.resourceType == TileResourceType.STONE.name
                    BuildingType.HARBOR -> it.data.resourceType == TileResourceType.FISH.name
                    BuildingType.FARM -> it.data.terrainType == TileType.LAND.name
                }
            }
            .toList()
            .randomOrNull()
            ?.let { TileRef(it.tileId, it.position.q, it.position.r) }
    }


}