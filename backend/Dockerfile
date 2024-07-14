FROM gradle:jdk17 AS build

RUN apt-get update
RUN apt-get install tree

WORKDIR /home/gradle/src

COPY /gradlew /home/gradle/src/gradlew
COPY /gradle /home/gradle/src/gradle

RUN tree -a

RUN ./gradlew --version

COPY /build.gradle.kts /home/gradle/src/build.gradle.kts
COPY /gradle.properties /home/gradle/src/gradle.properties
COPY /settings.gradle.kts /home/gradle/src/settings.gradle.kts
RUN ./gradlew dependencies > /dev/null

COPY /strategy-game-app/build.gradle.kts  /home/gradle/src/strategy-game-app/build.gradle.kts
RUN ./gradlew strategy-game-app:dependencies > /dev/null

COPY /strategy-game-common-arangodb/build.gradle.kts  /home/gradle/src/strategy-game-arangodb/build.gradle.kts
RUN ./gradlew strategy-game-common-arangodb:dependencies > /dev/null

COPY /strategy-game-common-data/build.gradle.kts  /home/gradle/src/strategy-game-common-data/build.gradle.kts
RUN ./gradlew strategy-game-common-data:dependencies > /dev/null

COPY /strategy-game-ecosim/build.gradle.kts  /home/gradle/src/strategy-game-ecosim/build.gradle.kts
RUN ./gradlew strategy-game-ecosim:dependencies > /dev/null

COPY /strategy-game-engine/build.gradle.kts  /home/gradle/src/strategy-game-engine/build.gradle.kts
RUN ./gradlew strategy-game-engine:dependencies > /dev/null

COPY /strategy-game-gateway/build.gradle.kts  /home/gradle/src/strategy-game-gateway/build.gradle.kts
RUN ./gradlew strategy-game-gateway:dependencies > /dev/null

COPY /strategy-game-pathfinding/build.gradle.kts  /home/gradle/src/strategy-game-pathfinding/build.gradle.kts
RUN ./gradlew strategy-game-pathfinding:dependencies > /dev/null

COPY /strategy-game-playerpov/build.gradle.kts  /home/gradle/src/strategy-game-playerpov/build.gradle.kts
RUN ./gradlew strategy-game-playerpov:dependencies > /dev/null

COPY /strategy-game-users/build.gradle.kts  /home/gradle/src/strategy-game-users/build.gradle.kts
RUN ./gradlew strategy-game-users:dependencies > /dev/null

COPY /strategy-game-worldgen/build.gradle.kts  /home/gradle/src/strategy-game-worldgen/build.gradle.kts
RUN ./gradlew strategy-game-worldgen:dependencies > /dev/null

COPY /strategy-game-worlds/build.gradle.kts  /home/gradle/src/strategy-game-worlds/build.gradle.kts
RUN ./gradlew strategy-game-worlds:dependencies > /dev/null

RUN ./gradlew build -x test --parallel



FROM openjdk:17-jdk-buster
EXPOSE 8080
RUN mkdir /app
COPY docker-entrypoint.sh docker-entrypoint.sh
COPY --from=build /home/gradle/src/strategy-game-app/build/libs/strategy-game-app.jar /app/strategy-game.jar
RUN ["chmod", "+x", "./docker-entrypoint.sh"]
ENTRYPOINT ["/bin/bash", "-c", "./docker-entrypoint.sh"]