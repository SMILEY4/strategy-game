import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

val versionKtor: String by project
val versionKotlin: String by project
val versionLogback: String by project

group = "de.ruegnerlukas"
version = "0.1"

application {
    mainClass.set("de.ruegnerlukas.strategygame.backend")
    val isDev: Boolean = project.ext.has("development")
    applicationDefaultJvmArgs = listOf("-Dio.ktor.development=$isDev")
}

plugins {
    application
    kotlin("jvm") version "1.5.31"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-netty-jvm:$versionKtor")
    implementation("ch.qos.logback:logback-classic:$versionLogback")
    implementation("io.ktor:ktor-server-websockets:$versionKtor")
    testImplementation("io.ktor:ktor-server-tests-jvm:$versionKtor")
    testImplementation("org.jetbrains.kotlin:kotlin-test-junit:$versionKotlin")
}

tasks.test {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "11"
}