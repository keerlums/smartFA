package com.smartfa.common.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * AI监控注解
 * 用于标记需要监控的AI服务调用
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AIMonitor {
    
    /**
     * 服务名称
     */
    String serviceName() default "";
    
    /**
     * 操作类型
     */
    String operation() default "";
    
    /**
     * 是否记录输入输出
     */
    boolean logInputOutput() default false;
    
    /**
     * 超时时间（毫秒）
     */
    long timeout() default 30000;
}