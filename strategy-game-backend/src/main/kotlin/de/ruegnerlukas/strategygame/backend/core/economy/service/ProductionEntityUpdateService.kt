package de.ruegnerlukas.strategygame.backend.core.economy.service

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity
import de.ruegnerlukas.strategygame.backend.shared.Logging

class ProductionEntityUpdateService: Logging {

    fun update(entity: EconomyEntity) {
        entity.getNode().getStorage().add(entity.getProduces())
        entity.flagProduced()
        log().debug("[eco-update] $entity produced ${entity.getProduces().toList()}")
    }

}