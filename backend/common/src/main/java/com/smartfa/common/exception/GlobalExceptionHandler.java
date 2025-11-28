package com.smartfa.common.exception;

import com.smartfa.common.enums.ResultCode;
import com.smartfa.common.vo.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    @ResponseStatus(HttpStatus.OK)
    public <T> Result<T> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("业务异常：{} - {}", request.getRequestURI(), e.getMessage(), e);
        return Result.error(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常（@RequestBody）
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public <T> Result<T> handleMethodArgumentNotValidException(MethodArgumentNotValidException e, HttpServletRequest request) {
        log.error("参数校验异常：{} - {}", request.getRequestURI(), e.getMessage());
        
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        return Result.error(ResultCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 处理参数校验异常（@ModelAttribute）
     */
    @ExceptionHandler(BindException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public <T> Result<T> handleBindException(BindException e, HttpServletRequest request) {
        log.error("参数绑定异常：{} - {}", request.getRequestURI(), e.getMessage());
        
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        
        return Result.error(ResultCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 处理参数校验异常（@Validated）
     */
    @ExceptionHandler(ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public <T> Result<T> handleConstraintViolationException(ConstraintViolationException e, HttpServletRequest request) {
        log.error("约束违反异常：{} - {}", request.getRequestURI(), e.getMessage());
        
        String message = e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
        
        return Result.error(ResultCode.PARAM_ERROR.getCode(), message);
    }

    /**
     * 处理非法参数异常
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public <T> Result<T> handleIllegalArgumentException(IllegalArgumentException e, HttpServletRequest request) {
        log.error("非法参数异常：{} - {}", request.getRequestURI(), e.getMessage(), e);
        return Result.error(ResultCode.PARAM_ERROR.getCode(), e.getMessage());
    }

    /**
     * 处理运行时异常
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public <T> Result<T> handleRuntimeException(RuntimeException e, HttpServletRequest request) {
        log.error("运行时异常：{} - {}", request.getRequestURI(), e.getMessage(), e);
        return Result.error(ResultCode.SYSTEM_ERROR.getCode(), "系统运行异常");
    }

    /**
     * 处理其他异常
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public <T> Result<T> handleException(Exception e, HttpServletRequest request) {
        log.error("系统异常：{} - {}", request.getRequestURI(), e.getMessage(), e);
        return Result.error(ResultCode.SYSTEM_ERROR.getCode(), "系统异常，请联系管理员");
    }
}