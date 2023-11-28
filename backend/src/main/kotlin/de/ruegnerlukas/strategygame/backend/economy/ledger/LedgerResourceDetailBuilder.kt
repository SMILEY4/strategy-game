package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

interface LedgerResourceDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): LedgerResourceDetail
    fun produce(amount: Float, entity: EconomyEntity): LedgerResourceDetail
    fun giveShare(amount: Float, entity: EconomyEntity): LedgerResourceDetail
    fun takeShare(amount: Float, entity: EconomyEntity): LedgerResourceDetail
    fun missing(amount: Float, entity: EconomyEntity): LedgerResourceDetail
}