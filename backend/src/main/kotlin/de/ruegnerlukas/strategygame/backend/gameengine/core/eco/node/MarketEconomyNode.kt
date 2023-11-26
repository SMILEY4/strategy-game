package de.ruegnerlukas.strategygame.backend.gameengine.core.eco.node

import de.ruegnerlukas.strategygame.backend.common.models.GameConfig
import de.ruegnerlukas.strategygame.backend.common.models.resources.ResourceCollection
import de.ruegnerlukas.strategygame.backend.economy.prebuild.BasicEconomyNode
import de.ruegnerlukas.strategygame.backend.economy.prebuild.EconomyNodeStorageImpl
import de.ruegnerlukas.strategygame.backend.gameengine.core.eco.EconomyPopFoodConsumptionProvider
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.GameExtended
import de.ruegnerlukas.strategygame.backend.gameengine.ports.models.Province

class MarketEconomyNode(
    provinces: Collection<Province>,
    game: GameExtended,
    config: GameConfig,
    popFoodConsumption: EconomyPopFoodConsumptionProvider
) : BasicEconomyNode(
    storage = EconomyNodeStorageImpl(ResourceCollection.basic()),
    nodeFactory = { nodes, _ ->
        provinces.forEach { province ->
            nodes.add(ProvinceEconomyNode(province, game, config, popFoodConsumption))
        }
    },
    entityFactory = { _, _ -> }
)