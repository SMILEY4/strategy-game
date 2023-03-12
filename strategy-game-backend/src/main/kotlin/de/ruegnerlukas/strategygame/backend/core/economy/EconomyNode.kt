package de.ruegnerlukas.strategygame.backend.core.economy

import de.ruegnerlukas.strategygame.backend.ports.models.ResourceStack
import de.ruegnerlukas.strategygame.backend.ports.models.ResourceType
import java.lang.Float.min

/**
 * Something that "owns" resources, e.g. a city, province, market, country
 */
abstract class EconomyNode {

    abstract fun getChildNodes(): Collection<EconomyNode>
    abstract fun getNodesFlatSubtree(): Collection<EconomyNode>
    abstract fun getEntities(): Collection<EconomyEntity>

    abstract fun getAvailableResources(type: ResourceType): Float
    abstract fun addResources(type: ResourceType, amount: Float)
    abstract fun removeResources(type: ResourceType, amount: Float)

    fun update(): Collection<EconomyEntityUpdateResult> {

        // update all child-nodes, collect entities that could not complete due to missing requirements in child-node
        val failedChildEntities = getChildNodes().flatMap { it.update() }

        // handle all entities of this node, collect all that could not complete due to missing requirements in this node
        val failedLocalEntities = getEntities()
            .map { handle(it, null) }
            .filter { it.type != EconomyEntityUpdateResultType.COMPLETE }

        // retry failed entities of child-nodes with resources of this node, collect all that could not complete due to missing requirements in this node
        val failedRetriedEntities = failedChildEntities
            .map { handle(it.entity, it.origin) }
            .filter { it.type != EconomyEntityUpdateResultType.COMPLETE }

        // return all entities (of this and node and those originating from child-nodes and retried) that could not complete
        val failedEntities = mutableListOf<EconomyEntityUpdateResult>()
        failedEntities.addAll(failedLocalEntities)
        failedEntities.addAll(failedRetriedEntities)
        return failedEntities
    }

    private fun handle(entity: EconomyEntity, origin: EconomyNode?): EconomyEntityUpdateResult {
        if (entity.allowPartialConsumption()) {
            return handlePartialConsumption(entity, origin)
        } else {
            return handleFixedConsumption(entity, origin)
        }
    }

    private fun handleFixedConsumption(entity: EconomyEntity, origin: EconomyNode?): EconomyEntityUpdateResult {
        if (resourcesAvailable(entity)) {
            entity.getConsumes().forEach { removeResources(it.type, it.amount) }
            entity.getProduces().forEach { addResources(it.type, it.amount) }
            return EconomyEntityUpdateResult.complete(entity, origin ?: this)
        } else {
            return EconomyEntityUpdateResult.missingResources(entity, origin ?: this, entity.getConsumes())
        }
    }

    private fun handlePartialConsumption(entity: EconomyEntity, origin: EconomyNode?): EconomyEntityUpdateResult {
        if (resourcesAvailable(entity)) {
            return handleFixedConsumption(entity, origin)
        } else {
            val remaining = mutableListOf<ResourceStack>()
            entity.getConsumes().forEach { resource ->
                val available = getAvailableResources(resource.type)
                val required = resource.amount
                val possible = min(available, required)
                removeResources(resource.type, possible)
                remaining.add(ResourceStack(resource.type, required - possible))
            }
            entity.getProduces().forEach { addResources(it.type, it.amount) }
            return EconomyEntityUpdateResult.missingResources(entity, origin ?: this, remaining)
        }
    }

    private fun resourcesAvailable(entity: EconomyEntity): Boolean {
        return entity.getConsumes().all { resources ->
            getAvailableResources(resources.type) >= resources.amount
        }
    }

}

class EconomyEntityUpdateResult(
    val entity: EconomyEntity,
    val origin: EconomyNode,
    val type: EconomyEntityUpdateResultType,
    val remainingResources: Collection<ResourceStack>
) {
    companion object {

        fun complete(entity: EconomyEntity, origin: EconomyNode): EconomyEntityUpdateResult =
            EconomyEntityUpdateResult(entity, origin, EconomyEntityUpdateResultType.COMPLETE, emptyList())

        fun missingResources(entity: EconomyEntity, origin: EconomyNode, resources: Collection<ResourceStack>): EconomyEntityUpdateResult =
            EconomyEntityUpdateResult(entity, origin, EconomyEntityUpdateResultType.MISSING_RESOURCES, resources)

    }
}

enum class EconomyEntityUpdateResultType {
    COMPLETE,
    MISSING_RESOURCES
}
