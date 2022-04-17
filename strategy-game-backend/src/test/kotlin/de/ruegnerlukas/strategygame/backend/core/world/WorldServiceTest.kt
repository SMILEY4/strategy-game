package de.ruegnerlukas.strategygame.backend.core.world

import de.ruegnerlukas.strategygame.backend.TestFactories
import de.ruegnerlukas.strategygame.backend.external.persistence.WorldRepositoryImpl
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.result.shouldBeSuccess
import io.kotest.matchers.shouldNotBe

class WorldServiceTest : StringSpec({

	"create a new world is successful" {
		val worldRepository = WorldRepositoryImpl()
		val worldHandler = TestFactories.buildWorldHandler(worldRepository)

		val createResult = worldHandler.create()
		createResult.shouldBeSuccess()

		val fetchResult = worldRepository.getTilemap(createResult.getOrThrow().worldId)
		fetchResult.shouldBeSuccess()
		fetchResult.getOrThrow().tiles.size shouldNotBe 0
	}

})