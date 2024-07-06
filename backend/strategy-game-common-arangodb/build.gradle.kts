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
    val versionArangoDb: String by project
    val versionJacksonDataformatVelocypack: String by project
    implementation("com.arangodb:arangodb-java-driver:$versionArangoDb")
    implementation("com.arangodb:jackson-dataformat-velocypack:$versionJacksonDataformatVelocypack")

    val versionJacksonModuleKotlin: String by project
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$versionJacksonModuleKotlin")

    val versionKotlinxCoroutines: String by project
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:$versionKotlinxCoroutines")

    val versionKotlinLogging: String by project
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

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