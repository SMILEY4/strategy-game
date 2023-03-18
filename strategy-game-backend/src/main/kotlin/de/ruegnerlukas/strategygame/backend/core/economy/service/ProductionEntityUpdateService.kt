package de.ruegnerlukas.strategygame.backend.core.economy.service

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity

class ProductionEntityUpdateService {

    fun update(entity: EconomyEntity) {
        entity.getProduces().forEach {
            entity.getNode().getStorage().add(it.type, it.amount)
        }
        entity.flagProduced()
    }

}