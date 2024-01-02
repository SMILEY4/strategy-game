package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.jsondsl.JsonType
import de.ruegnerlukas.strategygame.backend.common.jsondsl.obj
import de.ruegnerlukas.strategygame.backend.common.jsondsl.objOptional
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.CityTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileObject
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileObject

class TilePOVBuilder(
    private val povCache: POVCache,
    private val countryId: String,
) {

    fun build(tile: Tile): JsonType {
        val visibility = getVisibility(tile)
        val influences = getInfluences(tile.influences)
        val objects = getObjects(tile.objects)
        return obj {
            "identifier" to povCache.tileIdentifier(tile.tileId)
            "visibility" to visibility
            if (visibility != TileVisibilityDTO.UNKNOWN) {
                "base" to obj {
                    "terrainType" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                        tile.data.terrainType
                    }
                    "resourceType" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                        tile.data.resourceType
                    }
                }
                "political" to obj {
                    "owner" to objHidden(visibility.isAtLeast(TileVisibilityDTO.DISCOVERED)) {
                        objOptional(tile.owner) { owner ->
                            "country" to owner.countryId
                            "province" to owner.provinceId
                            "city" to owner.cityId
                        }
                    }
                    "influences" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                        influences.map { influence ->
                            obj {
                                "amount" to influence.amount
                                "country" to influence.countryId
                                "province" to influence.provinceId
                                "city" to influence.cityId
                            }
                        }
                    }
                }
                "objects" to objHidden(visibility.isAtLeast(TileVisibilityDTO.VISIBLE)) {
                    objects.map { obj ->
                        when (obj) {
                            is MarkerTileObject -> obj {
                                "type" to "marker"
                                "country" to obj.countryId
                                "label" to obj.label
                            }
                            is ScoutTileObject -> obj {
                                "type" to "scout"
                                "country" to obj.countryId
                                "creationTurn" to obj.creationTurn
                            }
                            is CityTileObject -> obj {
                                "type" to "city"
                                "country" to obj.countryId
                                "city" to obj.cityId
                            }
                        }
                    }
                }
            }
        }
    }

    private fun getVisibility(tile: Tile): TileVisibilityDTO {
        return povCache.tileVisibility(tile.tileId)
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
                if (povCache.knownCountries().contains(it.countryId)) {
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