val projectGroupId: String by project
val projectVersion: String by project
group = projectGroupId
version = projectVersion

application {
    mainClass.set("io.github.smiley4.strategygame.backend.app.ApplicationKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("ev") ?: "false"}")
}

plugins {
    application
    kotlin("jvm")
    id("com.github.johnrengelman.shadow")
}

repositories {
    mavenCentral()
}

dependencies {

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-arangodb"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-ecosim"))
    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-gateway"))
    implementation(project(":strategy-game-pathfinding"))
    implementation(project(":strategy-game-playerpov"))
    implementation(project(":strategy-game-users"))
    implementation(project(":strategy-game-worldgen"))
    implementation(project(":strategy-game-worlds"))

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-netty-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-metrics:$versionKtor")
    implementation("io.ktor:ktor-server-metrics-micrometer:$versionKtor")

    val versionMicrometerPrometheus: String by project
    implementation("io.micrometer:micrometer-registry-prometheus:$versionMicrometerPrometheus")

    val versionLogback: String by project
    val versionKotlinLogging: String by project
    val versionLogstashLogbackEncoder: String by project
    val versionSlf4jCoroutines: String by project
    val versionJanino: String by project
    implementation("ch.qos.logback:logback-classic:$versionLogback")
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")
    implementation("net.logstash.logback:logstash-logback-encoder:$versionLogstashLogbackEncoder")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:$versionSlf4jCoroutines")
    implementation("org.codehaus.janino:janino:$versionJanino")

    val versionKoin: String by project
    implementation("io.insert-koin:koin-core:$versionKoin")
    implementation("io.insert-koin:koin-ktor:$versionKoin")
    testImplementation("io.insert-koin:koin-test:$versionKoin") {
        exclude("org.jetbrains.kotlin", "kotlin-test-junit")
    }
    testImplementation("io.insert-koin:koin-test-junit5:$versionKoin") {
        exclude("org.jetbrains.kotlin", "kotlin-test-junit")
    }

    val versionKotest: String by project
    val versionKotestExtensionTestContainers: String by project
    testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
    testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
    testImplementation("io.kotest.extensions:kotest-extensions-testcontainers:$versionKotestExtensionTestContainers")

    val versionMockk: String by project
    testImplementation("io.mockk:mockk:${versionMockk}")

}

kotlin {
    jvmToolchain(17)
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