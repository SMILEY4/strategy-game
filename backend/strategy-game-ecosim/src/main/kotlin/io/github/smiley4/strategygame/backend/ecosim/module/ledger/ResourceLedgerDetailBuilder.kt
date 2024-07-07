package io.github.smiley4.strategygame.backend.ecosim.module.ledger

import io.github.smiley4.strategygame.backend.commondata.DetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerDetailType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity


interface ResourceLedgerDetailBuilder {
    fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
    fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>>
}