package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import com.lectra.koson.ObjectType
import com.lectra.koson.arr
import com.lectra.koson.obj
import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class TileDTOCreator(
    private val gameConfig: GameConfig,
    private val dtoUtils: DtoUtils,
    private val countryId: String,
    private val knownCountries: Set<String>,
    private val tiles: TileContainer,
) {

    private val unknownCountryId = "?"
    private val unknownProvinceId = "?"
    private val unknownCityId = "?"

    fun build(tile: Tile): ObjectType {
        val visibility = getVisibility(tile)
        return obj {
            "dataTier0" to obj {
                "tileId" to tile.tileId
                "q" to tile.position.q
                "r" to tile.position.r
                "visibility" to visibility.name
            }
            if (visibility == TileDTOVisibility.DISCOVERED || visibility == TileDTOVisibility.VISIBLE) {
                "dataTier1" to obj {
                    "terrainType" to tile.data.terrainType.name
                    "resourceType" to tile.data.resourceType.name
                    "owner" to obj {
                        "country" to dtoUtils.countryIdentifier("todo")
                        "province" to dtoUtils.provinceIdentifier("todo")
                        "city" to dtoUtils.cityIdentifier("todo")
                    }
                }
            }
            if (visibility == TileDTOVisibility.VISIBLE) {
                "dataTier2" to obj {
                    "influences" to arr[
                        obj {
                            "amount" to 0
                            "country" to dtoUtils.countryIdentifier("todo")
                            "province" to dtoUtils.provinceIdentifier("todo")
                            "city" to dtoUtils.cityIdentifier("todo")
                        }
                    ]
                    "objects" to arr[
                        obj {
                            "type" to "todo"
                            "country" to dtoUtils.countryIdentifier("todo")
                            "..." to "todo"
                        }
                    ]
                }
            }

        }
    }

    private fun getVisibility(tile: Tile): TileDTOVisibility {
        return TileVisibilityCalculator(gameConfig, countryId).calculate(tile, tiles)
    }

//    export interface Tile {
//        identifier: TileIdentifier,
//        terrainType: TerrainType | null,
//        resourceType: TerrainResourceType | null
//        visibility: Visibility
//        owner: {
//            country: CountryIdentifier,
//            province: ProvinceIdentifier,
//            city: CityIdentifier | null
//        } | null,
//        influences: TileInfluence[],
//        objects: TileObject[]
//    }

//    fun build(tile: Tile, knownCountries: Set<String>, tiles: TileContainer): TileDTO {
//        val baseData = buildTileDataTier0(countryId, tile, tiles)
//        var generalData: TileDTODataTier1? = null
//        var advancedData: TileDTODataTier2? = null
//        if (baseData.visibility == TileDTOVisibility.DISCOVERED || baseData.visibility == TileDTOVisibility.VISIBLE) {
//            generalData = buildTileDataTier1(tile)
//        }
//        if (baseData.visibility == TileDTOVisibility.VISIBLE) {
//            advancedData = buildTileDataTier2(countryId, tile, knownCountries)
//        }
//        return TileDTO(
//            dataTier0 = baseData,
//            dataTier1 = generalData,
//            dataTier2 = advancedData
//        )
//    }
//
//    private fun buildTileDataTier0(countryId: String, tile: Tile, tiles: TileContainer): TileDTODataTier0 {
//        return TileDTODataTier0(
//            tileId = tile.tileId,
//            position = tile.position,
//            visibility = TileVisibilityCalculator(gameConfig, countryId).calculate(tile, tiles)
//        )
//    }
//
//    private fun buildTileDataTier1(tile: Tile): TileDTODataTier1 {
//        return TileDTODataTier1(
//            terrainType = tile.data.terrainType.name,
//            resourceType = tile.data.resourceType.name,
//            owner = tile.owner?.let { TileDTOOwner(it.countryId, it.provinceId, it.cityId) }
//        )
//    }
//
//    private fun buildTileDataTier2(countryId: String, tile: Tile, knownCountries: Set<String>): TileDTODataTier2 {
//        return TileDTODataTier2(
//            influences = buildTileInfluences(countryId, tile, knownCountries),
//            objects = tile.objects
//                .filter { if (it is MarkerTileObject) it.countryId == countryId else true }
//                .map {
//                    when (it) {
//                        is CityTileObject -> CityTileObjectDTO(
//                            countryId = it.countryId,
//                            cityId = it.cityId,
//                        )
//                        is ScoutTileObject -> ScoutTileObjectDTO(
//                            countryId = it.countryId,
//                            creationTurn = it.creationTurn
//                        )
//                        is MarkerTileObject -> MarkerTileObjectDTO(
//                            countryId = it.countryId,
//                            label = it.label
//                        )
//                    }
//                }
//        )
//    }
//
//    private fun buildTileInfluences(countryId: String, tile: Tile, knownCountries: Set<String>): List<TileDTOInfluence> {
//        val influences = mutableListOf<TileDTOInfluence>()
//        influences.addAll( // player country
//            tile.influences
//                .filter { influence -> influence.countryId == countryId }
//                .map { influence ->
//                    TileDTOInfluence(
//                        countryId = influence.countryId,
//                        provinceId = influence.provinceId,
//                        cityId = influence.cityId,
//                        amount = influence.amount
//                    )
//                }
//        )
//        influences.addAll( // foreign known countries
//            tile.influences
//                .filter { influence -> influence.countryId != countryId && knownCountries.contains(influence.countryId) }
//                .map { influence ->
//                    TileDTOInfluence(
//                        countryId = influence.countryId,
//                        provinceId = influence.provinceId,
//                        cityId = influence.cityId,
//                        amount = influence.amount
//                    )
//                }
//        )
//        TileDTOInfluence(
//            countryId = unknownCountryId,
//            provinceId = unknownProvinceId,
//            cityId = unknownCityId,
//            amount = tile.influences
//                .filter { influence -> !knownCountries.contains(influence.countryId) }
//                .sumOf { influence -> influence.amount },
//        ).let {
//            if (it.amount > 0) {
//                influences.add(it)
//            }
//        }
//        return influences
//    }

}