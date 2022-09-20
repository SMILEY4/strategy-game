package de.ruegnerlukas.strategygame.backend.core.actions.game

import de.ruegnerlukas.strategygame.backend.core.config.GameConfig
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CityDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTOAdvancedData
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTOBaseData
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.CountryDTOResources
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.GameExtendedDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.MarkerTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.ScoutTileDTOContent
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTO
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOAdvancedData
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOBaseData
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOCityInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOCountryInfluence
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOGeneralData
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOOwner
import de.ruegnerlukas.strategygame.backend.ports.models.dtos.TileDTOVisibility
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CityEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.CountryEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.GameExtendedEntity
import de.ruegnerlukas.strategygame.backend.ports.models.entities.MarkerTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.ScoutTileContent
import de.ruegnerlukas.strategygame.backend.ports.models.entities.TileEntity
import de.ruegnerlukas.strategygame.backend.shared.positionsCircle

class GameExtendedDTOCreator(
    private val gameConfig: GameConfig
) {

    private val unknownCountryId = "?"

    fun create(userId: String, game: GameExtendedEntity): GameExtendedDTO {
        val playerCountry = game.countries.first { it.userId == userId }
        val knownCountryIds = getKnownCountryIds(playerCountry.getKeyOrThrow(), game.tiles).toSet()

        val tileDTOs: List<TileDTO> = game.tiles
            .map { tileEntity -> buildTile(playerCountry.getKeyOrThrow(), tileEntity, knownCountryIds, game.tiles) }

        val countryDTOs = knownCountryIds
            .map { countryId -> game.countries.first { it.key == countryId } }
            .map { country -> buildCountry(playerCountry.getKeyOrThrow(), country) }

        val cityDTOs = game.cities
            .filter { city -> tileDTOs.first { it.baseData.tileId == city.tile.tileId }.baseData.visibility != TileDTOVisibility.UNKNOWN }
            .map { buildCity(it) }

        return GameExtendedDTO(
            turn = game.game.turn,
            tiles = tileDTOs,
            countries = countryDTOs,
            cities = cityDTOs,
        )
    }


    private fun getKnownCountryIds(countryId: String, tiles: List<TileEntity>): List<String> {
        return (tiles
            .filter { calculateTileVisibility(countryId, it, tiles) != TileDTOVisibility.UNKNOWN }
            .mapNotNull { tile -> tile.owner?.countryId }
                + countryId)
            .distinct()
    }


    private fun calculateTileVisibility(countryId: String, tile: TileEntity, tiles: List<TileEntity>): TileDTOVisibility {
        if (tile.discoveredByCountries.contains(countryId)) {

            val scoutNearby = positionsCircle(tile.position, gameConfig.scoutVisibilityRange)
                .asSequence()
                .mapNotNull { pos -> tiles.find { it.position.q == pos.q && it.position.r == pos.r } }
                .mapNotNull { t -> t.content.find { it.type == ScoutTileContent.TYPE }?.let { it as ScoutTileContent } }
                .any { it.countryId == countryId }
            if (scoutNearby) {
                return TileDTOVisibility.VISIBLE
            }

            val hasInfluence = tile.influences.any { it.countryId == countryId }
            val foreignOwner = tile.owner != null && tile.owner!!.countryId != countryId
            if (hasInfluence && !foreignOwner) {
                return TileDTOVisibility.VISIBLE
            } else {
                return TileDTOVisibility.DISCOVERED
            }

        } else {
            return TileDTOVisibility.UNKNOWN
        }
    }


    private fun buildTile(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>, tiles: List<TileEntity>): TileDTO {
        val baseData = buildTileBaseData(countryId, tileEntity, tiles)
        var generalData: TileDTOGeneralData? = null
        var advancedData: TileDTOAdvancedData? = null
        if (baseData.visibility == TileDTOVisibility.DISCOVERED || baseData.visibility == TileDTOVisibility.VISIBLE) {
            generalData = buildTileGeneralData(tileEntity)
        }
        if (baseData.visibility == TileDTOVisibility.VISIBLE) {
            advancedData = buildTileAdvancedData(countryId, tileEntity, knownCountries)
        }
        return TileDTO(
            baseData = baseData,
            generalData = generalData,
            advancedData = advancedData
        )
    }

    private fun buildTileBaseData(countryId: String, tileEntity: TileEntity, tiles: List<TileEntity>): TileDTOBaseData {
        return TileDTOBaseData(
            tileId = tileEntity.getKeyOrThrow(),
            position = tileEntity.position,
            visibility = calculateTileVisibility(countryId, tileEntity, tiles)
        )
    }

    private fun buildTileGeneralData(tileEntity: TileEntity): TileDTOGeneralData {
        return TileDTOGeneralData(
            terrainType = tileEntity.data.terrainType,
            owner = tileEntity.owner?.let { TileDTOOwner(it.countryId, it.cityId) }
        )
    }

    private fun buildTileAdvancedData(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>): TileDTOAdvancedData {
        return TileDTOAdvancedData(
            influences = buildTileInfluences(countryId, tileEntity, knownCountries),
            content = tileEntity.content.map {
                when (it) {
                    is MarkerTileContent -> MarkerTileDTOContent(it.countryId)
                    is ScoutTileContent -> ScoutTileDTOContent(it.countryId, it.turn)
                }
            }
        )
    }

    private fun buildTileInfluences(countryId: String, tileEntity: TileEntity, knownCountries: Set<String>): List<TileDTOCountryInfluence> {
        val influences = mutableListOf<TileDTOCountryInfluence>()
        influences.addAll( // player country
            tileEntity.influences
                .filter { influence -> influence.countryId == countryId }
                .map { influence ->
                    TileDTOCountryInfluence(
                        countryId = influence.countryId,
                        value = influence.totalValue,
                        sources = influence.sources.map { source ->
                            TileDTOCityInfluence(
                                source.cityId,
                                source.value
                            )
                        }
                    )
                }
        )
        influences.addAll( // foreign known countries
            tileEntity.influences
                .filter { influence -> influence.countryId != countryId && knownCountries.contains(influence.countryId) }
                .map { influence ->
                    TileDTOCountryInfluence(
                        countryId = influence.countryId,
                        value = influence.totalValue,
                        sources = emptyList()
                    )
                }
        )
        TileDTOCountryInfluence(
            countryId = unknownCountryId,
            value = tileEntity.influences
                .filter { influence -> !knownCountries.contains(influence.countryId) }
                .sumOf { influence -> influence.totalValue },
            sources = emptyList()
        ).let {
            if (it.value > 0) {
                influences.add(it)
            }
        }
        return influences
    }


    private fun buildCountry(playerCountryId: String, countryEntity: CountryEntity): CountryDTO {
        val baseData = CountryDTOBaseData(
            countryId = countryEntity.getKeyOrThrow(),
            userId = countryEntity.userId,
            color = countryEntity.color
        )
        var advancedData: CountryDTOAdvancedData? = null
        if (playerCountryId == countryEntity.key) {
            advancedData = CountryDTOAdvancedData(
                resources = CountryDTOResources(
                    money = countryEntity.resources.money
                )
            )
        }
        return CountryDTO(
            baseData = baseData,
            advancedData = advancedData
        )
    }


    private fun buildCity(cityEntity: CityEntity): CityDTO {
        return CityDTO(
            cityId = cityEntity.key!!,
            countryId = cityEntity.countryId,
            tile = cityEntity.tile,
            name = cityEntity.name,
            color = cityEntity.color
        )
    }

}
