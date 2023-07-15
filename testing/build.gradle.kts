import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "de.ruegnerlukas"
version = "0.5.0"

application {
    mainClass.set("de.ruegnerlukas.strategygame.testing.ApplicationKt")
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
}

dependencies {

    val versionKtor: String by project
    implementation("io.ktor:ktor-client-core:$versionKtor")
    implementation("io.ktor:ktor-client-cio:$versionKtor")
    implementation("io.ktor:ktor-client-content-negotiation:$versionKtor")
    implementation("io.ktor:ktor-serialization-jackson:$versionKtor")

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
    implementation("io.kotest:kotest-assertions-core:$versionKotest")
    implementation("io.kotest.extensions:kotest-assertions-ktor:2.0.0")
    testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
    testImplementation("io.kotest:kotest-property:$versionKotest")
    testImplementation("io.kotest.extensions:kotest-assertions-ktor:$versionKotestExtensionKtor")
    testImplementation("io.kotest.extensions:kotest-extensions-testcontainers:$versionKotestExtensionTestContainers")

    val versionMockk: String by project
    testImplementation("io.mockk:mockk:${versionMockk}")

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
