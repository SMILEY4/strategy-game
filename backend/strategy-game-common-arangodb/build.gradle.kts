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

}

kotlin {
    jvmToolchain(17)
}