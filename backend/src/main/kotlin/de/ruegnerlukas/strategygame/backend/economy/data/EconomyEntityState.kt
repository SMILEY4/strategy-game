package de.ruegnerlukas.strategygame.backend.economy.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection


class EconomyEntityState(
    /** The resources required to satisfy this entity */
    private val resourcesInput: ResourceCollection,
    /** The resources produced by this entity */
    private val resourcesOutput: ResourceCollection,
) {

    private enum class State {
        CONSUMING,
        READY_FOR_OUTPUT,
        DONE
    }

    private var state = State.CONSUMING
    private val resources = ResourceCollection.basic()


    /**
     * The resources this entity still wants to consume
     */
    fun requiredResources(): ResourceCollection {
        return if (state == State.CONSUMING) {
            resourcesInput.copy()
                .sub(resources)
                .trim()
        } else {
            ResourceCollection.empty()
        }
    }


    /**
     * Add the given resources to this entity (for consumption)
     */
    fun putResources(resources: ResourceCollection) {
        if (state == State.CONSUMING) {
            this.resources.add(resources)
            if (requiredResources().isEmpty()) {
                state = State.READY_FOR_OUTPUT
            }
        }
    }


}