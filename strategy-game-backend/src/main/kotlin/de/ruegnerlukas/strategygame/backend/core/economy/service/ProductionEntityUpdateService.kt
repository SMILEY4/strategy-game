package de.ruegnerlukas.strategygame.backend.core.economy.service

import de.ruegnerlukas.strategygame.backend.core.economy.data.EconomyEntity

class ProductionEntityUpdateService {

    fun update(entity: EconomyEntity) {
        entity.getNode().getStorage().add(entity.getProduces())
        entity.flagProduced()
    }

}