package io.github.smiley4.strategygame.backend.ecosim.lib

import io.github.smiley4.strategygame.backend.commondata.ResourceCollection


class EconomyEntityUpdateState(input: ResourceCollection) {

    var state = EconomyUpdateState.CONSUME
        private set

    private val requiredResources = input.copy()
    private val consumedResources = ResourceCollection.empty()
    private val producedResources = ResourceCollection.empty()

    /**
     * @return the currently required resources (i.e. initial - provided) for consumption
     */
    fun getRemainingRequired(): ResourceCollection {
        return requiredResources
    }


    /**
     * @return the already consumed resources
     */
    fun getConsumedResources(): ResourceCollection {
        return consumedResources
    }

    /**
     * @return the already produced resources
     */
    fun getProducedResources(): ResourceCollection {
        return producedResources
    }


    /**
     * Provide the given  resources to this entity
     */
    fun consume(resources: ResourceCollection) {
        if (state == EconomyUpdateState.CONSUME) {
            consumedResources.add(resources)
            requiredResources.sub(resources)
            if (requiredResources.isEmpty()) {
                state = EconomyUpdateState.PRODUCE
            }
        }
    }


    /**
     * Mark the entity as "has produced"
     */
    fun produce(resources: ResourceCollection) {
        producedResources.add(resources)
        state = EconomyUpdateState.DONE
    }

}
