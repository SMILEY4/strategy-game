package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.ResourceStack
import io.github.smiley4.strategygame.backend.commondata.ResourceType


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