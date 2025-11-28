package com.smartfa.cluster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 多智能体集群服务启动类
 * 
 * @author SmartFA Team
 * @version 1.0.0
 */
@SpringBootApplication(scanBasePackages = {"com.smartfa.cluster", "com.smartfa.common"})
@EnableKafka
@EnableAsync
@EnableScheduling
public class MultiAgentClusterApplication {

    public static void main(String[] args) {
        SpringApplication.run(MultiAgentClusterApplication.class, args);
    }
}