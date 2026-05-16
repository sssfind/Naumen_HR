# syntax=docker/dockerfile:1

FROM maven:3.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Один mirror → Maven Central; без каскада repo.gradle / redshift / flyway-github
COPY <<'EOF' /root/.m2/settings.xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.2.0 https://maven.apache.org/xsd/settings-1.2.0.xsd">
  <mirrors>
    <mirror>
      <id>central-mirror</id>
      <name>Maven Central</name>
      <url>https://repo.maven.apache.org/maven2</url>
      <mirrorOf>*</mirrorOf>
    </mirror>
  </mirrors>
</settings>
EOF

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B dependency:resolve -DskipTests

COPY src ./src
RUN --mount=type=cache,target=/root/.m2/repository \
    mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN apk add --no-cache wget

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
