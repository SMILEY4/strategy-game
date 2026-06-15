plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.detekt)
    alias(libs.plugins.versions)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.kotest)
    alias(libs.plugins.serialization)
}

dependencies {

    implementation(libs.arangodb.javadriver)
    implementation(libs.arangodb.jacksondataformatvelocypack)
    implementation(libs.jackson.kotlin)

    implementation(libs.kotlinx.coroutines)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.ktor.server.core)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.mockk)
}
