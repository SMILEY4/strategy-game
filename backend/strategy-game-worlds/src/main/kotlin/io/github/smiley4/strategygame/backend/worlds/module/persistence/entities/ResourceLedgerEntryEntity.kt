package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerEntry
import io.github.smiley4.strategygame.backend.commondata.ResourceType


internal data class ResourceLedgerEntryEntity(
    val resourceType: ResourceType,
    val produced: Float,
    val consumed: Float,
    val missing: Float,
    val detailsConsumed: Map<String, Float>,
    val detailsProduced: Map<String, Float>,
    val detailsMissing: Map<String, Float>,
) {

    companion object {

        fun of(serviceModel: ResourceLedgerEntry) = ResourceLedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            produced = serviceModel.produced.amount,
            consumed = serviceModel.consumed.amount,
            missing = serviceModel.missing.amount,
            detailsConsumed = serviceModel.produced.details,
            detailsProduced = serviceModel.consumed.details,
            detailsMissing = serviceModel.missing.details,
        )

        fun ResourceLedgerEntryEntity.asServiceModel() = ResourceLedgerEntry(
            resourceType = this.resourceType,
            produced = ResourceLedgerEntry.Value(
                amount = this.produced,
                details = this.detailsProduced.toMutableMap()
            ),
            consumed = ResourceLedgerEntry.Value(
                amount = this.consumed,
                details = this.detailsConsumed.toMutableMap()
            ),
            missing = ResourceLedgerEntry.Value(
                amount = this.missing,
                details = this.detailsMissing.toMutableMap()
            ),
        )

    }

}