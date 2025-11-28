package com.smartfa.common.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * 缓存配置类
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Caffeine缓存管理器
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
                // 初始容量
                .initialCapacity(100)
                // 最大容量
                .maximumSize(1000)
                // 写入后过期时间
                .expireAfterWrite(30, TimeUnit.MINUTES)
                // 访问后过期时间
                .expireAfterAccess(15, TimeUnit.MINUTES)
                // 记录统计信息
                .recordStats());
        
        // 预定义缓存
        cacheManager.setCacheNames(java.util.List.of(
            "users",
            "cases", 
            "agents",
            "knowledge",
            "statistics",
            "config"
        ));
        
        return cacheManager;
    }

    /**
     * 用户缓存配置
     */
    @Bean("userCache")
    public Caffeine<Object, Object> userCache() {
        return Caffeine.newBuilder()
                .maximumSize(500)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * 案例缓存配置
     */
    @Bean("caseCache")
    public Caffeine<Object, Object> caseCache() {
        return Caffeine.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .recordStats();
    }

    /**
     * 智能体缓存配置
     */
    @Bean("agentCache")
    public Caffeine<Object, Object> agentCache() {
        return Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(15, TimeUnit.MINUTES)
                .recordStats();
    }

    /**
     * 知识库缓存配置
     */
    @Bean("knowledgeCache")
    public Caffeine<Object, Object> knowledgeCache() {
        return Caffeine.newBuilder()
                .maximumSize(2000)
                .expireAfterWrite(2, TimeUnit.HOURS)
                .recordStats();
    }

    /**
     * 统计数据缓存配置
     */
    @Bean("statisticsCache")
    public Caffeine<Object, Object> statisticsCache() {
        return Caffeine.newBuilder()
                .maximumSize(100)
                .expireAfterWrite(5, TimeUnit.MINUTES)
                .recordStats();
    }
}