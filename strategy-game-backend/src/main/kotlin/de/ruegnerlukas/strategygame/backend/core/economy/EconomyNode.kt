package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import java.lang.Float.min

/**
 * Something that "owns" resources, e.g. a city, province, market, country, ...
 */
abstract class EconomyNode {

    abstract fun getChildNodes(): Collection<EconomyNode>
    abstract fun getEntities(): Collection<EconomyEntity>

    fun getNodesFlatSubtree(): Collection<EconomyNode> = listOf(this) + getChildNodes().flatMap { it.getNodesFlatSubtree() }
    fun getEntitiesRecursive(): Collection<EconomyEntity> = getEntities() + getChildNodes().flatMap { it.getEntitiesRecursive() }

    abstract fun getAvailableResources(type: ResourceType): Float
    abstract fun addResources(type: ResourceType, amount: Float)
    abstract fun removeResources(type: ResourceType, amount: Float)

    // =======================================
    //      CONSUMPTION
    // =======================================

    fun updateConsumption(ctx: EconomyUpdateContext) {
        getChildNodes().forEach { it.updateConsumption(ctx) }
        getEntitiesRecursive()
            .filter { ctx.getEntityState(it).state.requiresConsumptionUpdate }
            .sortedBy { it.power }
            .forEach { updateConsumption(it, ctx) }
    }

    private fun updateConsumption(entity: EconomyEntity, ctx: EconomyUpdateContext) {
        if (entity.allowPartialConsumption()) {
            updatePartialConsumption(entity, ctx)
        } else {
            updateFixedConsumption(entity, ctx)
        }
    }

    private fun getRequiredResources(entity: EconomyEntity, ctx: EconomyUpdateContext): Collection<ResourceStack> {
        val state = ctx.getEntityState(entity)
        return when (state.state) {
            EntityStateType.NOT_PROCESSED -> entity.getConsumes()
            EntityStateType.MISSING_RESOURCES -> state.remainingResources
            EntityStateType.COMPLETED_CONSUMPTION -> emptyList()
            EntityStateType.COMPLETED_PRODUCTION -> emptyList()
        }
    }

    private fun updateFixedConsumption(entity: EconomyEntity, ctx: EconomyUpdateContext) {
        val requiredResources = getRequiredResources(entity, ctx)
        if (resourcesAvailable(requiredResources)) {
            requiredResources.forEach { removeResources(it.type, it.amount) }
            ctx.setEntityCompletedConsumption(entity)
        } else {
            ctx.setEntityMissingResources(entity, requiredResources)
        }
    }

    private fun updatePartialConsumption(entity: EconomyEntity, ctx: EconomyUpdateContext) {
        val requiredResources = getRequiredResources(entity, ctx)
        if (resourcesAvailable(requiredResources)) {
            updateFixedConsumption(entity, ctx)
        } else {
            val missingResources = mutableListOf<ResourceStack>()
            requiredResources.forEach { resource ->
                val available = getAvailableResources(resource.type)
                val required = resource.amount
                val possible = min(available, required)
                val missing = required - possible
                removeResources(resource.type, possible)
                if (missing > 0) {
                    missingResources.add(ResourceStack(resource.type, missing))
                }
            }
            if (missingResources.isNotEmpty()) {
                ctx.setEntityMissingResources(entity, missingResources)
            }
        }
    }

    private fun resourcesAvailable(resources: Collection<ResourceStack>): Boolean {
        return resources.all { getAvailableResources(it.type) >= it.amount }
    }

    // =======================================
    //      PRODUCTION
    // =======================================

    fun updateProduction(ctx: EconomyUpdateContext) {
        getChildNodes().forEach { it.updateProduction(ctx) }
        getEntities()
            .filter { ctx.getEntityState(it).state.requiresProductionUpdate }
            .forEach { updateProduction(it, ctx) }
    }

    private fun updateProduction(entity: EconomyEntity, ctx: EconomyUpdateContext) {
        entity.getProduces().forEach { addResources(it.type, it.amount) }
        ctx.setEntityCompletedProduction(entity)
    }

}

