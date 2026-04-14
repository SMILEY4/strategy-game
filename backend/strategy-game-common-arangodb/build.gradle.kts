plugins {
    alias(libs.plugins.kotlin.jvm)
    alias(libs.plugins.dependencycheck)
    alias(libs.plugins.versions)
    alias(libs.plugins.detekt)
}

dependencies {

    implementation(libs.arangodb.java.driver)
    implementation(libs.arangodb.jackson.dataformat.velocypack)

    implementation(libs.jackson.kotlin)

    implementation(libs.kotlinx.coroutines.core)

    implementation(libs.kotlin.logging.jvm)

    testImplementation(libs.kotest.runner.junit5)
    testImplementation(libs.kotest.assertions.core)
    testImplementation(libs.kotest.property)
    testImplementation(libs.kotest.extensions.testcontainers)
    testImplementation(libs.mockk)
}