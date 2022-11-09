import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "de.ruegnerlukas"
version = "1"

plugins {
    kotlin("jvm") version "1.7.20"
}

repositories {
    mavenCentral()
}

dependencies {

    val versionJackson = "2.13.4"
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin:$versionJackson")

    val versionMatplotlib4j = "0.5.0"
    implementation("com.github.sh0nk:matplotlib4j:$versionMatplotlib4j")

    val versionKotest = "5.4.2"
    testImplementation("io.kotest:kotest-runner-junit5:$versionKotest")
    testImplementation("io.kotest:kotest-assertions-core:$versionKotest")
    testImplementation("io.kotest:kotest-property:$versionKotest")

    val versionKotlinTest = "1.5.31"
    testImplementation("org.jetbrains.kotlin:kotlin-test:$versionKotlinTest")
}

tasks.withType<Test>().configureEach {
    useJUnitPlatform()
}

tasks.withType<KotlinCompile> {
    kotlinOptions.jvmTarget = "17"
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}