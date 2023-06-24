package de.ruegnerlukas.strategygame.backend.gameengine.core.gamestep

import de.ruegnerlukas.strategygame.backend.common.events.BasicEventNodeDefinition
import de.ruegnerlukas.strategygame.backend.common.events.EventSystem
import de.ruegnerlukas.strategygame.backend.common.logging.Logging
import de.ruegnerlukas.strategygame.backend.common.models.City
import de.ruegnerlukas.strategygame.backend.common.models.GameExtended

/**
 * Updates the size of a city based on the current growth-progress
 */
class GENUpdateCitySize(eventSystem: EventSystem) : Logging {

    object Definition : BasicEventNodeDefinition<GameExtended, Unit>()

    companion object {
        private const val MAX_SIZE_CHANGES = 10
    }

    init {
        eventSystem.createNode(Definition) {
            trigger(GENUpdateCityGrowthProgress.Definition.after())
            action { game ->
                log().debug("Update city sizes")
                game.cities.forEach { update(it) }
                eventResultOk(Unit)
            }
        }
    }

    private fun update(city: City) {
        var changeCounter = 0
        while (shouldGrow(city) && changeCounter < MAX_SIZE_CHANGES) {
            grow(city)
            changeCounter++
        }
        while (shouldShrink(city) && changeCounter < MAX_SIZE_CHANGES) {
            shrink(city)
            changeCounter++
        }
    }

    private fun shouldGrow(city: City) = city.growthProgress >= 1f

    private fun shouldShrink(city: City) = city.growthProgress <= -1f

    private fun grow(city: City) {
        city.size++
        city.growthProgress -= 1f
    }

    private fun shrink(city: City) {
        city.size--
        city.growthProgress += 1f
    }

}