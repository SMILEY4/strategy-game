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

    implementation(project(":strategy-game-engine"))
    implementation(project(":strategy-game-playerpov"))
    implementation(project(":strategy-game-common"))
    implementation(project(":strategy-game-common-data"))
    implementation(project(":strategy-game-common-arangodb"))

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")
    implementation("io.ktor:ktor-server-websockets:$versionKtor")
    implementation("io.ktor:ktor-server-auth:$versionKtor")

    val versionKtorSwaggerUi: String by project
    implementation("io.github.smiley4:ktor-swagger-ui:$versionKtorSwaggerUi")

    val versionJacksonModuleKotlin: String by project
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$versionJacksonModuleKotlin")

    val versionKotlinLogging: String by project
    implementation("io.github.microutils:kotlin-logging-jvm:$versionKotlinLogging")

    val versionKoin: String by project
    implementation("io.insert-koin:koin-core:$versionKoin")
    implementation("io.insert-koin:koin-ktor:$versionKoin")

    val versionArrow: String by project
    implementation("io.arrow-kt:arrow-core:$versionArrow")
    implementation("io.arrow-kt:arrow-fx-coroutines:$versionArrow")
    implementation("io.arrow-kt:arrow-fx-stm:$versionArrow")
}

kotlin {
    jvmToolchain(17)
}