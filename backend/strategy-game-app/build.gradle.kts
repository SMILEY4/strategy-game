val projectGroupId: String by project
val projectVersion: String by project
group = projectGroupId
version = projectVersion

application {
    mainClass.set("io.github.smiley4.strategygame.backend.app.ApplicationKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("env") ?: "false"}")
}

plugins {
    application
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("com.gradleup.shadow")
}

repositories {
    mavenCentral()
}

dependencies {

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-arangodb"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-pathfinding"))
    implementation(project(":strategy-game-playerpov"))
    implementation(project(":strategy-game-users"))
    implementation(project(":strategy-game-worldgen"))
    implementation(project(":strategy-game-sessions"))

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-netty-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-websockets:${versionKtor}")
    implementation("io.ktor:ktor-server-call-logging:${versionKtor}")
    implementation("io.ktor:ktor-server-metrics:$versionKtor")
    implementation("io.ktor:ktor-server-metrics-micrometer:$versionKtor")
    implementation("io.ktor:ktor-server-content-negotiation:${versionKtor}")
    implementation("io.ktor:ktor-serialization-kotlinx-json:${versionKtor}")
    implementation("io.ktor:ktor-server-auth:${versionKtor}")
    implementation("io.ktor:ktor-server-auth-jwt:${versionKtor}")
    implementation("io.ktor:ktor-server-cors:${versionKtor}")
    implementation("io.ktor:ktor-server-status-pages:${versionKtor}")
    testImplementation("io.ktor:ktor-client-core:${versionKtor}")
    testImplementation("io.ktor:ktor-client-cio:${versionKtor}")
    testImplementation("io.ktor:ktor-client-content-negotiation:${versionKtor}")
    testImplementation("io.ktor:ktor-serialization-jackson:${versionKtor}")

    val versionKtorPlus: String by project
    implementation("io.github.smiley4:ktor-plus:${versionKtorPlus}")

    // OpenAPI
    val versionOpenApiTools = "5.4.0"
    implementation("io.github.smiley4:ktor-openapi:${versionOpenApiTools}")
    implementation("io.github.smiley4:ktor-swagger-ui:${versionOpenApiTools}")
    implementation("io.github.smiley4:ktor-redoc:${versionOpenApiTools}")
    // schema-kenerator
    val schemaKeneratorVersion = "2.5.0"
    implementation("io.github.smiley4:schema-kenerator-core:${schemaKeneratorVersion}")
    implementation("io.github.smiley4:schema-kenerator-serialization:${schemaKeneratorVersion}")
    implementation("io.github.smiley4:schema-kenerator-swagger:${schemaKeneratorVersion}")


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
    implementation("io.insert-koin:koin-ktor3:$versionKoin")
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
    jvmToolchain(21)
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