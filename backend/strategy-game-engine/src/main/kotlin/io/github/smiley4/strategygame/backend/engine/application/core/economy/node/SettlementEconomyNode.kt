package io.github.smiley4.strategygame.backend.engine.application.core.economy.node

import io.github.smiley4.strategygame.backend.commondata.Settlement
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyEntity
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNode
import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyNodeStorage
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.BuildingEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationBaseEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.PopulationGrowthEconomyEntity
import io.github.smiley4.strategygame.backend.engine.application.core.economy.entity.ProductionQueueEconomyEntity

class SettlementEconomyNode(val settlement: Settlement) : GameEconomyNode {

    override val storage: EconomyNodeStorage = EconomyNodeStorage.build(settlement.resourceLedger.getProduced())

    override val children: Collection<EconomyNode> = emptyList()

    override val entities: Collection<EconomyEntity> = buildList {
        add(PopulationBaseEconomyEntity(this@SettlementEconomyNode))
        add(PopulationGrowthEconomyEntity(this@SettlementEconomyNode))
        settlement.infrastructure.buildings.forEach { building ->
            add(
                BuildingEconomyEntity(
                    this@SettlementEconomyNode,
                    building
                )
            )
        }
        settlement.infrastructure.productionQueue.firstOrNull()?.also { entry ->
            add(ProductionQueueEconomyEntity(this@SettlementEconomyNode, entry))
        }
    }

    override fun toString() = "${SettlementEconomyNode::class.simpleName}(settlement=${settlement.id})"

}