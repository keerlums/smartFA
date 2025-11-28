package com.smartfa.common.controller;

import com.smartfa.common.service.ReportService;
import com.smartfa.common.vo.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 报告控制器
 */
@RestController
@RequestMapping("/api/reports")
@Tag(name = "报告管理", description = "统计分析报告相关接口")
public class ReportController {

    private static final Logger log = LoggerFactory.getLogger(ReportController.class);

    @Autowired
    private ReportService reportService;

    @PostMapping("/failure-analysis")
    @Operation(summary = "生成失效分析报告", description = "生成指定时间范围内的失效分析统计报告")
    public Result<Object> generateFailureAnalysisReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        try {
            Object reportData = reportService.generateFailureAnalysisReport(startTime, endTime);
            return Result.success(reportData);
        } catch (Exception e) {
            log.error("生成失效分析报告失败", e);
            return Result.error(500, "生成报告失败: " + e.getMessage());
        }
    }

    @PostMapping("/export/excel")
    @Operation(summary = "导出Excel报告", description = "导出指定时间范围的Excel格式报告")
    public ResponseEntity<Resource> exportExcelReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        try {
            String fileName = reportService.exportReportToExcel(startTime, endTime);
            
            // TODO: 实际实现中需要返回真实的文件内容
            ByteArrayResource resource = new ByteArrayResource("Excel报告内容".getBytes());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("导出Excel报告失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/export/pdf")
    @Operation(summary = "导出PDF报告", description = "导出指定时间范围的PDF格式报告")
    public ResponseEntity<Resource> exportPDFReport(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        try {
            String fileName = reportService.exportReportToPDF(startTime, endTime);
            
            // TODO: 实际实现中需要返回真实的文件内容
            ByteArrayResource resource = new ByteArrayResource("PDF报告内容".getBytes());
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
                    
        } catch (Exception e) {
            log.error("导出PDF报告失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/dashboard")
    @Operation(summary = "获取仪表板数据", description = "获取仪表板展示的统计数据")
    public Result<Object> getDashboardData() {
        try {
            Object dashboardData = reportService.getDashboardData();
            return Result.success(dashboardData);
        } catch (Exception e) {
            log.error("获取仪表板数据失败", e);
            return Result.error(500, "获取仪表板数据失败: " + e.getMessage());
        }
    }
}