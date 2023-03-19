FROM gradle:jdk17 as build
COPY --chown=gradle:gradle . /home/gradle/src
WORKDIR /home/gradle/src
RUN gradle build -x test --no-daemon

FROM openjdk:17-jdk-buster
EXPOSE 8080
RUN mkdir /app
COPY --from=build /home/gradle/src/build/libs/strategy-game-backend.jar /app/strategy-game.jar
ENTRYPOINT ["java","-jar","/app/strategy-game.jar", "prod"]