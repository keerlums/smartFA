package com.smartfa.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 操作日志实体类
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
@Data
@TableName("sys_operation_log")
public class OperationLog extends BaseEntity {

    /**
     * 操作日志ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 操作用户ID
     */
    @TableField("user_id")
    private Long userId;

    /**
     * 操作用户名
     */
    @TableField("username")
    private String username;

    /**
     * 操作模块
     */
    @TableField("module")
    private String module;

    /**
     * 操作类型
     */
    @TableField("operation_type")
    private String operationType;

    /**
     * 操作方法
     */
    @TableField("method")
    private String method;

    /**
     * 操作描述
     */
    @TableField("description")
    private String description;

    /**
     * 请求参数
     */
    @TableField("request_params")
    private String requestParams;

    /**
     * 响应结果
     */
    @TableField("response_result")
    private String responseResult;

    /**
     * 请求IP
     */
    @TableField("ip_address")
    private String ipAddress;

    /**
     * 请求URL
     */
    @TableField("request_url")
    private String requestUrl;

    /**
     * 请求方法
     */
    @TableField("request_method")
    private String requestMethod;

    /**
     * 用户代理
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 操作状态：0-失败，1-成功
     */
    @TableField("status")
    private Integer status;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;

    /**
     * 执行时间（毫秒）
     */
    @TableField("execution_time")
    private Long executionTime;

    /**
     * 操作时间
     */
    @TableField(value = "operation_time", fill = FieldFill.INSERT)
    private LocalDateTime operationTime;
}