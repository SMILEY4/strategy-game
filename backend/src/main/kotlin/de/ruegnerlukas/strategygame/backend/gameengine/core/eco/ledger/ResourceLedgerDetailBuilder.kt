package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.ledger

import de.ruegnerlukas.strategygame.backend.common.detaillog.DetailLogValue
import de.ruegnerlukas.strategygame.backend.economy.data.EconomyEntity

interface ResourceLedgerDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
}