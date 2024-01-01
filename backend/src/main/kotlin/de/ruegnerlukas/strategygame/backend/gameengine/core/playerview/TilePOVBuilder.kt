package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.utils.arrMap
import de.ruegnerlukas.strategygame.backend.common.utils.objMap
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileObject

class TilePOVBuilder(
    private val dtoCache: POVCache,
    private val countryId: String,
    private val knownCountries: Set<String>,
) {

    fun build(tile: Tile): ObjectType {
        val visibility = getVisibility(tile)
        val influences = getInfluences(tile.influences)
        val objects = getObjects(tile.objects)
        return obj {
            "dataTier0" to obj {
                "tileId" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
                "visibility" to visibility.name
            }
            if (visibility.isAtLeast(VisibilityDTO.DISCOVERED)) {
                "dataTier1" to obj {
                    "terrainType" to tile.data.terrainType.name
                    "resourceType" to tile.data.resourceType.name
                    "owner" to objMap(tile.owner) { owner ->
                        "country" to dtoCache.countryIdentifier(owner.countryId)
                        "province" to dtoCache.provinceIdentifier(owner.provinceId)
                        "city" to dtoCache.cityIdentifierOrNull(owner.cityId)
                    }
                }
            }
            if (visibility.isAtLeast(VisibilityDTO.VISIBLE)) {
                "dataTier2" to obj {
                    "influences" to arrMap[influences, { influence ->
                        obj {
                            "amount" to influence.amount
                            "country" to dtoCache.countryIdentifier(influence.countryId)
                            "province" to dtoCache.provinceIdentifier(influence.provinceId)
                            "city" to dtoCache.cityIdentifier(influence.cityId)
                        }
                    }]
                    "objects" to arrMap[objects, { obj ->
                        when (obj) {
                            is MarkerTileObject -> obj {
                                "type" to "marker"
                                "country" to dtoCache.countryIdentifier(obj.countryId)
                                "label" to obj.label
                            }
                            is ScoutTileObject -> obj {
                                "type" to "marker"
                                "country" to dtoCache.countryIdentifier(obj.countryId)
                                "creationTurn" to obj.creationTurn
                            }
                            is CityTileObject -> obj {
                                "type" to "marker"
                                "country" to dtoCache.countryIdentifier(obj.countryId)
                                "city" to dtoCache.cityIdentifier(obj.cityId)
                            }
                        }
                    }]
                }
            }

        }
    }

    private fun getVisibility(tile: Tile): VisibilityDTO {
        return dtoCache.tileVisibility(tile.tileId)
    }

    private fun getObjects(objects: List<TileObject>): List<TileObject> {
        return objects.filter {
            !(it is MarkerTileObject && it.countryId !== countryId)
        }
    }

    private fun getInfluences(influences: List<TileInfluence>): List<TileInfluence> {
        return buildList {
            var unknownAmount = 0.0
            influences.forEach {
                if (knownCountries.contains(it.countryId)) {
                    add(it)
                } else {
                    unknownAmount += it.amount
                }
            }
            if (unknownAmount > 0) {
                add(
                    TileInfluence(
                        countryId = POVCache.UNKNOWN_COUNTRY_ID,
                        provinceId = POVCache.UNKNOWN_PROVINCE_ID,
                        cityId = POVCache.UNKNOWN_CITY_ID,
                        amount = unknownAmount
                    )
                )
            }
        }
    }
}