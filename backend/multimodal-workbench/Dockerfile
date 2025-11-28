# 构建阶段
FROM maven:3.9.6-amazoncorretto-17 AS build
WORKDIR /app

# 复制POM文件
COPY ../pom.xml .
COPY pom.xml multimodal-workbench/pom.xml

# 下载依赖
RUN mvn dependency:go-offline -pl multimodal-workbench

# 复制源代码
COPY src multimodal-workbench/src

# 构建应用
RUN mvn clean package -pl multimodal-workbench -DskipTests

# 运行阶段
FROM amazoncorretto:17-alpine-jdk
WORKDIR /app

# 复制构建产物
COPY --from=build /app/multimodal-workbench/target/*.jar app.jar

# 创建非root用户
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]