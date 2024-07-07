package io.github.smiley4.strategygame.backend.commonarangodb

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FreeSpec
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldNotBeBlank
import kotlin.time.Duration.Companion.seconds

class ArangoDatabaseTest : FreeSpec({

    beforeEach {
        deleteDatabase()
    }
    afterEach {
        deleteDatabase()
    }

    "insert" - {

        "single document" {
            withDatabase { db ->

                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                    .also { it.shouldBeValid() }

                db.count(TEST_COLLECTION) shouldBe 1
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 1
                    result[0].key shouldBe handle.key
                    result[0].name shouldBe "test"
                    result[0].value shouldBe 42
                }

            }
        }

        "single document that already exists, expect correct error" {
            withDatabase { db ->

                val handleExisting = db.insertDocument(TEST_COLLECTION, testEntity("test1", 1))

                shouldThrow<UniqueConstraintViolationError> {
                    db.insertDocument(TEST_COLLECTION, testEntity(handleExisting.key, "test2", 2))
                }

                db.count(TEST_COLLECTION) shouldBe 1
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 1
                    result[0].name shouldBe "test1"
                    result[0].value shouldBe 1
                    result[0].key shouldNotBe null
                }

            }
        }

        "multiple documents" {
            withDatabase { db ->

                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 42),
                        testEntity("test-2", 43),
                        testEntity("test-3", 44)
                    )
                ).let {
                    it shouldHaveSize 3
                    it.forEach { e -> e.shouldBeValid() }
                }

                db.count(TEST_COLLECTION) shouldBe 3
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 42
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 43
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-3" }.let {
                        it!!
                        it.value shouldBe 44
                        it.key shouldNotBe null
                    }
                }
            }
        }

        "multiple documents with some already existing, expect inserted some" {
            withDatabase { db ->

                val handleExisting = db.insertDocument(TEST_COLLECTION, testEntity("test-x", 10))

                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 1),
                        testEntity(key = handleExisting.key, "test-x", 10),
                        testEntity("test-2", 2)
                    )
                ).let {
                    it shouldHaveSize 2
                    it.forEach { e -> e.shouldBeValid() }
                }

                db.count(TEST_COLLECTION) shouldBe 3
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 1
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 2
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-x" }.let {
                        it!!
                        it.value shouldBe 10
                        it.key shouldNotBe null
                    }
                }
            }
        }

    }

    "insert or replace" - {

        "single document" {
            withDatabase { db ->

                val handle = db.insertOrReplaceDocument(TEST_COLLECTION, testEntity("test", 42))
                    .also { it.shouldBeValid() }

                db.count(TEST_COLLECTION) shouldBe 1
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 1
                    result[0].key shouldBe handle.key
                    result[0].name shouldBe "test"
                    result[0].value shouldBe 42
                }

            }
        }

        "single document that already exists, expect overwritten document" {
            withDatabase { db ->

                val handleExisting = db.insertDocument(TEST_COLLECTION, testEntity("test1", 1))

                db.insertOrReplaceDocument(TEST_COLLECTION, testEntity(handleExisting.key, "test2", 2))
                    .also { it.shouldBeValid() }

                db.count(TEST_COLLECTION) shouldBe 1
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 1
                    result[0].name shouldBe "test2"
                    result[0].value shouldBe 2
                    result[0].key shouldBe handleExisting.key
                }

            }
        }

        " multiple documents" {
            withDatabase { db ->

                db.insertOrReplaceDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 42),
                        testEntity("test-2", 43),
                        testEntity("test-3", 44)
                    )
                ).let {
                    it shouldHaveSize 3
                    it.forEach { e -> e.shouldBeValid() }
                }

                db.count(TEST_COLLECTION) shouldBe 3
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 42
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 43
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-3" }.let {
                        it!!
                        it.value shouldBe 44
                        it.key shouldNotBe null
                    }
                }
            }
        }

        "multiple documents with some already existing, expect insert some and overwrite existing" {
            withDatabase { db ->

                val handleExisting = db.insertDocument(TEST_COLLECTION, testEntity("test-x", 10))

                db.insertOrReplaceDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 1),
                        testEntity(key = handleExisting.key, "test-x*", 11),
                        testEntity("test-2", 2)
                    )
                ).let {
                    it shouldHaveSize 3
                    it.forEach { e -> e.shouldBeValid() }
                }

                db.count(TEST_COLLECTION) shouldBe 3
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 1
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 2
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-x*" }.let {
                        it!!
                        it.value shouldBe 11
                        it.key shouldBe handleExisting.key
                    }
                }
            }
        }

    }

    "get" - {

        "document" {
            withDatabase { db ->
                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                val result = db.getDocument(TEST_COLLECTION, handle.key, TestEntity::class.java)
                result.also {
                    it.name shouldBe "test"
                    it.value shouldBe 42
                    it.key shouldBe handle.key
                }
            }
        }

        "not existing document, expect correct error" {
            withDatabase { db ->
                shouldThrow<DocumentNotFoundError> {
                    db.getDocument(TEST_COLLECTION, "wrong-key", TestEntity::class.java)
                }
            }
        }


        "documents" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                val requestedKeys = handles.map { it.key }
                db.getDocuments(TEST_COLLECTION, requestedKeys, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 41
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 42
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-3" }.let {
                        it!!
                        it.value shouldBe 43
                        it.key shouldNotBe null
                    }
                }
            }
        }

        "documents, some do not exist" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42)
                    )
                )
                val requestedKeys = handles.map { it.key }.toMutableList().also { it.add("missing-key") }
                db.getDocuments(TEST_COLLECTION, requestedKeys, TestEntity::class.java).let { result ->
                    result shouldHaveSize 2
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 41
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 42
                        it.key shouldNotBe null
                    }
                }
            }
        }

        "all documents from collection" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java).let { result ->
                    result shouldHaveSize 3
                    result.find { it.name == "test-1" }.let {
                        it!!
                        it.value shouldBe 41
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-2" }.let {
                        it!!
                        it.value shouldBe 42
                        it.key shouldNotBe null
                    }
                    result.find { it.name == "test-3" }.let {
                        it!!
                        it.value shouldBe 43
                        it.key shouldNotBe null
                    }
                }
            }
        }

    }

    "replace" - {

        "single document" {
            withDatabase { db ->
                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                db.replaceDocument(TEST_COLLECTION, handle.key, testEntity("test*", 43)).also {
                    it.key shouldBe handle.key
                }
                db.getDocument(TEST_COLLECTION, handle.key, TestEntity::class.java).also {
                    it.name shouldBe "test*"
                    it.value shouldBe 43
                }
            }
        }

        "a not existing document, expect correct error" {
            withDatabase { db ->
                shouldThrow<DocumentNotFoundError> {
                    db.replaceDocument(TEST_COLLECTION, "unknown", testEntity("test*", 43))
                }
            }
        }

        "multiple documents" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.replaceDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity(handles[0].key, "test-1*", 410),
                        testEntity(handles[2].key, "test-3*", 430)
                    )
                ).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }

                db.getDocument(TEST_COLLECTION, handles[0].key, TestEntity::class.java).also {
                    it.name shouldBe "test-1*"
                    it.value shouldBe 410
                }
                db.getDocument(TEST_COLLECTION, handles[1].key, TestEntity::class.java).also {
                    it.name shouldBe "test-2"
                    it.value shouldBe 42
                }
                db.getDocument(TEST_COLLECTION, handles[2].key, TestEntity::class.java).also {
                    it.name shouldBe "test-3*"
                    it.value shouldBe 430
                }
            }
        }

        "multiple documents, some do not exist" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.replaceDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity(handles[0].key, "test-1*", 410),
                        testEntity(handles[2].key, "test-3*", 430),
                        testEntity("unknown", "test-X*", 10)
                    )
                ).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }

                db.getDocument(TEST_COLLECTION, handles[0].key, TestEntity::class.java).also {
                    it.name shouldBe "test-1*"
                    it.value shouldBe 410
                }
                db.getDocument(TEST_COLLECTION, handles[1].key, TestEntity::class.java).also {
                    it.name shouldBe "test-2"
                    it.value shouldBe 42
                }
                db.getDocument(TEST_COLLECTION, handles[2].key, TestEntity::class.java).also {
                    it.name shouldBe "test-3*"
                    it.value shouldBe 430
                }
            }
        }

    }

    "update" - {
        "single document" {
            withDatabase { db ->
                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                db.updateDocument(TEST_COLLECTION, handle.key, testEntity("test*", 43)).also {
                    it.key shouldBe handle.key
                }
                db.getDocument(TEST_COLLECTION, handle.key, TestEntity::class.java).also {
                    it.name shouldBe "test*"
                    it.value shouldBe 43
                }
            }
        }

        "not existing document, expect correct error" {
            withDatabase { db ->
                shouldThrow<DocumentNotFoundError> {
                    db.updateDocument(TEST_COLLECTION, "unknown", testEntity("test*", 43))
                }
            }
        }

        "multiple documents" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.updateDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity(handles[0].key, "test-1*", 410),
                        testEntity(handles[2].key, "test-3*", 430)
                    )
                ).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }

                db.getDocument(TEST_COLLECTION, handles[0].key, TestEntity::class.java).also {
                    it.name shouldBe "test-1*"
                    it.value shouldBe 410
                }
                db.getDocument(TEST_COLLECTION, handles[1].key, TestEntity::class.java).also {
                    it.name shouldBe "test-2"
                    it.value shouldBe 42
                }
                db.getDocument(TEST_COLLECTION, handles[2].key, TestEntity::class.java).also {
                    it.name shouldBe "test-3*"
                    it.value shouldBe 430
                }
            }
        }

        "multiple documents, some do not exist" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.updateDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity(handles[0].key, "test-1*", 410),
                        testEntity(handles[2].key, "test-3*", 430),
                        testEntity("unknown", "test-X*", 10)
                    )
                ).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }

                db.getDocument(TEST_COLLECTION, handles[0].key, TestEntity::class.java).also {
                    it.name shouldBe "test-1*"
                    it.value shouldBe 410
                }
                db.getDocument(TEST_COLLECTION, handles[1].key, TestEntity::class.java).also {
                    it.name shouldBe "test-2"
                    it.value shouldBe 42
                }
                db.getDocument(TEST_COLLECTION, handles[2].key, TestEntity::class.java).also {
                    it.name shouldBe "test-3*"
                    it.value shouldBe 430
                }
            }
        }

    }

    "delete" - {

        "single document" {
            withDatabase { db ->
                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                db.deleteDocument(TEST_COLLECTION, handle.key).also {
                    it.key shouldBe handle.key
                }
                db.count(TEST_COLLECTION) shouldBe 0
            }
        }

        "not existing document, expect correct error" {
            withDatabase { db ->
                shouldThrow<DocumentNotFoundError> {
                    db.deleteDocument(TEST_COLLECTION, "unknown")
                }
            }
        }

        "multiple documents" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.deleteDocuments(TEST_COLLECTION, listOf(handles[0].key, handles[2].key)).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java)
                    .map { it.key } shouldContainExactlyInAnyOrder listOf(handles[1].key)
            }
        }

        "multiple documents, some do not exist" {
            withDatabase { db ->
                val handles = db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.deleteDocuments(TEST_COLLECTION, listOf(handles[0].key, handles[2].key, "unknown")).let {
                    it shouldHaveSize 2
                    it.map { e -> e.key } shouldContainExactlyInAnyOrder listOf(handles[0].key, handles[2].key)
                }
                db.getAllDocuments(TEST_COLLECTION, TestEntity::class.java)
                    .map { it.key } shouldContainExactlyInAnyOrder listOf(handles[1].key)
            }
        }

    }
    "exists" - {

        "existing document" {
            withDatabase { db ->
                val handle = db.insertDocument(TEST_COLLECTION, testEntity("test", 42))
                db.existsDocument(TEST_COLLECTION, handle.key) shouldBe true
            }
        }

        "non-existing document" {
            withDatabase { db ->
                db.existsDocument(TEST_COLLECTION, "unknown") shouldBe false
            }
        }

    }
    "count" - {

        "documents" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 41),
                        testEntity("test-2", 42),
                        testEntity("test-3", 43)
                    )
                )
                db.count(TEST_COLLECTION) shouldBe 3
            }
        }

        "documents with empty collection" {
            withDatabase { db ->
                db.assertCollections(TEST_COLLECTION)
                db.count(TEST_COLLECTION) shouldBe 0
            }
        }

    }

    "query" - {

        "documents, match some" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 1),
                        testEntity("test-2", 0),
                        testEntity("test-3", 1)
                    )
                )
                db.query("FOR e IN $TEST_COLLECTION FILTER e.value == 1 RETURN e.name", String::class.java).let {
                    it shouldHaveSize 2
                    it shouldContainExactlyInAnyOrder listOf("test-1", "test-3")
                }
            }
        }

        "documents, match none" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 0),
                        testEntity("test-2", 0),
                        testEntity("test-3", 0)
                    )
                )
                db.query("FOR e IN $TEST_COLLECTION FILTER e.value == 1 RETURN e.name", String::class.java) shouldHaveSize 0
            }
        }

        "single document, match one" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 0),
                        testEntity("test-2", 0),
                        testEntity("test-3", 1)
                    )
                )
                db.querySingle("FOR e IN $TEST_COLLECTION FILTER e.value == 1 RETURN e.name", String::class.java).also {
                    it shouldBe "test-3"
                }
            }
        }

        "single document, match multiple, expect error" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 1),
                        testEntity("test-2", 0),
                        testEntity("test-3", 1)
                    )
                )
                shouldThrow<DocumentNotFoundError> {
                    db.querySingle("FOR e IN $TEST_COLLECTION FILTER e.value == 1 RETURN e.name", String::class.java)
                }
            }
        }

        "single document, match none, expect error" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 0),
                        testEntity("test-2", 0),
                        testEntity("test-3", 0)
                    )
                )
                shouldThrow<DocumentNotFoundError> {
                    db.querySingle("FOR e IN $TEST_COLLECTION FILTER e.value == 1 RETURN e.name", String::class.java)
                }
            }
        }


        "first document, match one" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 0),
                        testEntity("test-2", 0),
                        testEntity("test-3", 1)
                    )
                )
                db.queryFirst("FOR e IN $TEST_COLLECTION FILTER e.value == 1 SORT e.name ASC RETURN e.name", String::class.java).also {
                    it shouldBe "test-3"
                }
            }
        }

        "first document, match multiple, expect error" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 1),
                        testEntity("test-2", 0),
                        testEntity("test-3", 1)
                    )
                )
                db.queryFirst("FOR e IN $TEST_COLLECTION FILTER e.value == 1 SORT e.name ASC RETURN e.name", String::class.java).also {
                    it shouldBe "test-1"
                }
            }
        }

        "first document, match none, expect error" {
            withDatabase { db ->
                db.insertDocuments(
                    TEST_COLLECTION, listOf(
                        testEntity("test-1", 0),
                        testEntity("test-2", 0),
                        testEntity("test-3", 0)
                    )
                )
                shouldThrow<DocumentNotFoundError> {
                    db.queryFirst("FOR e IN $TEST_COLLECTION FILTER e.value == 1 SORT e.name ASC RETURN e.name", String::class.java)
                }
            }
        }

    }
}) {
    companion object {

        suspend fun withDatabase(block: suspend (database: ArangoDatabase) -> Unit) {
            val config = DatabaseProvider.Config(
                host = "localhost",
                port = TestContainers.arangoDbPort ?: throw Exception("no port set for arangodb container"),
                username = null,
                password = null,
                name = "strategy-game-testing",
                retryCount = 5,
                retryTimeout = 5.seconds
            )
            block(DatabaseProvider.create(config))
        }

        suspend fun deleteDatabase() {
            val config = DatabaseProvider.Config(
                host = "localhost",
                port = TestContainers.arangoDbPort ?: throw Exception("no port set for arangodb container"),
                username = null,
                password = null,
                name = "strategy-game-testing",
                retryCount = 5,
                retryTimeout = 5.seconds
            )
            ArangoDatabase.delete(config.host, config.port, config.username, config.password, config.name)
        }

        internal const val TEST_COLLECTION = "dbTestCollection"

        internal class TestEntity(
            key: String?,
            val name: String,
            val value: Int,
        ) : DbEntity(key)

        internal fun testEntity(name: String, value: Int) =
            TestEntity(key = null, name = name, value = value)

        internal fun testEntity(key: String, name: String, value: Int) =
            TestEntity(key = key, name = name, value = value)

        internal fun DocumentHandle.shouldBeValid() {
            this.id.shouldNotBeNull()
            this.id.shouldNotBeBlank()
            this.key.shouldNotBeNull()
            this.key.shouldNotBeBlank()
            this.rev.shouldNotBeNull()
            this.rev.shouldNotBeBlank()
        }

    }
}