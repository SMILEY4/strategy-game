package de.ruegnerlukas.strategygame.backend.economy.ledger

interface LedgerResourceDetail {
    fun merge(other: LedgerResourceDetail): Boolean
}