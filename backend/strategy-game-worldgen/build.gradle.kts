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

    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))

    val versionKotlinLogging: String by project
    val versionKoin: String by project

    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")
    implementation("io.insert-koin:koin-core:$versionKoin")
}

kotlin {
    jvmToolchain(17)
}