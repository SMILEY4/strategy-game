package io.github.smiley4.strategygame.backend.app

import io.github.smiley4.strategygame.backend.app.testutils.TestUtilsFactory
import io.github.smiley4.strategygame.backend.common.persistence.DatabaseProvider
import io.kotest.core.config.AbstractProjectConfig
import org.slf4j.LoggerFactory
import org.testcontainers.containers.GenericContainer
import org.testcontainers.containers.output.Slf4jLogConsumer
import org.testcontainers.containers.wait.strategy.HttpWaitStrategy
import org.testcontainers.utility.DockerImageName
import java.time.Duration


class TestContainers : AbstractProjectConfig() {

    override suspend fun beforeProject() {
        ArangoDbContainer.start()
    }
}


internal object ArangoDbContainer {

    fun start(): GenericContainer<*> {
        val container = GenericContainer(DockerImageName.parse("arangodb:3.10.0"))
            .withEnv("ARANGO_NO_AUTH", "1")
            .withExposedPorts(8529)
            .waitingFor(HttpWaitStrategy().forPort(8529).withStartupTimeout(Duration.ofMinutes(5)))
            .withLogConsumer(Slf4jLogConsumer(LoggerFactory.getLogger(ArangoDbContainer::class.java)))
        container.start()
        val port = container.getMappedPort(8529)
        TestUtilsFactory.arangoDbDockerPort = port
        DatabaseProvider.portOverwrite = port
        return container
    }

}