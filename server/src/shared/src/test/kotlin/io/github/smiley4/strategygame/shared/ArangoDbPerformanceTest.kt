//package io.github.smiley4.strategygame.shared
//
//import com.arangodb.serde.jackson.Key
//import com.arangodb.util.RawBytes
//import com.arangodb.util.RawJson
//import com.arangodb.velocypack.VPackBuilder
//import com.arangodb.velocypack.VPackSlice
//import com.arangodb.velocypack.ValueType
//import io.github.smiley4.strategygame.shared.arangodb.DatabaseProvider
//import io.kotest.core.spec.style.FreeSpec
//import kotlinx.coroutines.future.await
//import kotlinx.serialization.ExperimentalSerializationApi
//import kotlinx.serialization.SerialName
//import kotlinx.serialization.Serializable
//import kotlinx.serialization.json.JsonIgnoreUnknownKeys
//import kotlin.random.Random
//import kotlin.random.nextInt
//import kotlin.time.Duration.Companion.seconds
//import kotlin.time.measureTime
//
//
//class ArangoDbPerformanceTest : FreeSpec({
//
//    "query many entities with default kotlin jackson serializer" {
//        val db = createDb()
//        db.assertCollections("testentities")
//
//        val entities = createSimpleTestEntities(10000)
//
//        val durationInsert = measureTime {
//            db.insertDocuments("testentities", entities)
//        }
//
//        val durationQuery = measureTime {
//            db.query(
//                """
//                    FOR entity in testentities
//                        RETURN entity
//                """.trimIndent(),
//                SimpleTestEntity::class.java
//            )
//        }
//
//
//        db.database.drop().await()
//
//        println(
//            """
//            TEST RESULTS:
//            - insert: $durationInsert
//            -  query: $durationQuery
//        """.trimIndent()
//        )
//        // QUERY: ~290ms for 10K
//    }
//
////    "query many entities with default kotlinx-serialization workaround" {
////        val db = createDb()
////        db.assertCollections("testentities")
////
////        val entities = createTestEntities(42, 10000).map {
////            RawJson.of(Json.encodeToString(it))
////        }
////
////        val durationInsert = measureTime {
////            db.insertDocuments("testentities", entities)
////        }
////
////        val durationQuery = measureTime {
////            db.query(
////                """
////                    FOR entity in testentities
////                        RETURN entity
////                """.trimIndent(),
////                RawJson::class.java
////            ).map { Json.decodeFromString<TestEntity>(it.get()) }
////        }
////
////        db.database.drop().await()
////
////        println(
////            """
////            TEST RESULTS:
////            - insert: $durationInsert
////            -  query: $durationQuery
////        """.trimIndent()
////        )
////        // QUERY: ~230ms for 10K
////    }
//
//    "query many entities with vpack workaround" {
//        // todo: change aranbobuilder, add: ".protocol(Protocol.HTTP_VPACK)", remove serde config
//        val db = createDb()
//        db.assertCollections("testentities")
//
//        val entities = createSimpleTestEntities(10000).map {
//            val builder = VPackBuilder()
//            builder.add(ValueType.OBJECT) // object start
//            builder.add("foo", it.foo) // add field "foo" with value "bar"
//            builder.close() // object end
//            RawBytes.of(builder.slice().toByteArray())
//        }
//
//        val durationInsert = measureTime {
//            db.insertDocuments("testentities", entities)
//        }
//
//        val durationQuery = measureTime {
//            db.query(
//                """
//                    FOR entity in testentities
//                        RETURN entity
//                """.trimIndent(),
//                RawBytes::class.java
//            ).map {
//                val slice = VPackSlice(it.get())
//                SimpleTestEntity(
//                    foo = slice.get("foo").asString
//                )
//            }
//        }
//
//        db.database.drop().await()
//
//        println(
//            """
//            TEST RESULTS:
//            - insert: $durationInsert
//            -  query: $durationQuery
//        """.trimIndent()
//        )
//    }
//
//}) {
//
//    companion object {
//
//        suspend fun createDb() = DatabaseProvider.create(
//            DatabaseProvider.Config(
//                host = "localhost",
//                port = 8529,
//                username = null,
//                password = null,
//                name = "testing",
//                retryCount = 4,
//                retryTimeout = 10.seconds,
//            )
//        )
//
//        fun createSimpleTestEntities(n: Int): List<SimpleTestEntity> {
//            return (1..n).map { SimpleTestEntity("bar") }
//        }
//
//        fun createTestEntities(seed: Long, n: Int): List<TestEntity> {
//            val random = Random(seed)
//            return (1..n).map { createTestEntity(random) }
//        }
//
//        fun createTestEntity(random: Random): TestEntity {
//            return TestEntity(
//                gameId = "12345",
//                discoveredBy = (0..random.nextInt(0..3)).map {
//                    listOf("a", "b", "c", "d")[random.nextInt(4)]
//                }.toSet(),
//                position = TestPosition(
//                    q = random.nextInt(-1000..1000),
//                    r = random.nextInt(-1000..1000)
//                ),
//                dataWorld = TestWorldData(
//                    terrain = TestTerrainType.entries[random.nextInt(TestTerrainType.entries.size)],
//                    resources = (0..random.nextInt(0..3)).map {
//                        TestResourceNode(
//                            type = listOf("metal", "stone", "wood", "food")[random.nextInt(4)],
//                            amount = random.nextInt(0..1000).toDouble(),
//                            maxAmount = 100.0,
//                            changeRate = 10.0
//                        )
//                    },
//                    height = random.nextFloat(),
//                ),
//                seed = random.nextLong()
//            )
//        }
//    }
//
//}
//
//
//@Serializable
//class SimpleTestEntity(
//    val foo: String,
//)
//
//
//@Serializable
//@JsonIgnoreUnknownKeys
//@OptIn(ExperimentalSerializationApi::class)
//data class TestEntity(
//    val gameId: String,
//    val discoveredBy: Set<String>,
//    val position: TestPosition,
//    val dataWorld: TestWorldData,
//    val seed: Long,
//    @field:Key @SerialName("_key") val key: String? = null
//)
//
//
//@Serializable
//data class TestPosition(
//    val q: Int,
//    val r: Int
//)
//
//
//@Serializable
//data class TestWorldData(
//    val terrain: TestTerrainType,
//    val resources: List<TestResourceNode>,
//    val height: Float,
//)
//
//
//@Serializable
//enum class TestTerrainType {
//    LAND,
//    WATER,
//    MOUNTAIN,
//}
//
//
//@Serializable
//data class TestResourceNode(
//    val type: String,
//    val amount: Double,
//    val maxAmount: Double,
//    val changeRate: Double,
//)