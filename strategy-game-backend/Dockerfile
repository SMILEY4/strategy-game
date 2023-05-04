FROM gradle:jdk17 as build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build -x test --no-daemon

FROM openjdk:17-jdk-buster
EXPOSE 8080
RUN mkdir /app

COPY docker-entrypoint.sh docker-entrypoint.sh
RUN ["chmod", "+x", "./docker-entrypoint.sh"]

COPY --from=build /home/gradle/src/build/libs/strategy-game-backend.jar /app/strategy-game.jar

ENTRYPOINT ["/bin/bash", "-c", "./docker-entrypoint.sh"]