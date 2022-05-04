import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val versionKtor: String by project
val versionKotlin: String by project
val versionLogback: String by project
val versionKotlinLogging: String by project
val versionKotest: String by project
val versionKotestExtensions: String by project
val versionKotlinTest: String by project

group = "de.ruegnerlukas"
version = "0.1"

application {
	mainClass.set("de.ruegnerlukas.strategygame.backend.ApplicationKt")
	applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("ev") ?: "false"}")
}

plugins {
	application
	kotlin("jvm") version "1.5.31"
	kotlin("plugin.serialization").version("1.6.20")
	id("com.github.johnrengelman.shadow") version "7.0.0"
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
	implementation("io.ktor:ktor-server-netty-jvm:$versionKtor")
	implementation("io.ktor:ktor-server-websockets:$versionKtor")
	implementation("io.ktor:ktor-server-call-logging:$versionKtor")
	implementation("io.ktor:ktor-server-content-negotiation:$versionKtor")
	implementation("io.ktor:ktor-server-cors:$versionKtor")
	implementation("io.ktor:ktor-serialization-kotlinx-json:$versionKtor")
	implementation("io.ktor:ktor-server-auth:$versionKtor")
	implementation("io.ktor:ktor-server-auth-jwt:$versionKtor")

	implementation("ch.qos.logback:logback-classic:$versionLogback")
	implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

	implementation("com.amazonaws:aws-java-sdk:1.12.208")
	implementation("com.amazonaws:aws-java-sdk-core:1.12.208")
	implementation("com.amazonaws:aws-java-sdk-cognitoidp:1.12.208")


	testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
	testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
	testImplementation("io.kotest:kotest-property:$versionKotest")
	testImplementation("io.kotest.extensions:kotest-assertions-ktor:$versionKotestExtensions")
	testImplementation("io.ktor:ktor-server-test-host:$versionKtor")
	testImplementation("org.jetbrains.kotlin:kotlin-test:$versionKotlinTest")
}

tasks.withType<Test>().configureEach {
	useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
	kotlinOptions.jvmTarget = "11"
}

tasks.shadowJar {
	manifest {
		attributes(Pair("Main-Class", "io.ktor.server.netty.EngineMain"))
	}
}