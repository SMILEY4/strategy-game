rootProject.name = "strategy-game-backend"

include("strategy-game-app")
include("strategy-game-common")
include("strategy-game-common-data")
include("strategy-game-common-arangodb")
include("strategy-game-ecosim")
include("strategy-game-engine")
include("strategy-game-pathfinding")
include("strategy-game-users")
include("strategy-game-worldgen")
include("strategy-game-worlds")

pluginManagement {
    repositories {
        mavenCentral()
        gradlePluginPortal()
    }
}