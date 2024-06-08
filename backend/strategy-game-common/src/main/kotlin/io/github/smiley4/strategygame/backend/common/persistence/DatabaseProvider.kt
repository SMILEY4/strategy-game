package io.github.smiley4.strategygame.backend.common.persistence

import com.arangodb.ArangoDBException
import io.github.smiley4.strategygame.backend.common.logging.Logging
import io.github.smiley4.strategygame.backend.common.persistence.arango.ArangoDatabase
import kotlinx.coroutines.delay
import java.util.concurrent.CompletionException
import kotlin.time.Duration

object DatabaseProvider : Logging {

    var portOverwrite: Int? = null

    suspend fun create(dbName: String, host: String, port: Int, retryCount: Int, retryTimeout: Duration, currentRetryCounter: Int = 0): ArangoDatabase {
        val actualPort = portOverwrite ?: port
        try {
            log().info("Trying to connect to database $dbName on $host:$actualPort (retryCount=$currentRetryCounter)")
            return ArangoDatabase.create(host, actualPort, null, null, dbName)
        } catch (e: CompletionException) {
            if (e.cause is ArangoDBException) {
                if (currentRetryCounter >= retryCount) {
                    throw DBConnectionException()
                } else {
                    log().warn("Could not connect to database, retrying in ${retryTimeout.inWholeSeconds} seconds")
                    delay(retryTimeout)
                    return create(dbName, host, actualPort, retryCount, retryTimeout, currentRetryCounter + 1)
                }
            } else {
                throw e.cause ?: e
            }
        }
    }

    class DBConnectionException : Exception()

}