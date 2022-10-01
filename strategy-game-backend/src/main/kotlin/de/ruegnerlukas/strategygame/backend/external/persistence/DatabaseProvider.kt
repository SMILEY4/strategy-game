package de.ruegnerlukas.strategygame.backend.external.persistence

import com.arangodb.ArangoDBException
import de.ruegnerlukas.strategygame.backend.config.DbConfig
import de.ruegnerlukas.strategygame.backend.shared.Logging
import de.ruegnerlukas.strategygame.backend.external.persistence.arango.ArangoDatabase
import kotlinx.coroutines.delay
import java.util.concurrent.CompletionException
import kotlin.time.Duration.Companion.seconds

object DatabaseProvider : Logging {

    suspend fun create(config: DbConfig, retryCount: Int = 0): ArangoDatabase {
        try {
            log().info("Trying to connect to database ${config.name} on ${config.host}:${config.port} (retryCount=$retryCount)")
            return ArangoDatabase.create(config.host, config.port, null, null, config.name)
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