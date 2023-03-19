package de.ruegnerlukas.strategygame.backend.shared

import de.ruegnerlukas.strategygame.backend.shared.arango.DbEntity
import de.ruegnerlukas.strategygame.backend.testutils.TestUtilsFactory
import io.kotest.core.spec.style.StringSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe

class DbEntityTest : StringSpec({

	"syntax (without db)" {
		val entity = TestEntity("myName", 42)
		entity.name shouldBe "myName"
		entity.counter shouldBe 42
		entity.key shouldBe null
	}

	"insert and fetch from database" {
		val database = TestUtilsFactory.createTestDatabase()

		val key = database.insertDocument("testEntities", TestEntity("myName", 42)).getOrThrow().key

		database.getDocument("testEntities", key, TestEntity::class.java).getOrThrow().let { result ->
			result.shouldNotBeNull()
			result.name shouldBe "myName"
			result.counter shouldBe 42
			result.key.shouldNotBeNull()
			result.key shouldBe key
		}
	}

	"(de-) serialize to/from json" {

		val entity = TestEntity("myName", 42, id = "myId")

		val jsonString = Json.asString(entity)
			.replace("\r", "")
			.replace("\n", "")
			.replace(" ", "")
			.also {
				it shouldBe "{\"name\":\"myName\",\"counter\":42,\"_key\":\"myId\"}"
			}

		Json.fromString<TestEntity>(jsonString).let {
			it.name shouldBe "myName"
			it.counter shouldBe 42
			it.key shouldBe "myId"
		}

	}

}) {
	companion object {
		internal class TestEntity(
			val name: String,
			val counter: Int,
			id: String? = null
		) : DbEntity(id)
	}
}