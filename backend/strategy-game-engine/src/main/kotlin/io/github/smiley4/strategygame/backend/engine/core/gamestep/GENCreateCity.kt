package io.github.smiley4.strategygame.backend.engine.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.utils.RGBColor
import io.github.smiley4.strategygame.backend.engine.core.eco.ledger.ResourceLedger
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.CityInfrastructure
import io.github.smiley4.strategygame.backend.engine.ports.models.CityMetadata
import io.github.smiley4.strategygame.backend.engine.ports.models.CityPopulation
import io.github.smiley4.strategygame.backend.common.models.CityTileObject
import io.github.smiley4.strategygame.backend.engine.ports.models.Country
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.github.smiley4.strategygame.backend.engine.ports.models.SettlementTier
import io.github.smiley4.strategygame.backend.common.models.Tile
import io.github.smiley4.strategygame.backend.common.models.TileRef
import io.github.smiley4.strategygame.backend.engine.ports.required.ReservationInsert
import kotlin.math.max

/**
 * Creates the new city at the given location and creates new province (if required)
 */
class GENCreateCity(private val reservationInsert: ReservationInsert, eventSystem: EventSystem) : Logging {

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

    private suspend fun createCity(
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

    private suspend fun createCity(game: GameExtended, countryId: String, tile: Tile, name: String, isProvinceCapital: Boolean): City {
        return City(
            cityId = reservationInsert.reserveCity(),
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

    private suspend fun addToNewProvince(game: GameExtended, city: City, country: Country): Province {
        return Province(
            provinceId = reservationInsert.reserveProvince(),
            countryId = country.countryId,
            cityIds = mutableListOf(city.cityId),
            provinceCapitalCityId = city.cityId,
            color = RGBColor.random(),
            resourceLedger = ResourceLedger()
        ).also { game.provinces.add(it) }
    }

}