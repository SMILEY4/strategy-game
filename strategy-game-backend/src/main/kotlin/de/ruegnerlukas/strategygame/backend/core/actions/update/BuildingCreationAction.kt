package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.Building
import de.ruegnerlukas.strategygame.backend.ports.models.BuildingType
import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

/**
 * Adds the given building to the city
 */
class BuildingCreationAction {

    companion object {
        data class BuildingCreationData(
            val city: City,
            val type: BuildingType
        )
    }

    fun perform(game: GameExtended, data: BuildingCreationData) {
        addBuilding(game, data.city, data.type)
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
                .mapNotNull { getTile(game, it) }
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

    private fun getTile(game: GameExtended, pos: TilePosition): Tile? {
        return game.tiles.get(pos)
    }

    private fun isTileFreeForBuilding(tile: Tile, city: City): Boolean {
        return city.buildings.none { tile.tileId == it.tile?.tileId }
    }

    private fun hasRequiredResource(tile: Tile, buildingType: BuildingType): Boolean {
        return tile.data.resourceType == buildingType.templateData.requiredTileResource
    }

}