package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

interface ResourceLedgerDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): ResourceLedgerDetail
    fun produce(amount: Float, entity: EconomyEntity): ResourceLedgerDetail
    fun giveShare(amount: Float, entity: EconomyEntity): ResourceLedgerDetail
    fun takeShare(amount: Float, entity: EconomyEntity): ResourceLedgerDetail
    fun missing(amount: Float, entity: EconomyEntity): ResourceLedgerDetail
}