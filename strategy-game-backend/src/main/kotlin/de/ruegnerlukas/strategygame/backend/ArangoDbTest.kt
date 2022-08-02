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

	val collection = database.collection("perf-test")
	if (!collection.exists().await()) {
		collection.create()
	}

	measure {
		for (i in 0..1000) {
			insert(collection)
		}
	}

//	println(Json.asString(collection.getDocument("776", GameEntity::class.java)))
//
//	val strQuery = "FOR game IN ${collection.name()} FILTER game.turn == @turn RETURN game"
//	val result = database.query(strQuery, mapOf("turn" to 42), null, GameEntity::class.java).await()
//	result.forEach {
//		println(Json.asString(it))
//	}

	arango.shutdown()
}


suspend fun insert(collection: ArangoCollectionAsync) {
	val game = GameEntity(
		key = null,
		turn = 42,
		players = listOf(
			PlayerEntity(
				userId = "user1",
				connectionId = null,
				state = "loading"
			),
			PlayerEntity(
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

class GameEntity(
	@Key val key: String?,
	val turn: Int,
	val players: List<PlayerEntity>
)

class PlayerEntity(
	val userId: String,
	val connectionId: Int?,
	val state: String
)
