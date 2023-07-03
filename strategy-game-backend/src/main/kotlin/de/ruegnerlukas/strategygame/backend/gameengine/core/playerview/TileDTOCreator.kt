package de.ruegnerlukas.strategygame.backend.gameengine.core.playerview

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Tile
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.TileContainer
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.MarkerTileDTOContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.ScoutTileDTOContent
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTODataTier0
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTODataTier1
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTODataTier2
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOInfluence
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOOwner
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.dtos.TileDTOVisibility

class TileDTOCreator(private val gameConfig: GameConfig, private val countryId: String) {

    private val unknownCountryId = "?"
    private val unknownProvinceId = "?"
    private val unknownCityId = "?"

    fun build(tile: Tile, knownCountries: Set<String>, tiles: TileContainer): TileDTO {
        val baseData = buildTileDataTier0(countryId, tile, tiles)
        var generalData: TileDTODataTier1? = null
        var advancedData: TileDTODataTier2? = null
        if (baseData.visibility == TileDTOVisibility.DISCOVERED || baseData.visibility == TileDTOVisibility.VISIBLE) {
            generalData = buildTileDataTier1(tile)
        }
        if (baseData.visibility == TileDTOVisibility.VISIBLE) {
            advancedData = buildTileDataTier2(countryId, tile, knownCountries)
        }
        return TileDTO(
            dataTier0 = baseData,
            dataTier1 = generalData,
            dataTier2 = advancedData
        )
    }

    private fun buildTileDataTier0(countryId: String, tile: Tile, tiles: TileContainer): TileDTODataTier0 {
        return TileDTODataTier0(
            tileId = tile.tileId,
            position = tile.position,
            visibility = TileVisibilityCalculator(gameConfig, countryId).calculate(tile, tiles)
        )
    }

    private fun buildTileDataTier1(tile: Tile): TileDTODataTier1 {
        return TileDTODataTier1(
            terrainType = tile.data.terrainType.name,
            resourceType = tile.data.resourceType.name,
            owner = tile.owner?.let { TileDTOOwner(it.countryId, it.provinceId, it.cityId) }
        )
    }

    private fun buildTileDataTier2(countryId: String, tile: Tile, knownCountries: Set<String>): TileDTODataTier2 {
        return TileDTODataTier2(
            influences = buildTileInfluences(countryId, tile, knownCountries),
            content = tile.content.map {
                when (it) {
                    is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
                    is ScoutTileContent -> ScoutTileDTOContent(it.countryId, it.turn)
                }
            }
        )
    }
    private fun buildTileInfluences(countryId: String, tile: Tile, knownCountries: Set<String>): List<TileDTOInfluence> {
        val influences = mutableListOf<TileDTOInfluence>()
        influences.addAll( // player country
            tile.influences
                .filter { influence -> influence.countryId == countryId }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        provinceId = influence.provinceId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        influences.addAll( // foreign known countries
            tile.influences
                .filter { influence -> influence.countryId != countryId && knownCountries.contains(influence.countryId) }
                .map { influence ->
                    TileDTOInfluence(
                        countryId = influence.countryId,
                        provinceId = influence.provinceId,
                        cityId = influence.cityId,
                        amount = influence.amount
                    )
                }
        )
        TileDTOInfluence(
            countryId = unknownCountryId,
            provinceId = unknownProvinceId,
            cityId = unknownCityId,
            amount = tile.influences
                .filter { influence -> !knownCountries.contains(influence.countryId) }
                .sumOf { influence -> influence.amount },
        ).let {
            if (it.amount > 0) {
                influences.add(it)
            }
        }
        return influences
    }

}