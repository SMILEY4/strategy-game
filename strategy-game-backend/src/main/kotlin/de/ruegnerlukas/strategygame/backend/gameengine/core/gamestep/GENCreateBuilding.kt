package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Building
import de.ruegnerlukas.strategygame.backend.common.models.BuildingType
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.common.models.TilePosition
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.common.utils.positionsCircle

/**
 * Adds the given building to the city
 */
class GENCreateBuilding(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<CreateBuildingData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(TriggerCreateBuilding)
            action { data ->
                log().debug("Create building ${data.type} in city ${data.city} ")
                addBuilding(data.game, data.city, data.type)
                eventResultOk(Unit)
            }
        }
    }

    private fun addBuilding(game: GameExtended, city: City, buildingType: BuildingType) {
        decideTargetTile(game, city, buildingType)
            .let { Building(type = buildingType, tile = it, active = false) }
            .also { city.buildings.add(it) }
    }

    private fun decideTargetTile(game: GameExtended, city: City, buildingType: BuildingType): TileRef? {
        if (buildingType.templateData.requiredTileResource == null) {
            return null
        } else {
            return positionsCircle(city.tile, 1)
                .asSequence()
                .filter { !isSameTile(city, it) }
                .mapNotNull { game.findTileOrNull(it) }
                .filter { isTileFreeForBuilding(it, city) }
                .filter { hasRequiredResource(it, buildingType) }
                .toList()
                .randomOrNull()
                ?.let { TileRef(it) }
        }
    }

    private fun isSameTile(city: City, pos: TilePosition): Boolean {
        return city.tile.q == pos.q && city.tile.r == pos.r
    }

    private fun isTileFreeForBuilding(tile: Tile, city: City): Boolean {
        return city.buildings.none { tile.tileId == it.tile?.tileId }
    }

    private fun hasRequiredResource(tile: Tile, buildingType: BuildingType): Boolean {
        return tile.data.resourceType == buildingType.templateData.requiredTileResource
    }

}