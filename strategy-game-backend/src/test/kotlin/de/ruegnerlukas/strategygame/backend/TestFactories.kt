package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestService
import de.ruegnerlukas.strategygame.backend.core.ports.provided.WorldService
import de.ruegnerlukas.strategygame.backend.core.service.test.TestServiceImpl
import de.ruegnerlukas.strategygame.backend.core.service.world.WorldServiceImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldRepositoryImpl

class TestFactories {
	companion object {

		fun buildTestHandler(): TestService {
			return TestServiceImpl(TestRepositoryImpl())
		}

		fun buildWorldHandler(worldRepository: WorldRepositoryImpl = WorldRepositoryImpl()): WorldService {
			return WorldServiceImpl(worldRepository)
		}

	}
}