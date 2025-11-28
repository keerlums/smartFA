package com.smartfa.hub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 智能中枢服务启动类
 * 
 * @author SmartFA Team
 * @version 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.smartfa.hub", "com.smartfa.common"})
@EnableKafka
@EnableAsync
@EnableScheduling
public class IntelligentHubApplication {

    public static void main(String[] args) {
        SpringApplication.run(IntelligentHubApplication.class, args);
    }
}