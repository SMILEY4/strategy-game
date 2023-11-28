package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.economy.ledger.ResourceLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.LedgerResourceDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.LedgerEntryEntity.Companion.asServiceModel

data class LedgerEntity(
    val entries: List<LedgerEntryEntity>
) {

    companion object {

        fun of(serviceModel: ResourceLedger) = LedgerEntity(
            entries = serviceModel.getEntries().map { LedgerEntryEntity.of(it) }
        )

        fun LedgerEntity.asServiceModel(): ResourceLedger {
            val entries = this.entries.map { it.asServiceModel() }
            return ResourceLedger(LedgerResourceDetailBuilderImpl()).also { it.setEntries(entries) }
        }

    }

}