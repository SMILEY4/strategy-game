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
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

    val versionKoin: String by project
    implementation("io.insert-koin:koin-core:$versionKoin")

    val versionKotest: String by project
    val versionKotestExtensionTestContainers: String by project
    testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
    testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
    testImplementation("io.kotest:kotest-property:$versionKotest")
    testImplementation("io.kotest.extensions:kotest-extensions-testcontainers:$versionKotestExtensionTestContainers")

    val versionMockk: String by project
    testImplementation("io.mockk:mockk:${versionMockk}")
}

kotlin {
    jvmToolchain(17)
}