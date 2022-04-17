package de.ruegnerlukas.strategygame.backend

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestHandler
import de.ruegnerlukas.strategygame.backend.core.service.TestService
import de.ruegnerlukas.strategygame.backend.external.persistence.TestRepositoryImpl

class TestFactories {
	companion object {

		fun buildTestHandler(): TestHandler {
			return TestService(TestRepositoryImpl())
		}

	}
}