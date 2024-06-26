package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLog
import io.github.smiley4.strategygame.backend.common.detaillog.TileRefDetailLogValue
import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.models.BuildingType
import io.github.smiley4.strategygame.backend.common.models.TilePosition
import io.github.smiley4.strategygame.backend.common.utils.positionsCircle
import io.github.smiley4.strategygame.backend.engine.ports.models.Building
import io.github.smiley4.strategygame.backend.engine.ports.models.BuildingDetailType
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TileRef


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
            .let {
                Building(
                    type = buildingType,
                    tile = it,
                    active = false,
                    details = DetailLog<BuildingDetailType>().also { log ->
                        it?.also { log.addDetail(BuildingDetailType.WORKED_TILE, mutableMapOf("tile" to TileRefDetailLogValue(it))) }
                    }
                )
            }
            .also { city.infrastructure.buildings.add(it) }
    }

    private fun decideTargetTile(game: GameExtended, city: City, buildingType: BuildingType): TileRef? {
        return if (buildingType.templateData.requiredTileResource == null) {
            null
        } else {
            positionsCircle(city.tile, 1)
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
        return city.infrastructure.buildings.none { tile.tileId == it.tile?.tileId }
    }

    private fun hasRequiredResource(tile: Tile, buildingType: BuildingType): Boolean {
        return tile.data.resourceType == buildingType.templateData.requiredTileResource
    }

}