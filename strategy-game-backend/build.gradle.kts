import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "de.ruegnerlukas"
version = "0.5.0"

application {
    mainClass.set("de.ruegnerlukas.strategygame.backend.ApplicationKt")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("ev") ?: "false"}")
}

plugins {
    application
    val versionKotlin = "1.7.21"
    kotlin("jvm") version versionKotlin
    kotlin("plugin.serialization").version(versionKotlin)
    id("com.github.johnrengelman.shadow") version "7.0.0"
}

repositories {
    mavenLocal()
    mavenCentral()
    maven {
        url = uri("https://jitpack.io")
    }
}

dependencies {

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-netty-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-websockets:$versionKtor")
    implementation("io.ktor:ktor-server-call-logging:$versionKtor")
    implementation("io.ktor:ktor-server-cors:$versionKtor")
    implementation("io.ktor:ktor-server-content-negotiation:$versionKtor")
    implementation("io.ktor:ktor-serialization-jackson:$versionKtor")
    implementation("io.ktor:ktor-server-auth:$versionKtor")
    implementation("io.ktor:ktor-server-auth-jwt:$versionKtor")
    implementation("io.ktor:ktor-server-status-pages:$versionKtor")
    implementation("io.ktor:ktor-server-metrics:$versionKtor")
    implementation("io.ktor:ktor-server-metrics-micrometer:$versionKtor")
    implementation("io.ktor:ktor-server-html-builder:$versionKtor")
    testImplementation("io.ktor:ktor-server-test-host:$versionKtor")
    testImplementation("io.ktor:ktor-client-content-negotiation:$versionKtor")

    val versionKtorSwaggerUi: String by project
    implementation("io.github.smiley4:ktor-swagger-ui:$versionKtorSwaggerUi")

    val versionKtorWebsocketsExtended: String by project
    implementation("io.github.smiley4:ktor-websockets-extended:$versionKtorWebsocketsExtended")

    val versionMicrometerPrometheus: String by project
    implementation("io.micrometer:micrometer-registry-prometheus:$versionMicrometerPrometheus")


    val versionAwsSdk: String by project
    implementation("com.amazonaws:aws-java-sdk:$versionAwsSdk")
    implementation("com.amazonaws:aws-java-sdk-core:$versionAwsSdk")
    implementation("com.amazonaws:aws-java-sdk-cognitoidp:$versionAwsSdk")

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

    val versionArangoDb: String by project
    val versionJacksonDataformatVelocypack: String by project
    implementation("com.arangodb:arangodb-java-driver:$versionArangoDb")
    implementation("com.arangodb:jackson-dataformat-velocypack:$versionJacksonDataformatVelocypack")

    val versionArrow: String by project
    implementation("io.arrow-kt:arrow-core:$versionArrow")
    implementation("io.arrow-kt:arrow-fx-coroutines:$versionArrow")
    implementation("io.arrow-kt:arrow-fx-stm:$versionArrow")

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
    val versionKotestExtensionKtor: String by project
    val versionKotestExtensionTestContainers: String by project
    testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
    testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
    testImplementation("io.kotest:kotest-property:$versionKotest")
    testImplementation("io.kotest.extensions:kotest-assertions-ktor:$versionKotestExtensionKtor")
    testImplementation("io.kotest.extensions:kotest-extensions-testcontainers:$versionKotestExtensionTestContainers")

    val versionKotlinTest: String by project
    testImplementation("org.jetbrains.kotlin:kotlin-test:$versionKotlinTest")


}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "17"
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

tasks.shadowJar {
    isZip64 = true
    archiveFileName.set("${project.name}.jar")
    manifest {
        attributes(Pair("Main-Class", "io.ktor.server.netty.EngineMain"))
    }
}
