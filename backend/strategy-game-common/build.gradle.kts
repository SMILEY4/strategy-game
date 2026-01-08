val projectGroupId: String by project
val projectVersion: String by project
group = projectGroupId
version = projectVersion

plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
}

repositories {
    mavenCentral()
}

dependencies {

    implementation(project(":strategy-game-common-data"))

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-websockets:$versionKtor")
    implementation("io.ktor:ktor-server-auth:${versionKtor}")
    implementation("io.ktor:ktor-server-auth-jwt:${versionKtor}")

    val versionKtorPlus: String by project
    implementation("io.github.smiley4:ktor-plus:${versionKtorPlus}")

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
    jvmToolchain(21)
}