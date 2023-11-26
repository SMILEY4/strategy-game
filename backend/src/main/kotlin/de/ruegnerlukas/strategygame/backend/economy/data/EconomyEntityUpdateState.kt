package de.ruegnerlukas.strategygame.backend.economy.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection


class EconomyEntityUpdateState(private val input: ResourceCollection) {

    var state = EconomyUpdateState.CONSUME
        private set

    private val collectedResources = ResourceCollection.basic()


    /**
     * @return the current state
     */
    fun getState(): EconomyUpdateState {
        return state
    }


    /**
     * @return the currently required resources (i.e. initial - provided) for consumption
     */
    fun getRemainingRequired(): ResourceCollection {
        return if (state == EconomyUpdateState.CONSUME) {
            input.copy()
                .sub(collectedResources)
                .trim()
        } else {
            ResourceCollection.empty()
        }
    }


    /**
     * Provide the given  resources to this entity
     */
    fun consume(resources: ResourceCollection) {
        if (state == EconomyUpdateState.CONSUME) {
            collectedResources.add(resources)
            if (getRemainingRequired().isEmpty()) {
                state = EconomyUpdateState.PRODUCE
            }
        }
    }


    /**
     * Mark the entity as "has produced"
     */
    fun produce() {
        state = EconomyUpdateState.DONE
    }


}
