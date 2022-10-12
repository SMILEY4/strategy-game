package de.ruegnerlukas.strategygame.backend.ports.models.entities

import de.ruegnerlukas.strategygame.backend.external.persistence.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.ports.models.RGBColor
import de.ruegnerlukas.strategygame.backend.ports.models.TilePosition
import de.ruegnerlukas.strategygame.backend.ports.models.TileRef

class CityEntity(
    val gameId: String,
    val countryId: String,
    val tile: TileRef,
    val name: String,
    val color: RGBColor,
    val city: Boolean,
    val parentCity: String?,
    val buildings: MutableList<Building>,
    key: String? = null,
) : DbEntity(key)


data class Building(
    val type: BuildingType,
    val tile: TileRef?
)


enum class BuildingType {
    LUMBER_CAMP,
    MINE,
    QUARRY,
    HARBOR,
    FARM
}