package com.smartfa.common.aspect;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.StopWatch;

import java.util.concurrent.CompletableFuture;

/**
 * 监控切面
 */
@Aspect
@Component
public class MonitoringAspect {

    private static final Logger log = LoggerFactory.getLogger(MonitoringAspect.class);

    @Autowired
    private MeterRegistry meterRegistry;

    /**
     * 监控Service层方法执行时间
     */
    @Around("execution(* com.smartfa.*.service..*.*(..))")
    public Object monitorServicePerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodPerformance(joinPoint, "service");
    }

    /**
     * 监控Controller层方法执行时间
     */
    @Around("execution(* com.smartfa.*.controller..*.*(..))")
    public Object monitorControllerPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodPerformance(joinPoint, "controller");
    }

    /**
     * 监控Repository层方法执行时间
     */
    @Around("execution(* com.smartfa.*.mapper..*.*(..))")
    public Object monitorRepositoryPerformance(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodPerformance(joinPoint, "repository");
    }

    /**
     * 监控AI服务调用
     */
    @Around("@annotation(com.smartfa.common.annotation.AIMonitor)")
    public Object monitorAICall(ProceedingJoinPoint joinPoint) throws Throwable {
        return monitorMethodPerformance(joinPoint, "ai_service");
    }

    /**
     * 通用方法性能监控
     */
    private Object monitorMethodPerformance(ProceedingJoinPoint joinPoint, String layer) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String metricName = String.format("%s.%s.%s", layer, className, methodName);

        StopWatch stopWatch = new StopWatch(metricName);
        stopWatch.start();

        Timer.Sample sample = Timer.start(meterRegistry);
        Object result = null;
        Exception exception = null;

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Exception e) {
            exception = e;
            throw e;
        } finally {
            stopWatch.stop();
            sample.stop(Timer.builder("method.execution.time")
                    .tag("layer", layer)
                    .tag("class", className)
                    .tag("method", methodName)
                    .tag("status", exception == null ? "success" : "error")
                    .register(meterRegistry));

            // 记录慢查询
            if (stopWatch.getTotalTimeMillis() > 1000) {
                log.warn("Slow method execution: {} took {} ms", 
                        metricName, stopWatch.getTotalTimeMillis());
            }

            // 记录方法执行日志
            if (log.isDebugEnabled()) {
                log.debug("Method {} executed in {} ms with status: {}", 
                        metricName, stopWatch.getTotalTimeMillis(), 
                        exception == null ? "success" : "error");
            }
        }
    }
}