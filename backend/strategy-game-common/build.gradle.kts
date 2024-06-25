val projectGroupId: String by project
val projectVersion: String by project
group = projectGroupId
version = projectVersion

plugins {
    kotlin("jvm")
}

repositories {
    mavenCentral()
}

dependencies {

    implementation(project(":strategy-game-common-data"))

    val versionMicrometerPrometheus: String by project
    implementation("io.micrometer:micrometer-registry-prometheus:$versionMicrometerPrometheus")
    implementation("org.hdrhistogram:HdrHistogram:2.1.12")

    val versionKotlinLogging: String by project
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

    val versionKoson: String by project
    implementation("com.lectra:koson:$versionKoson")

}

kotlin {
    jvmToolchain(17)
}