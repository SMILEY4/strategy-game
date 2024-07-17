package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.Id
import io.github.smiley4.strategygame.backend.commondata.RGBColor
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.CityInfrastructure
import io.github.smiley4.strategygame.backend.commondata.CityMetadata
import io.github.smiley4.strategygame.backend.commondata.CityPopulation
import io.github.smiley4.strategygame.backend.commondata.CityTileObject
import io.github.smiley4.strategygame.backend.commondata.Country
import io.github.smiley4.strategygame.backend.commondata.GameExtended
import io.github.smiley4.strategygame.backend.commondata.Province
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerImpl
import io.github.smiley4.strategygame.backend.commondata.SettlementTier
import io.github.smiley4.strategygame.backend.commondata.Tile
import io.github.smiley4.strategygame.backend.commondata.TileRef
import kotlin.math.max

/**
 * Creates the new city at the given location and creates new province (if required)
 */
class GENCreateCity(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<CreateCityOperationData, CreateCityResultData>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENValidateCreateCity.Definition.after())
            action { data ->
                log().debug("Create city at ${data.targetTile.position} for country ${data.country.countryId}")
                consumeSettler(data.country)
                val (city, province) = createCity(data.game, data.country, data.targetTile, data.withNewProvince, data.targetName)
                eventResultOk(CreateCityResultData(data.game, province, city))
            }
        }
    }


    private fun consumeSettler(country: Country) {
        country.availableSettlers = max(0, country.availableSettlers - 1)
    }

    private fun createCity(
        game: GameExtended,
        country: Country,
        tile: Tile,
        withNewProvince: Boolean,
        name: String
    ): Pair<City, Province> {
        return if (shouldCreateNewProvince(withNewProvince, tile)) {
            val city = createCity(game, country.countryId, tile, name, true)
            val province = addToNewProvince(game, city, country)
            city to province
        } else {
            val city = createCity(game, country.countryId, tile, name, false)
            val province = addToExistingProvince(game, city, tile)
            city to province
        }
    }

    private fun shouldCreateNewProvince(withNewProvince: Boolean, targetTile: Tile): Boolean {
        return withNewProvince || targetTile.owner == null
    }

    private fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String, isProvinceCapital: Boolean): City {
        return City(
            cityId = Id.gen(),
            countryId = countryId,
            tile = TileRef(tile),
            tier = SettlementTier.VILLAGE,
            meta = CityMetadata(
                name = name,
                color = RGBColor.random(),
                isProvinceCapital = isProvinceCapital,
            ),
            infrastructure = CityInfrastructure(
                buildings = mutableListOf(),
                productionQueue = mutableListOf(),
            ),
            population = CityPopulation(
                size = 1,
                growthProgress = 0f,
            ),
        ).also {
            game.cities.add(it)
            tile.objects.add(
                CityTileObject(
                    countryId = countryId,
                    cityId = it.cityId,
                )
            )
        }
    }

    private fun addToExistingProvince(game: GameExtended, city: City, targetTile: Tile): Province {
        val provinceId = targetTile.owner?.provinceId ?: throw Exception("No province is owning target tile")
        val province = game.findProvince(provinceId)
        return province.also { it.cityIds.add(city.cityId) }
    }

    private fun addToNewProvince(game: GameExtended, city: City, country: Country): Province {
        return Province(
            provinceId = Id.gen(),
            countryId = country.countryId,
            cityIds = mutableListOf(city.cityId),
            provinceCapitalCityId = city.cityId,
            color = RGBColor.random(),
            resourceLedger = ResourceLedgerImpl()
        ).also { game.provinces.add(it) }
    }

}