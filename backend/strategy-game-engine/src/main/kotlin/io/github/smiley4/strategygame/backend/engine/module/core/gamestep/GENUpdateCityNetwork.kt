package io.github.smiley4.strategygame.backend.engine.module.core.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.monitoring.MetricId.Companion.action
import io.github.smiley4.strategygame.backend.engine.core.common.RouteGenerator
import io.github.smiley4.strategygame.backend.engine.ports.models.City
import io.github.smiley4.strategygame.backend.engine.ports.models.GameExtended
import io.github.smiley4.strategygame.backend.engine.ports.models.Province
import io.github.smiley4.strategygame.backend.engine.ports.models.Route
import io.github.smiley4.strategygame.backend.engine.ports.required.ReservationInsert


/**
 * Connects newly created cities with other cities
 */
class GENUpdateCityNetwork(
    private val reservationInsert: ReservationInsert,
    private val routeGenerator: RouteGenerator,
    eventSystem: EventSystem
) : Logging {

    object Definition : BasicEventNodeDefinition<CreateCityResultData, Unit>()

    init {
        eventSystem.createNode(Definition) {
            trigger(GENCreateCity.Definition.after())
            action { data ->
                log().debug("Update city network after creation of city ${data.city.cityId}")
                val capitalCity = getCapitalCity(data.game, data.city, data.province)
                createOrUpdateRoutes(capitalCity, data.game)
                eventResultOk(Unit)
            }
        }
    }

    private fun getCapitalCity(game: GameExtended, city: City, province: Province): City {
        return if (city.meta.isProvinceCapital) {
            city
        } else {
            province.findCapitalCity(game)
        }
    }

    private suspend fun createOrUpdateRoutes(city: City, game: GameExtended) {
        routeGenerator.getNewOrUpdated(game, RouteGenerator.Companion.RequestCity.from(city)).forEach { route ->
            route.existing?.also { existing ->
                game.routes.remove(existing)
            }
            game.routes.add(
                Route(
                    routeId = reservationInsert.reserveRoute(),
                    cityIdA = route.cityIdA ?: reservationInsert.reserveRoute(),
                    cityIdB = route.cityIdB,
                    path = route.path
                )
            )
        }
    }

}