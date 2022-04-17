package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestHandler
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldHandler
import de.ruegnerlukas.strategygame.backend.core.service.test.TestService
import de.ruegnerlukas.strategygame.backend.core.service.world.WorldService
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldRepositoryImpl

class TestFactories {
	companion object {

		fun buildTestHandler(): TestHandler {
			return TestService(TestRepositoryImpl())
		}

		fun buildWorldHandler(worldRepository: WorldRepositoryImpl = WorldRepositoryImpl()): WorldHandler {
			return WorldService(worldRepository)
		}

	}
}