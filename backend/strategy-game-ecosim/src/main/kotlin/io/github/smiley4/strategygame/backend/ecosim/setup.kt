package io.github.smiley4.strategygame.backend.ecosim

import io.github.smiley4.strategygame.backend.ecosim.lib.EconomyService
import io.github.smiley4.strategygame.backend.ecosim.application.logic.ConsumptionEntityUpdateService
import io.github.smiley4.strategygame.backend.ecosim.application.logic.ConsumptionNodeUpdateService
import io.github.smiley4.strategygame.backend.ecosim.application.logic.EconomyServiceImpl
import io.github.smiley4.strategygame.backend.ecosim.application.logic.ProductionEntityUpdateService
import io.github.smiley4.strategygame.backend.ecosim.application.logic.ProductionNodeUpdateService
import org.koin.core.module.Module

fun Module.dependenciesEcoSim() {
    single<EconomyService> { EconomyServiceImpl(get(), get()) }

    single<ConsumptionNodeUpdateService> { ConsumptionNodeUpdateService(get()) }
    single<ProductionNodeUpdateService> { ProductionNodeUpdateService(get()) }

    single<ConsumptionEntityUpdateService> { ConsumptionEntityUpdateService() }
    single<ProductionEntityUpdateService> { ProductionEntityUpdateService() }
}
