package de.ruegnerlukas.strategygame.backend.economy.ledger

import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

interface EconomyLedgerDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): EconomyLedgerDetail
    fun produce(amount: Float, entity: EconomyEntity): EconomyLedgerDetail
    fun giveShare(amount: Float, entity: EconomyEntity): EconomyLedgerDetail
    fun takeShare(amount: Float, entity: EconomyEntity): EconomyLedgerDetail
    fun missing(amount: Float, entity: EconomyEntity): EconomyLedgerDetail
}