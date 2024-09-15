package io.github.smiley4.strategygame.backend.engine.module.core.economy

import io.github.smiley4.strategygame.backend.commondata.DetailLogValue
import io.github.smiley4.strategygame.backend.commondata.FloatDetailLogValue
import io.github.smiley4.strategygame.backend.commondata.ResourceLedgerDetailType
import io.github.smiley4.strategygame.backend.commondata.TextDetailLogValue
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.module.ledger.ResourceLedgerDetailBuilder
import io.github.smiley4.strategygame.backend.engine.module.core.economy.entity.GameEconomyEntity

internal class ResourceLedgerDetailBuilderImpl : ResourceLedgerDetailBuilder {

    override fun consume(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.UNKNOWN_CONSUMPTION) { details -> // todo: replace "unknown" & details with specifics
            if (entity is GameEconomyEntity) {
                details["key"] = TextDetailLogValue(entity.detailKey())
            }
        }
    }

    override fun produce(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.UNKNOWN_PRODUCTION) { details -> // todo: replace "unknown" & details with specifics
            if (entity is GameEconomyEntity) {
                details["key"] = TextDetailLogValue(entity.detailKey())
            }
        }
    }

    override fun giveShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_GIVE) { details ->
            details["amount"] = FloatDetailLogValue(amount)
            if (entity is GameEconomyEntity) {
                details["key"] = TextDetailLogValue(entity.detailKey())
            }
        }
    }

    override fun takeShare(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.SHARED_TAKE) { details ->
            details["amount"] = FloatDetailLogValue(amount)
            if (entity is GameEconomyEntity) {
                details["key"] = TextDetailLogValue(entity.detailKey())
            }
        }
    }

    override fun missing(amount: Float, entity: EconomyEntity): Pair<ResourceLedgerDetailType, MutableMap<String, DetailLogValue>> {
        return buildDetail(ResourceLedgerDetailType.UNKNOWN_MISSING) { details -> // todo: replace "unknown" & details with specifics
            if (entity is GameEconomyEntity) {
                details["key"] = TextDetailLogValue(entity.detailKey())
            }
        }
    }

    private fun buildDetail(type: ResourceLedgerDetailType, build: (details: MutableMap<String, DetailLogValue>) -> Unit = {}) =
        type to mutableMapOf<String, DetailLogValue>().also(build)

}