import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

group = "de.ruegnerlukas"
version = "0.7.0"

plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
}

repositories {
    mavenLocal()
    mavenCentral()
    maven {
        url = uri("https://jitpack.io")
    }
}

dependencies {

    implementation(project(":strategy-game-common"))

    val versionKtor: String by project
    implementation("io.ktor:ktor-server-core-jvm:$versionKtor")

    val versionKtorSwaggerUi: String by project
    implementation("io.github.smiley4:ktor-swagger-ui:$versionKtorSwaggerUi")

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
