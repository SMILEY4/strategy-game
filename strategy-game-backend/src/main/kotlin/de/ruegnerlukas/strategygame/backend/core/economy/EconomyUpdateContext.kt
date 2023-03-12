package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack

class EconomyUpdateContext {

    private val entityStates = mutableMapOf<EconomyEntity, EntityState>()

    fun getEntityState(entity: EconomyEntity): EntityState {
        return entityStates.computeIfAbsent(entity) {
            EntityState(entity, EntityStateType.NOT_PROCESSED, emptyList())
        }
    }

    fun setEntityMissingResources(entity: EconomyEntity, resources: Collection<ResourceStack>) {
        getEntityState(entity).also {
            it.state = EntityStateType.MISSING_RESOURCES
            it.remainingResources = resources
        }
    }

    fun setEntityCompletedConsumption(entity: EconomyEntity) {
        getEntityState(entity).state = EntityStateType.COMPLETED_CONSUMPTION
    }

    fun setEntityCompletedProduction(entity: EconomyEntity) {
        getEntityState(entity).state = EntityStateType.COMPLETED_PRODUCTION
    }

}

class EntityState(
    val entity: EconomyEntity,
    var state: EntityStateType,
    var remainingResources: Collection<ResourceStack>
)

enum class EntityStateType(val requiresConsumptionUpdate: Boolean, val requiresProductionUpdate: Boolean) {
    NOT_PROCESSED(true, false),
    MISSING_RESOURCES(true, false),
    COMPLETED_CONSUMPTION(false, true),
    COMPLETED_PRODUCTION(false, false)
}