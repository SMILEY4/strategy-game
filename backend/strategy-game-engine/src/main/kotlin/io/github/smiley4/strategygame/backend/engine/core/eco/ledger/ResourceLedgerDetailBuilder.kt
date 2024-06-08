package io.github.smiley4.strategygame.backend.engine.core.eco.ledger

import io.github.smiley4.strategygame.backend.common.detaillog.DetailLogValue
import io.github.smiley4.strategygame.backend.ecosim.data.EconomyEntity


interface ResourceLedgerDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
}