package de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models

import de.ruegnerlukas.strategygame.backend.economy.ledger.EconomyLedger
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger.LedgerResourceDetailBuilderImpl
import de.ruegnerlukas.strategygame.backend.gameengine.external.persistence.models.EconomyLedgerEntryEntity.Companion.asServiceModel

data class EconomyLedgerEntity(
    val entries: List<EconomyLedgerEntryEntity>
) {

    companion object {

        fun of(serviceModel: EconomyLedger) = EconomyLedgerEntity(
            entries = serviceModel.getEntries().map { EconomyLedgerEntryEntity.of(it) }
        )

        fun EconomyLedgerEntity.asServiceModel(): EconomyLedger {
            val entries = this.entries.map { it.asServiceModel() }
            return EconomyLedger(LedgerResourceDetailBuilderImpl()).also { it.setEntries(entries) }
        }

    }

}