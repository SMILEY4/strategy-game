package de.ruegnerlukas.strategygame.backend.core.service

import de.ruegnerlukas.strategygame.backend.core.ports.provided.TestHandler
import de.ruegnerlukas.strategygame.backend.core.ports.required.TestRepository
import de.ruegnerlukas.strategygame.backend.shared.Logging

class TestService(private val testRepository: TestRepository) : TestHandler, Logging {

	override fun sayHello(name: String): String {
		log().info("Saying hello to $name")
		return testRepository
			.getMessage("HELLO")
			.replace("[name]", name)
	}

}