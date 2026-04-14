application {
    mainClass.set("io.github.smiley4.strategygame.backend.app.ApplicationKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("ev") ?: "false"}")
}

tasks {
    shadowJar {
        isZip64 = true
        archiveFileName.set("${project.name}.jar")
        manifest {
            attributes(Pair("Main-Class", "io.ktor.server.netty.EngineMain"))
        }
    }
}

plugins {
    application
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.shadow)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-arangodb"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-gateway"))
    implementation(project(":strategy-game-pathfinding"))
    implementation(project(":strategy-game-playerpov"))
    implementation(project(":strategy-game-users"))
    implementation(project(":strategy-game-worldgen"))
    implementation(project(":strategy-game-sessions"))

    // Ktor
    implementation(libs.ktor.server.core.jvm)
    implementation(libs.ktor.server.netty.jvm)
    implementation(libs.ktor.server.metrics)
    implementation(libs.ktor.server.metrics.micrometer)
    testImplementation(libs.ktor.client.core)
    testImplementation(libs.ktor.client.cio)
    testImplementation(libs.ktor.client.contentnegotiation)
    testImplementation(libs.ktor.client.serialization.jackson)

    // Misc
    implementation(libs.micrometer.registry.prometheus)

    // Logging
    implementation(libs.logback.classic)
    implementation(libs.kotlin.logging.jvm)
    implementation(libs.logstash.logback.encoder)
    implementation(libs.kotlinx.coroutines.slf4j)
    implementation(libs.janino)

    // Koin
    implementation(libs.koin.core)
    implementation(libs.koin.ktor3)
    testImplementation(libs.koin.test) {
        exclude("org.jetbrains.kotlin", "kotlin-test-junit")
    }
    testImplementation(libs.koin.test.junit5) {
        exclude("org.jetbrains.kotlin", "kotlin-test-junit")
    }

    // Test
    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.kotest.extensions.testcontainers)
    testImplementation(libs.mockk)
}