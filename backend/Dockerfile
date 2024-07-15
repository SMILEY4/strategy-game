FROM eclipse-temurin:17 AS build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN ./gradlew --version
RUN ./gradlew build -x test --parallel --no-daemon --scan -Dorg.gradle.jvmargs=-Xmx2g

FROM eclipse-temurin:17
EXPOSE 8080
RUN mkdir /app
COPY docker-entrypoint.sh docker-entrypoint.sh
COPY --from=build /home/gradle/src/strategy-game-app/build/libs/strategy-game-app.jar /app/strategy-game.jar
RUN ["chmod", "+x", "./docker-entrypoint.sh"]
ENTRYPOINT ["/bin/bash", "-c", "./docker-entrypoint.sh"]