package io.github.smiley4.strategygame.backend.engine.moduleold.gamestep

import io.github.smiley4.strategygame.backend.common.events.BasicEventNodeDefinition
import io.github.smiley4.strategygame.backend.common.events.EventSystem
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.commondata.City
import io.github.smiley4.strategygame.backend.commondata.GameExtended


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

    private fun shouldGrow(city: City) = city.population.growthProgress >= 1f

    private fun shouldShrink(city: City) = city.population.growthProgress <= -1f

    private fun grow(city: City) {
        city.population.size++
        city.population.growthProgress -= 1f
    }

    private fun shrink(city: City) {
        city.population.size--
        city.population.growthProgress += 1f
    }

}