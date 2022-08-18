import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val versionKtor: String by project
val versionKotlin: String by project
val versionLogback: String by project
val versionKotlinLogging: String by project
val versionAwsSdk: String by project
val versionKotest: String by project
val versionKotestExtensions: String by project
val versionKotlinTest: String by project
val versionArrow: String by project
val versionArangoDb: String by project
val versionJacksonDataformatVelocypack: String by project

group = "de.ruegnerlukas"
version = "0.2.0"

application {
	mainClass.set("de.ruegnerlukas.strategygame.backend.ApplicationKt")
	applicationDefaultJvmArgs = listOf("-Dio.ktor.development=${System.getProperty("ev") ?: "false"}")
}

plugins {
	application
	kotlin("jvm") version "1.6.21"
	kotlin("plugin.serialization").version("1.6.20")
	id("com.github.johnrengelman.shadow") version "7.0.0"
}

repositories {
	mavenLocal()
	mavenCentral()
}

dependencies {
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
	implementation("io.ktor:ktor-server-webjars:$versionKtor")
	implementation("org.webjars:swagger-ui:4.13.2")
	implementation("io.swagger.parser.v3:swagger-parser:2.1.1")

	implementation("com.amazonaws:aws-java-sdk:$versionAwsSdk")
	implementation("com.amazonaws:aws-java-sdk-core:$versionAwsSdk")
	implementation("com.amazonaws:aws-java-sdk-cognitoidp:$versionAwsSdk")

	implementation("ch.qos.logback:logback-classic:$versionLogback")
	implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

	implementation("com.arangodb:arangodb-java-driver:$versionArangoDb")
	implementation("com.arangodb:jackson-dataformat-velocypack:$versionJacksonDataformatVelocypack")

	implementation("io.arrow-kt:arrow-core:$versionArrow")
	implementation("io.arrow-kt:arrow-fx-coroutines:$versionArrow")
	implementation("io.arrow-kt:arrow-fx-stm:$versionArrow")

	testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
	testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
	testImplementation("io.kotest:kotest-property:$versionKotest")
	testImplementation("io.kotest.extensions:kotest-assertions-ktor:$versionKotestExtensions")
	testImplementation("io.ktor:ktor-server-test-host:$versionKtor")
	testImplementation("io.ktor:ktor-client-content-negotiation:$versionKtor")
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
