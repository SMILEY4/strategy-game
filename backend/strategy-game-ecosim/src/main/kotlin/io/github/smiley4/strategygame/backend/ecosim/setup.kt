package io.github.smiley4.strategygame.backend.ecosim

import io.github.smiley4.strategygame.backend.ecosim.edge.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.module.logic.ConsumptionEntityUpdateService
import io.github.smiley4.strategygame.backend.ecosim.module.logic.ConsumptionNodeUpdateService
import io.github.smiley4.strategygame.backend.ecosim.module.logic.EconomyServiceImpl
import io.github.smiley4.strategygame.backend.ecosim.module.logic.ProductionEntityUpdateService
import io.github.smiley4.strategygame.backend.ecosim.module.logic.ProductionNodeUpdateService
import org.koin.core.module.Module

fun Module.dependenciesEcoSim() {
    single<EconomyService> { EconomyServiceImpl(get(), get()) }

    single<ConsumptionNodeUpdateService> { ConsumptionNodeUpdateService(get()) }
    single<ProductionNodeUpdateService> { ProductionNodeUpdateService(get()) }

    single<ConsumptionEntityUpdateService> { ConsumptionEntityUpdateService() }
    single<ProductionEntityUpdateService> { ProductionEntityUpdateService() }
}
