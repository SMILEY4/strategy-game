package de.ruegnerlukas.strategygame.backend.core.service.test

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestService
import de.ruegnerlukas.strategygame.backend.core.ports.required.TestRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging

/**
 * Implementation of a [TestService]
 */
class TestServiceImpl(private val testRepository: TestRepository) : TestService, Logging {

	override fun sayHello(name: String): String {
		log().info("Saying hello to $name")
		return testRepository
			.getMessage("HELLO")
			.replace("[name]", name)
	}

}