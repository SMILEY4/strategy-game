package de.ruegnerlukas.strategygame.backend.economy.ledger

interface EconomyLedgerDetail {
    fun merge(other: EconomyLedgerDetail): Boolean
}