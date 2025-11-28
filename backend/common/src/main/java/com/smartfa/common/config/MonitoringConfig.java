package com.smartfa.common.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.micrometer.prometheus.PrometheusConfig;
import io.micrometer.prometheus.PrometheusMeterRegistry;
import org.springframework.boot.actuate.autoconfigure.metrics.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.context.annotation.Profile;

/**
 * 监控配置类
 */
@Configuration
@EnableAspectJAutoProxy
@Profile({ "prod", "monitoring" })
public class MonitoringConfig {

    /**
     * Prometheus监控注册器
     */
    @Bean
    public PrometheusMeterRegistry prometheusMeterRegistry() {
        return new PrometheusMeterRegistry(PrometheusConfig.DEFAULT);
    }

    /**
     * 自定义监控指标
     */
    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags(
            "application", "smartfa-backend",
            "region", System.getProperty("spring.profiles.active", "default")
        );
    }

    /**
     * 请求计时器
     */
    @Bean
    public Timer.Sample timerSample(MeterRegistry registry) {
        return Timer.start(registry);
    }
}