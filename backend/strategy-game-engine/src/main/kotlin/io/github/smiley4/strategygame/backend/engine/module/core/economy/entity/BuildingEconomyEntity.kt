package io.github.smiley4.strategygame.backend.engine.module.core.economy.entity

import io.github.smiley4.strategygame.backend.commondata.Building
import io.github.smiley4.strategygame.backend.commondata.ResourceCollection
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyConsumptionType
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityConfig
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyEntityUpdateState
import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyNode

class BuildingEconomyEntity(override val owner: EconomyNode, val building: Building) : GameEconomyEntity {

    override val config: EconomyEntityConfig = EconomyEntityConfig(
        input = ResourceCollection.basic(building.type.templateData.requires),
        output = ResourceCollection.basic(building.type.templateData.produces),
        consumptionType = EconomyConsumptionType.COMPLETE,
        priority = 1f,
        isActive = true
    )

    override val state: EconomyEntityUpdateState = EconomyEntityUpdateState(config.input)

    override fun detailKey() = "building-${building.type.name}"

    override fun toString() = "${BuildingEconomyEntity::class.simpleName}(building=${building.type.name})"

}