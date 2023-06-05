package de.ruegnerlukas.strategygame.backend.common.persistence

import com.arangodb.ArangoDBException
import de.ruegnerlukas.strategygame.backend.app.DatabaseConfig
import de.ruegnerlukas.strategygame.backend.common.Logging
import de.ruegnerlukas.strategygame.backend.common.persistence.arango.ArangoDatabase
import kotlinx.coroutines.delay
import java.util.concurrent.CompletionException
import kotlin.time.Duration.Companion.seconds

object DatabaseProvider : Logging {

    var portOverwrite: Int? = null

    suspend fun create(config: DatabaseConfig, retryCount: Int = 0): ArangoDatabase {
        val port = portOverwrite ?: config.port
        try {
            log().info("Trying to connect to database ${config.name} on ${config.host}:${port} (retryCount=$retryCount)")
            return ArangoDatabase.create(config.host, port, null, null, config.name)
        } catch (e: CompletionException) {
            if (e.cause is ArangoDBException) {
                if (retryCount >= config.retryCount) {
                    throw DBConnectionException()
                } else {
                    log().warn("Could not connect to database, retrying in ${config.retryTimeout} seconds")
                    delay(config.retryTimeout.seconds)
                    return create(config, retryCount + 1)
                }
            } else {
                throw e.cause ?: e
            }
        }
    }

    class DBConnectionException : Exception()

}