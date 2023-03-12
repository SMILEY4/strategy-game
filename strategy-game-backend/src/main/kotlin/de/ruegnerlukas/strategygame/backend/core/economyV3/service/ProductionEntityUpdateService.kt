package de.ruegnerlukas.strategygame.backend.core.economyV3.service

import de.ruegnerlukas.strategygame.backend.core.economyV3.data.EconomyEntity

class ProductionEntityUpdateService {

    fun update(entity: EconomyEntity) {
        entity.getProduces().forEach {
            entity.getNode().getStorage().add(it.type, it.amount)
            entity.flagProduced()
        }
    }

}