package io.github.smiley4.strategygame.backend.worlds.module.persistence.entities

import io.github.smiley4.strategygame.backend.commondata.ResourceType
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerDetailType
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerEntry


internal data class ResourceLedgerEntryEntity(
    val resourceType: ResourceType,
    val produced: Float,
    val consumed: Float,
    val missing: Float,
    val details: List<DetailLogEntryEntity<ResourceLedgerDetailType>>
) {

    companion object {

        fun of(serviceModel: ResourceLedgerEntry) = ResourceLedgerEntryEntity(
            resourceType = serviceModel.resourceType,
            produced = serviceModel.produced,
            consumed = serviceModel.consumed,
            missing = serviceModel.missing,
            details = serviceModel.getDetails().map { DetailLogEntryEntity.of(it) }
        )

        fun ResourceLedgerEntryEntity.asServiceModel() = ResourceLedgerEntry(
            resourceType = this.resourceType,
            produced = this.produced,
            consumed = this.consumed,
            missing = this.missing,
            details = this.details.map { it.asServiceModel() }.toMutableList()
        )

    }

}