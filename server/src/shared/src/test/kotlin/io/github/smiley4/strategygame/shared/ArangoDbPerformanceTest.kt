package io.github.smiley4.strategygame.shared

import io.github.smiley4.strategygame.shared.arangodb.DatabaseProvider
import io.github.smiley4.strategygame.shared.arangodb.DbEntity
import io.kotest.core.spec.style.FreeSpec
import kotlinx.coroutines.future.await
import kotlin.random.Random
import kotlin.random.nextInt
import kotlin.time.Duration.Companion.seconds
import kotlin.time.measureTime

class ArangoDbPerformanceTest : FreeSpec({

    "query many entities" {
        val db = createDb()
        db.assertCollections("testentities")

        val entities = createTestEntities(42, 10000)

        val durationInsert = measureTime {
            db.insertDocuments("testentities", entities)
        }


        val durationQuery = measureTime {
            db.query(
                """
                    FOR entity in testentities
                        RETURN entity
                """.trimIndent(),
                TestEntity::class.java
            )
        }


        db.database.drop().await()

        println("""
            TEST RESULTS:
            - insert: $durationInsert
            -  query: $durationQuery
        """.trimIndent())
    }

}) {

    companion object {

        suspend fun createDb() = DatabaseProvider.create(
            DatabaseProvider.Config(
                host = "localhost",
                port = 8529,
                username = null,
                password = null,
                name = "testing",
                retryCount = 4,
                retryTimeout = 10.seconds,
            )
        )

        fun createTestEntities(seed: Long, n: Int): List<TestEntity> {
            val random = Random(seed)
            return (1..n).map { createTestEntity(random) }
        }

        fun createTestEntity(random: Random): TestEntity {
            return TestEntity(
                gameId = "12345",
                discoveredBy = (0..random.nextInt(0..3)).map {
                    listOf("a", "b", "c", "d")[random.nextInt(4)]
                }.toSet(),
                position = TestPosition(
                    q = random.nextInt(-1000..1000),
                    r = random.nextInt(-1000..1000)
                ),
                dataWorld = TestWorldData(
                    terrain = TestTerrainType.entries[random.nextInt(TestTerrainType.entries.size)],
                    resources = (0..random.nextInt(0..3)).map {
                        TestResourceNode(
                            type = listOf("metal", "stone", "wood", "food")[random.nextInt(4)],
                            amount = random.nextInt(0..1000).toDouble(),
                            maxAmount = 100.0,
                            changeRate = 10.0
                        )
                    },
                    height = random.nextFloat(),
                ),
                seed = random.nextLong()
            )
        }
    }

}

class TestEntity(
    val gameId: String,
    val discoveredBy: Set<String>,
    val position: TestPosition,
    val dataWorld: TestWorldData,
    val seed: Long,
    key: String? = null
) : DbEntity(key)

class TestPosition(
    val q: Int,
    val r: Int
)

class TestWorldData(
    val terrain: TestTerrainType,
    val resources: List<TestResourceNode>,
    val height: Float,
)

enum class TestTerrainType {
    LAND,
    WATER,
    MOUNTAIN,
}

class TestResourceNode(
    val type: String,
    val amount: Double,
    val maxAmount: Double,
    val changeRate: Double,
)