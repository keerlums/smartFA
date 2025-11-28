package com.smartfa.common.enums;

/**
 * 响应状态码枚举
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
public enum ResultCode {

    /**
     * 成功
     */
    SUCCESS(200, "操作成功"),

    /**
     * 失败
     */
    ERROR(500, "操作失败"),

    /**
     * 参数错误
     */
    PARAM_ERROR(400, "参数错误"),

    /**
     * 未登录
     */
    UNAUTHORIZED(401, "未登录或登录已过期"),

    /**
     * 无权限
     */
    FORBIDDEN(403, "无权限访问"),

    /**
     * 资源不存在
     */
    NOT_FOUND(404, "资源不存在"),

    /**
     * 方法不允许
     */
    METHOD_NOT_ALLOWED(405, "方法不允许"),

    /**
     * 请求超时
     */
    REQUEST_TIMEOUT(408, "请求超时"),

    /**
     * 系统繁忙
     */
    SYSTEM_BUSY(429, "系统繁忙，请稍后再试"),

    /**
     * 系统错误
     */
    SYSTEM_ERROR(500, "系统错误"),

    /**
     * 服务不可用
     */
    SERVICE_UNAVAILABLE(503, "服务不可用"),

    /**
     * 网关超时
     */
    GATEWAY_TIMEOUT(504, "网关超时"),

    // ========== 业务状态码 ==========

    /**
     * 用户名或密码错误
     */
    USERNAME_PASSWORD_ERROR(1001, "用户名或密码错误"),

    /**
     * 用户已被禁用
     */
    USER_DISABLED(1002, "用户已被禁用"),

    /**
     * 用户不存在
     */
    USER_NOT_FOUND(1003, "用户不存在"),

    /**
     * 用户已存在
     */
    USER_ALREADY_EXISTS(1004, "用户已存在"),

    /**
     * Token无效
     */
    TOKEN_INVALID(1005, "Token无效"),

    /**
     * Token已过期
     */
    TOKEN_EXPIRED(1006, "Token已过期"),

    /**
     * 验证码错误
     */
    CAPTCHA_ERROR(1007, "验证码错误"),

    /**
     * 验证码已过期
     */
    CAPTCHA_EXPIRED(1008, "验证码已过期"),

    /**
     * 密码错误
     */
    PASSWORD_ERROR(1009, "密码错误"),

    /**
     * 用户名已存在
     */
    USERNAME_ALREADY_EXISTS(1010, "用户名已存在"),

    /**
     * 邮箱已存在
     */
    EMAIL_ALREADY_EXISTS(1011, "邮箱已存在"),

    // ========== 文件相关 ==========

    /**
     * 文件上传失败
     */
    FILE_UPLOAD_ERROR(2001, "文件上传失败"),

    /**
     * 文件类型不支持
     */
    FILE_TYPE_NOT_SUPPORTED(2002, "文件类型不支持"),

    /**
     * 文件大小超限
     */
    FILE_SIZE_EXCEEDED(2003, "文件大小超限"),

    /**
     * 文件不存在
     */
    FILE_NOT_FOUND(2004, "文件不存在"),

    // ========== 案例相关 ==========

    /**
     * 案例不存在
     */
    CASE_NOT_FOUND(3001, "案例不存在"),

    /**
     * 案例状态错误
     */
    CASE_STATUS_ERROR(3002, "案例状态错误"),

    /**
     * 案例正在处理中
     */
    CASE_PROCESSING(3003, "案例正在处理中，无法删除"),

    /**
     * 案例无法删除
     */
    CASE_CANNOT_DELETE(3004, "案例无法删除"),

    /**
     * 无效的状态转换
     */
    INVALID_STATUS_TRANSITION(3005, "无效的状态转换"),

    /**
     * 操作失败
     */
    OPERATION_FAILED(3006, "操作失败"),

    // ========== 任务相关 ==========

    /**
     * 任务不存在
     */
    TASK_NOT_FOUND(4001, "任务不存在"),

    /**
     * 任务状态错误
     */
    TASK_STATUS_ERROR(4002, "任务状态错误"),

    /**
     * 任务正在执行中
     */
    TASK_RUNNING(4003, "任务正在执行中，无法删除"),

    // ========== 智能体相关 ==========

    /**
     * 智能体不存在
     */
    AGENT_NOT_FOUND(5001, "智能体不存在"),

    /**
     * 智能体状态错误
     */
    AGENT_STATUS_ERROR(5002, "智能体状态错误"),

    /**
     * 智能体正在忙碌
     */
    AGENT_BUSY(5003, "智能体正在忙碌，无法执行新任务"),

    // ========== AI服务相关 ==========

    /**
     * AI服务调用失败
     */
    AI_SERVICE_ERROR(6001, "AI服务调用失败"),

    /**
     * 模型不存在
     */
    MODEL_NOT_FOUND(6002, "模型不存在"),

    /**
     * 模型调用失败
     */
    MODEL_CALL_ERROR(6003, "模型调用失败"),

    /**
     * 模型推理超时
     */
    MODEL_INFERENCE_TIMEOUT(6004, "模型推理超时");

    private final Integer code;
    private final String message;

    ResultCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }

    public Integer getCode() {
        return code;
    }

    public String getMessage() {
        return message;
    }
}