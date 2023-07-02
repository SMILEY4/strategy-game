package de.ruegnerlukas.strategygame.backend.economy.core.data

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection

open class BasicEconomyEntity(
    private val owner: EconomyNode,
    private val priority: Float,
    private val resourcesInput: ResourceCollection = ResourceCollection.empty(),
    private val resourcesOutput: ResourceCollection = ResourceCollection.empty(),
    private val allowPartialInput: Boolean = false,
    private val active: Boolean = true
) : EconomyEntity {

    private enum class State {
        WAITING_FOR_INPUT,
        READY_FOR_OUTPUT,
        DONE
    }

    private val providedResources = ResourceCollection.basic()
    private var state = if (getRemainingRequiredResources().isEmpty()) State.READY_FOR_OUTPUT else State.WAITING_FOR_INPUT

    override fun getNode(): EconomyNode = owner
    override fun getPriority(): Float = priority
    override fun getRequiredInput(): ResourceCollection = getRemainingRequiredResources()
    override fun getOutput(): ResourceCollection = resourcesOutput
    override fun allowPartialInput(): Boolean = allowPartialInput
    override fun isActive(): Boolean = active

    fun getProvidedResources() = providedResources

    override fun allowReadyForInput(): Boolean = state == State.WAITING_FOR_INPUT
    override fun isReadyForOutput(): Boolean = state == State.READY_FOR_OUTPUT
    override fun completedOutput(): Boolean = state == State.DONE

    override fun addResources(resources: ResourceCollection) {
        providedResources.add(resources)
        if (getRemainingRequiredResources().isEmpty()) {
            state = State.READY_FOR_OUTPUT
        }
    }

    override fun flagOutputDone() {
        state = State.DONE
    }

    private fun getRemainingRequiredResources(): ResourceCollection {
        return resourcesInput.copy()
            .sub(providedResources)
            .trim()
    }

}