package io.github.smiley4.strategygame.shared.arangodb

import com.arangodb.ArangoDBException
import io.github.smiley4.strategygame.shared.arangodb.ArangoDatabase
import kotlinx.coroutines.delay
import java.util.concurrent.CompletionException
import kotlin.time.Duration

object DatabaseProvider {

    data class Config(
        val host: String,
        val port: Int,
        val username: String?,
        val password: String?,
        val name: String,
        val retryCount: Int,
        val retryTimeout: Duration
    )

    suspend fun create(config: Config, currentRetryCounter: Int = 0): ArangoDatabase {
        try {
//            logger.info("Trying to connect to database ${config.name} on ${config.host}:${config.port} (retryCount=$currentRetryCounter)")
            return ArangoDatabase.create(config.host, config.port, config.username, config.password, config.name)
        } catch (e: CompletionException) {
            if (e.cause is ArangoDBException) {
                if (currentRetryCounter >= config.retryCount) {
                    throw DBConnectionException()
                } else {
//                    logger.warn("Could not connect to database, retrying in ${config.retryTimeout.inWholeSeconds} seconds")
                    delay(config.retryTimeout)
                    return create(config, currentRetryCounter + 1)
                }
            } else {
                throw e.cause ?: e
            }
        }
    }

    class DBConnectionException : Exception()

}