package de.ruegnerlukas.strategygame.backend

import com.arangodb.DbName
import com.arangodb.async.ArangoCollectionAsync
import com.arangodb.async.ArangoDBAsync
import com.arangodb.entity.Key
import com.arangodb.mapping.ArangoJack
import com.fasterxml.jackson.module.kotlin.KotlinModule
import kotlinx.coroutines.future.await

suspend fun main() {
	val arango = ArangoDBAsync.Builder()
		.serializer(ArangoJack().apply {
			configure { it.registerModule(KotlinModule.Builder().build()) }
		})
		.host("localhost", 8529)
		.build()

	val database = arango.db(DbName.of("test"))
	if (!database.exists().await()) {
		database.create()
	}

	val collection = database.collection("test-collection")
	if (!collection.exists().await()) {
		collection.create()
	}

	try {

		val result = collection.deleteDocument(
			"sfdhfuz",
		).await()

		println(result)

	} catch (e: Exception) {
		e.printStackTrace()
	}


	arango.shutdown()
}


suspend fun insert(collection: ArangoCollectionAsync) {
	val game = TestGameEntity(
		key = null,
		turn = 42,
		players = listOf(
			TestPlayerEntity(
				userId = "user1",
				connectionId = null,
				state = "loading"
			),
			TestPlayerEntity(
				userId = "user2",
				connectionId = 3,
				state = "waiting"
			)
		)
	)
	collection.insertDocument(game).await()
}


suspend fun measure(block: suspend () -> Unit) {
	println("starting...")
	val ts = System.currentTimeMillis()
	block()
	val te = System.currentTimeMillis()
	println("...done. Took ${te - ts} ms")
}

class TestGameEntity(
	@Key val key: String?,
	val turn: Int,
	val players: List<TestPlayerEntity>
)

class TestPlayerEntity(
	val userId: String,
	val connectionId: Int?,
	val state: String
)
