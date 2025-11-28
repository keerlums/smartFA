# 运行阶段
FROM amazoncorretto:17-alpine-jdk
WORKDIR /app

# 复制构建产物（需要在构建时通过--build-arg传递）
ARG JAR_FILE
COPY ${JAR_FILE} app.jar

# 创建非root用户
RUN addgroup -S spring && adduser -S spring -G spring
USER spring

# 暴露端口
EXPOSE 8081

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]