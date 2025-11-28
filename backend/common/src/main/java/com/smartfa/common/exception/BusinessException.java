package com.smartfa.common.exception;

import com.smartfa.common.enums.ResultCode;

/**
 * 业务异常类
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    /**
     * 错误码
     */
    private final Integer code;

    /**
     * 错误消息
     */
    private final String message;

    /**
     * 错误数据
     */
    private final Object data;

    public BusinessException(String message) {
        super(message);
        this.code = ResultCode.ERROR.getCode();
        this.message = message;
        this.data = null;
    }

    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
        this.message = message;
        this.data = null;
    }

    public BusinessException(ResultCode resultCode) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
        this.message = resultCode.getMessage();
        this.data = null;
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
        this.message = message;
        this.data = null;
    }

    public BusinessException(String message, Object data) {
        super(message);
        this.code = ResultCode.ERROR.getCode();
        this.message = message;
        this.data = data;
    }

    public BusinessException(Integer code, String message, Object data) {
        super(message);
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public BusinessException(ResultCode resultCode, Object data) {
        super(resultCode.getMessage());
        this.code = resultCode.getCode();
        this.message = resultCode.getMessage();
        this.data = data;
    }

    public BusinessException(String message, Throwable cause) {
        super(message, cause);
        this.code = ResultCode.ERROR.getCode();
        this.message = message;
        this.data = null;
    }

    public BusinessException(Integer code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
        this.message = message;
        this.data = null;
    }

    public BusinessException(ResultCode resultCode, Throwable cause) {
        super(resultCode.getMessage(), cause);
        this.code = resultCode.getCode();
        this.message = resultCode.getMessage();
        this.data = null;
    }

    public Integer getCode() {
        return code;
    }

    @Override
    public String getMessage() {
        return message;
    }

    public Object getData() {
        return data;
    }
}