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
    implementation(project(":strategy-game-users"))
    implementation(project(":strategy-game-worlds"))
    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))

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
    implementation("org.hdrhistogram:HdrHistogram:2.1.12")

    val versionKotlinLogging: String by project
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

    val versionKoin: String by project
    implementation("io.insert-koin:koin-core:$versionKoin")
    implementation("io.insert-koin:koin-ktor:$versionKoin")

}

kotlin {
    jvmToolchain(17)
}
