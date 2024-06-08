package io.github.smiley4.strategygame.backend.ecosim.data

import io.github.smiley4.strategygame.backend.common.models.resources.ResourceCollection


class EconomyEntityUpdateState(input: ResourceCollection) {

    var state = EconomyUpdateState.CONSUME
        private set

    private val requiredResources = input.copy()


    /**
     * @return the currently required resources (i.e. initial - provided) for consumption
     */
    fun getRemainingRequired(): ResourceCollection {
        return requiredResources
    }


    /**
     * Provide the given  resources to this entity
     */
    fun consume(resources: ResourceCollection) {
        if (state == EconomyUpdateState.CONSUME) {
            requiredResources.sub(resources)
            if (requiredResources.isEmpty()) {
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
