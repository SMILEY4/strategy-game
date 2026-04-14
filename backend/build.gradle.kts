import io.gitlab.arturbosch.detekt.Detekt
import org.gradle.kotlin.dsl.configure
import org.gradle.kotlin.dsl.withType
import org.jetbrains.kotlin.gradle.dsl.JvmTarget
import org.jetbrains.kotlin.gradle.dsl.KotlinJvmProjectExtension

plugins {
    alias(libs.plugins.kotlin.jvm) apply false
    alias(libs.plugins.kotlin.serialization) apply false
    alias(libs.plugins.detekt) apply false
    alias(libs.plugins.dependencycheck) apply false
    alias(libs.plugins.shadow) apply false
    alias(libs.plugins.versions) apply false
}

subprojects {

    repositories {
        mavenCentral()
    }

    val projectGroupId: String by project
    val projectVersion: String by project
    group = projectGroupId
    version = projectVersion

    tasks.withType<Detekt>().configureEach {
        ignoreFailures = false
        buildUponDefaultConfig = true
        allRules = false
        config.setFrom("$rootDir/detekt/detekt.yml")
        reports {
            html.required.set(true)
            md.required.set(true)
            xml.required.set(false)
            txt.required.set(false)
            sarif.required.set(false)
        }
    }

    tasks.withType<Test>().configureEach {
        useJUnitPlatform()
    }

    plugins.withId("org.jetbrains.kotlin.jvm") {

        val versionJvmCompile = libs.versions.jvm.compile.get().toInt()
        val versionJvmTarget = libs.versions.jvm.target.get()

        // Kotlin Toolchain
        extensions.configure<KotlinJvmProjectExtension> {
            jvmToolchain(versionJvmCompile)
            compilerOptions {
                jvmTarget.set(JvmTarget.fromTarget(versionJvmTarget))
            }
        }

        // Java Toolchain
        extensions.configure<JavaPluginExtension> {
            toolchain {
                languageVersion.set(JavaLanguageVersion.of(versionJvmCompile))
            }
        }

        // JVM Compatibility
        tasks.withType<JavaCompile>().configureEach {
            sourceCompatibility = versionJvmTarget
            targetCompatibility = versionJvmTarget
        }
    }

}