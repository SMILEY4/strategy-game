package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.RouteGenerator
import de.ruegnerlukas.strategygame.backend.gameengine.core.common.RouteGenerator.Companion.RequestCity
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.City
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Route
import de.ruegnerlukas.strategygame.backend.gameengine.ports.required.ReservationInsert

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
        routeGenerator.getNewOrUpdated(game, RequestCity.from(city)).forEach { route ->
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