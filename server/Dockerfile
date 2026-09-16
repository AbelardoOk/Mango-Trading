# server/Dockerfile — prod multi-stage (Java 17, Maven wrapper)
FROM eclipse-temurin:17-jdk AS builder
WORKDIR /app
COPY .mvn .mvn
COPY mvnw mvnw.cmd pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B
COPY src src
RUN ./mvnw package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=10 --start-period=40s \
  CMD curl -f http://localhost:8080/error || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
