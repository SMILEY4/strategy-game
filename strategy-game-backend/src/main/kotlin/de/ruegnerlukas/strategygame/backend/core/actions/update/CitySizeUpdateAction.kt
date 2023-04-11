package de.ruegnerlukas.strategygame.backend.core.actions.update

import de.ruegnerlukas.strategygame.backend.ports.models.City
import de.ruegnerlukas.strategygame.backend.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Updates the size of a city based on the current growth-progress
 */
class CitySizeUpdateAction : Logging {

    companion object {
        private const val MAX_SIZE_CHANGES = 10
    }


    fun perform(game: GameExtended) {
        game.cities.forEach { update(it) }
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