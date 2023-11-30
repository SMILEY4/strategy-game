package de.ruegnerlukas.strategygame.backend.economy.ledger

interface ResourceLedgerDetail {
    fun merge(other: ResourceLedgerDetail): Boolean
}