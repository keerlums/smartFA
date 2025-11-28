package com.smartfa.common.service;

import com.smartfa.common.entity.OperationLog;
import com.smartfa.common.vo.Result;
import java.util.List;

/**
 * 日志服务接口
 */
public interface LoggingService {

    /**
     * 记录操作日志
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param operation 操作类型
     * @param method 请求方法
     * @param params 请求参数
     * @param result 操作结果
     * @param ip IP地址
     * @param userAgent 用户代理
     * @param executionTime 执行时间
     */
    void logOperation(Long userId, String username, String operation, String method,
                     String params, String result, String ip, String userAgent, Long executionTime);

    /**
     * 记录异常日志
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param operation 操作类型
     * @param exception 异常信息
     * @param params 请求参数
     */
    void logException(Long userId, String username, String operation, Exception exception, String params);

    /**
     * 记录AI服务调用日志
     *
     * @param serviceName 服务名称
     * @param operation 操作类型
     * @param input 输入参数
     * @param output 输出结果
     * @param executionTime 执行时间
     * @param success 是否成功
     */
    void logAICall(String serviceName, String operation, String input, String output, 
                   Long executionTime, boolean success);

    /**
     * 记录安全事件日志
     *
     * @param userId 用户ID
     * @param username 用户名
     * @param eventType 事件类型
     * @param description 事件描述
     * @param ip IP地址
     * @param userAgent 用户代理
     */
    void logSecurityEvent(Long userId, String username, String eventType, 
                         String description, String ip, String userAgent);

    /**
     * 查询操作日志
     *
     * @param userId 用户ID
     * @param operation 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param page 页码
     * @param size 每页大小
     * @return 日志列表
     */
    Result<List<OperationLog>> queryOperationLogs(Long userId, String operation, 
                                                  String startTime, String endTime, 
                                                  Integer page, Integer size);

    /**
     * 查询异常日志
     *
     * @param userId 用户ID
     * @param operation 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param page 页码
     * @param size 每页大小
     * @return 异常日志列表
     */
    Result<List<OperationLog>> queryExceptionLogs(Long userId, String operation, 
                                                 String startTime, String endTime, 
                                                 Integer page, Integer size);

    /**
     * 查询AI调用日志
     *
     * @param serviceName 服务名称
     * @param operation 操作类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @param page 页码
     * @param size 每页大小
     * @return AI调用日志列表
     */
    Result<List<OperationLog>> queryAICallLogs(String serviceName, String operation, 
                                               String startTime, String endTime, 
                                               Integer page, Integer size);

    /**
     * 清理过期日志
     *
     * @param days 保留天数
     */
    void cleanExpiredLogs(Integer days);

    /**
     * 导出日志
     *
     * @param logType 日志类型
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 导出文件路径
     */
    String exportLogs(String logType, String startTime, String endTime);
}