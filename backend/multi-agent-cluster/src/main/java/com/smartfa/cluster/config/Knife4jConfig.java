package com.smartfa.cluster.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.customizers.OpenApiCustomizer;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;

@Configuration
public class Knife4jConfig {
    @Bean
    public GroupedOpenApi api() {
        return GroupedOpenApi.builder()
                .group("multi-agent-cluster")
                .pathsToMatch("/api/**")
                .addOpenApiCustomizer(openApi -> openApi.info(new Info()
                        .title("多智能体集群 API 文档")
                        .description("SmartFA 多智能体集群服务 API 文档")
                        .version("1.0.0")
                        .contact(new Contact().name("SmartFA Team").email("smartfa@example.com"))))
                .build();
    }
}
