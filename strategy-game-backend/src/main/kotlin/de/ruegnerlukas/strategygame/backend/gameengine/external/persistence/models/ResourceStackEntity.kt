package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceStack
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceType

class ResourceStackEntity(
    val type: ResourceType,
    val amount: Float
) {

    companion object {
        fun of(serviceModel: ResourceStack) = ResourceStackEntity(
            type = serviceModel.type,
            amount = serviceModel.amount
        )
    }

    fun asServiceModel() = ResourceStack(
        type = this.type,
        amount = this.amount
    )
}