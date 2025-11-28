package com.smartfa.workbench.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.smartfa.common.entity.FailureCase;
import com.smartfa.common.entity.User;
import com.smartfa.common.service.FailureCaseService;
import com.smartfa.common.util.JwtUtil;
import com.smartfa.common.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;

/**
 * 失效分析案例控制器
 */
@RestController
@RequestMapping("/api/cases")
@Tag(name = "失效分析案例管理", description = "失效分析案例的增删改查操作")
public class CaseController {

    private static final Logger log = LoggerFactory.getLogger(CaseController.class);

    @Autowired
    private FailureCaseService caseService;

    /**
     * 分页查询案例列表
     */
    @GetMapping
    @Operation(summary = "分页查询案例列表")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'QUALITY_ENGINEER', 'ADMIN')")
    public Result<IPage<FailureCase>> getCases(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "10") Integer size,
            @Parameter(description = "案例标题") @RequestParam(required = false) String title,
            @Parameter(description = "状态") @RequestParam(required = false) String status,
            @Parameter(description = "创建人ID") @RequestParam(required = false) Long creatorId,
            @Parameter(description = "负责人ID") @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "开始日期") @RequestParam(required = false) 
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @Parameter(description = "结束日期") @RequestParam(required = false) 
            @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        
        try {
            IPage<FailureCase> result = caseService.getCasePage(page, size, title, status, 
                    creatorId, assigneeId, startDate, endDate);
            return Result.success(result);
        } catch (Exception e) {
            log.error("查询案例列表失败: {}", e.getMessage(), e);
            return Result.error("查询案例列表失败");
        }
    }

    /**
     * 根据ID查询案例详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "查询案例详情")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'QUALITY_ENGINEER', 'ADMIN')")
    public Result<FailureCase> getCaseById(@PathVariable Long id) {
        try {
            FailureCase caseDetail = caseService.getCaseDetail(id);
            if (caseDetail == null) {
                return Result.error("案例不存在");
            }
            return Result.success(caseDetail);
        } catch (Exception e) {
            log.error("查询案例详情失败: {}", e.getMessage(), e);
            return Result.error("查询案例详情失败");
        }
    }

    /**
     * 创建案例
     */
    @PostMapping
    @Operation(summary = "创建案例")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'ADMIN')")
    public Result<FailureCase> createCase(@Valid @RequestBody FailureCase failureCase, 
                                        HttpServletRequest request) {
        try {
            // 从Token中获取当前用户信息
            String token = request.getHeader("Authorization");
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                Long userId = JwtUtil.getUserIdFromToken(token);
                failureCase.setCreatorId(userId);
            }

            FailureCase result = caseService.createCase(failureCase);
            return Result.success(result);
        } catch (Exception e) {
            log.error("创建案例失败: {}", e.getMessage(), e);
            return Result.error("创建案例失败");
        }
    }

    /**
     * 更新案例
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新案例")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'ADMIN')")
    public Result<FailureCase> updateCase(@PathVariable Long id, 
                                         @Valid @RequestBody FailureCase failureCase) {
        try {
            failureCase.setId(id);
            FailureCase result = caseService.updateCase(failureCase);
            return Result.success(result);
        } catch (Exception e) {
            log.error("更新案例失败: {}", e.getMessage(), e);
            return Result.error("更新案例失败");
        }
    }

    /**
     * 删除案例
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除案例")
    @PreAuthorize("hasAnyAuthority('ADMIN')")
    public Result<Void> deleteCase(@PathVariable Long id) {
        try {
            caseService.deleteCase(id);
            return Result.success();
        } catch (Exception e) {
            log.error("删除案例失败: {}", e.getMessage(), e);
            return Result.error("删除案例失败");
        }
    }

    /**
     * 分配案例
     */
    @PutMapping("/{id}/assign")
    @Operation(summary = "分配案例")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'ADMIN')")
    public Result<Void> assignCase(@PathVariable Long id, 
                                  @RequestParam Long assigneeId) {
        try {
            caseService.assignCase(id, assigneeId);
            return Result.success();
        } catch (Exception e) {
            log.error("分配案例失败: {}", e.getMessage(), e);
            return Result.error("分配案例失败");
        }
    }

    /**
     * 更新案例状态
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新案例状态")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'ADMIN')")
    public Result<Void> updateCaseStatus(@PathVariable Long id, 
                                        @RequestParam String status) {
        try {
            caseService.updateCaseStatus(id, status);
            return Result.success();
        } catch (Exception e) {
            log.error("更新案例状态失败: {}", e.getMessage(), e);
            return Result.error("更新案例状态失败");
        }
    }

    /**
     * 获取案例统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取案例统计信息")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'QUALITY_ENGINEER', 'ADMIN')")
    public Result<Object> getCaseStatistics() {
        try {
            Object statistics = caseService.getCaseStatistics();
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取案例统计信息失败: {}", e.getMessage(), e);
            return Result.error("获取案例统计信息失败");
        }
    }

    /**
     * 获取最近的案例列表
     */
    @GetMapping("/recent")
    @Operation(summary = "获取最近的案例列表")
    @PreAuthorize("hasAnyAuthority('FA_ENGINEER', 'QUALITY_ENGINEER', 'ADMIN')")
    public Result<Object> getRecentCases(@RequestParam(defaultValue = "5") Integer limit) {
        try {
            Object recentCases = caseService.getRecentCases(limit);
            return Result.success(recentCases);
        } catch (Exception e) {
            log.error("获取最近案例列表失败: {}", e.getMessage(), e);
            return Result.error("获取最近案例列表失败");
        }
    }
}