package com.smartfa.workbench;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 多模态工作台应用启动类
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
@SpringBootApplication(scanBasePackages = {"com.smartfa"})
@EnableFeignClients
@EnableKafka
@EnableAsync
@EnableScheduling
public class MultimodalWorkbenchApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultimodalWorkbenchApplication.class, args);
    }
}