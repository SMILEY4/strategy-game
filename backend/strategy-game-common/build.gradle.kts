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

    val versionJacksonModuleKotlin: String by project
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$versionJacksonModuleKotlin")

    val versionTypesafeConfig: String by project
    implementation("com.typesafe:config:$versionTypesafeConfig")

    val versionMicrometerPrometheus: String by project
    implementation("io.micrometer:micrometer-registry-prometheus:$versionMicrometerPrometheus")
    implementation("org.hdrhistogram:HdrHistogram:2.1.12")

    val versionKotlinLogging: String by project
    val versionLogback: String by project
    val versionSlf4jCoroutines: String by project
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")
    implementation("ch.qos.logback:logback-classic:$versionLogback")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-slf4j:$versionSlf4jCoroutines")

    val versionKoson: String by project
    implementation("com.lectra:koson:$versionKoson")

}

kotlin {
    jvmToolchain(17)
}