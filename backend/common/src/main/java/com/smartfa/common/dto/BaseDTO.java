package com.smartfa.common.dto;

import lombok.Data;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.io.Serializable;

/**
 * 基础DTO类
 * 包含分页查询的通用参数
 * 
 * @author SmartFA Team
 * @since 2024-01-15
 */
@Data
public class BaseDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 当前页码，从1开始
     */
    @Min(value = 1, message = "页码最小值为1")
    private Integer pageNum = 1;

    /**
     * 每页显示数量
     */
    @Min(value = 1, message = "每页显示数量最小值为1")
    @Max(value = 100, message = "每页显示数量最大值为100")
    private Integer pageSize = 10;

    /**
     * 排序字段
     */
    private String orderBy;

    /**
     * 排序方向：asc/desc
     */
    private String orderDirection = "asc";

    /**
     * 是否启用分页
     */
    private Boolean enablePage = true;
}