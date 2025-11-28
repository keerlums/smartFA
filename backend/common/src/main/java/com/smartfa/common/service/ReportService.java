package com.smartfa.common.service;

import com.smartfa.common.entity.FailureCase;
import com.smartfa.common.entity.User;
import com.smartfa.common.mapper.FailureCaseMapper;
import com.smartfa.common.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 报告服务
 * 提供各类统计报告和分析功能
 */
@Service
public class ReportService {

    private static final Logger log = LoggerFactory.getLogger(ReportService.class);

    @Autowired
    private FailureCaseMapper failureCaseMapper;
    
    @Autowired
    private UserMapper userMapper;

    /**
     * 生成失效分析统计报告
     */
    public Map<String, Object> generateFailureAnalysisReport(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("生成失效分析统计报告: {} - {}", startTime, endTime);
        
        Map<String, Object> report = new HashMap<>();
        
        try {
            // 基础统计数据
            Map<String, Object> basicStats = getBasicStatistics(startTime, endTime);
            report.put("basicStatistics", basicStats);
            
            // 失效模式分析
            List<Map<String, Object>> failureModeAnalysis = getFailureModeAnalysis(startTime, endTime);
            report.put("failureModeAnalysis", failureModeAnalysis);
            
            // 严重程度分析
            Map<String, Object> severityAnalysis = getSeverityAnalysis(startTime, endTime);
            report.put("severityAnalysis", severityAnalysis);
            
            // 时间趋势分析
            List<Map<String, Object>> timeTrendAnalysis = getTimeTrendAnalysis(startTime, endTime);
            report.put("timeTrendAnalysis", timeTrendAnalysis);
            
            // 产品分析
            List<Map<String, Object>> productAnalysis = getProductAnalysis(startTime, endTime);
            report.put("productAnalysis", productAnalysis);
            
            // 处理效率分析
            Map<String, Object> efficiencyAnalysis = getEfficiencyAnalysis(startTime, endTime);
            report.put("efficiencyAnalysis", efficiencyAnalysis);
            
            // Top 10 失效案例
            List<Map<String, Object>> topFailureCases = getTopFailureCases(startTime, endTime);
            report.put("topFailureCases", topFailureCases);
            
            report.put("reportTime", LocalDateTime.now());
            report.put("timeRange", Map.of(
                "startTime", startTime,
                "endTime", endTime
            ));
            
            log.info("失效分析统计报告生成完成");
            
        } catch (Exception e) {
            log.error("生成失效分析统计报告失败", e);
            throw new RuntimeException("生成报告失败: " + e.getMessage());
        }
        
        return report;
    }

    /**
     * 获取基础统计数据
     */
    private Map<String, Object> getBasicStatistics(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> stats = new HashMap<>();
        
        // 总案例数
        int totalCases = failureCaseMapper.countByTimeRange(startTime, endTime);
        stats.put("totalCases", totalCases);
        
        // 已完成案例数
        int completedCases = failureCaseMapper.countByStatusAndTimeRange("COMPLETED", startTime, endTime);
        stats.put("completedCases", completedCases);
        
        // 处理中案例数
        int processingCases = failureCaseMapper.countByStatusAndTimeRange("PROCESSING", startTime, endTime);
        stats.put("processingCases", processingCases);
        
        // 待处理案例数
        int pendingCases = failureCaseMapper.countByStatusAndTimeRange("PENDING", startTime, endTime);
        stats.put("pendingCases", pendingCases);
        
        // 完成率
        double completionRate = totalCases > 0 ? (double) completedCases / totalCases * 100 : 0;
        stats.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
        
        // 平均处理时间（天）
        double avgProcessingTime = failureCaseMapper.getAverageProcessingTime(startTime, endTime);
        stats.put("avgProcessingTime", Math.round(avgProcessingTime * 100.0) / 100.0);
        
        return stats;
    }

    /**
     * 失效模式分析
     */
    private List<Map<String, Object>> getFailureModeAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> analysis = new ArrayList<>();
        
        // 按失效模式统计
        List<Map<String, Object>> failureModeStats = failureCaseMapper.getFailureModeStatistics(startTime, endTime);
        
        for (Map<String, Object> stat : failureModeStats) {
            Map<String, Object> item = new HashMap<>();
            item.put("failureMode", stat.get("failureMode"));
            item.put("count", stat.get("count"));
            item.put("percentage", Math.round((Double) stat.get("percentage") * 10000.0) / 100.0);
            
            // 获取该失效模式的平均严重程度
            Double avgSeverity = failureCaseMapper.getAverageSeverityByFailureMode(
                (String) stat.get("failureMode"), startTime, endTime);
            item.put("avgSeverity", avgSeverity != null ? Math.round(avgSeverity * 100.0) / 100.0 : 0);
            
            analysis.add(item);
        }
        
        // 按数量排序
        analysis.sort((a, b) -> Integer.compare((Integer) b.get("count"), (Integer) a.get("count")));
        
        return analysis;
    }

    /**
     * 严重程度分析
     */
    private Map<String, Object> getSeverityAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> analysis = new HashMap<>();
        
        // 按严重程度统计
        List<Map<String, Object>> severityStats = failureCaseMapper.getSeverityStatistics(startTime, endTime);
        
        Map<String, Integer> severityCount = new HashMap<>();
        Map<String, Double> severityCost = new HashMap<>();
        
        for (Map<String, Object> stat : severityStats) {
            String severity = (String) stat.get("severityLevel");
            severityCount.put(severity, (Integer) stat.get("count"));
            severityCost.put(severity, (Double) stat.get("totalCost"));
        }
        
        analysis.put("severityCount", severityCount);
        analysis.put("severityCost", severityCost);
        
        // 计算严重程度分布
        int total = severityCount.values().stream().mapToInt(Integer::intValue).sum();
        Map<String, Double> severityDistribution = new HashMap<>();
        severityCount.forEach((severity, count) -> {
            severityDistribution.put(severity, total > 0 ? (double) count / total * 100 : 0);
        });
        analysis.put("severityDistribution", severityDistribution);
        
        return analysis;
    }

    /**
     * 时间趋势分析
     */
    private List<Map<String, Object>> getTimeTrendAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        // 按月统计
        List<Map<String, Object>> monthlyStats = failureCaseMapper.getMonthlyStatistics(startTime, endTime);
        
        for (Map<String, Object> stat : monthlyStats) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", stat.get("month"));
            item.put("year", stat.get("year"));
            item.put("caseCount", stat.get("caseCount"));
            item.put("completedCount", stat.get("completedCount"));
            item.put("avgProcessingTime", stat.get("avgProcessingTime"));
            
            trend.add(item);
        }
        
        // 按时间排序
        trend.sort((a, b) -> {
            int yearA = (Integer) a.get("year");
            int yearB = (Integer) b.get("year");
            int monthA = (Integer) a.get("month");
            int monthB = (Integer) b.get("month");
            
            if (yearA != yearB) {
                return Integer.compare(yearA, yearB);
            }
            return Integer.compare(monthA, monthB);
        });
        
        return trend;
    }

    /**
     * 产品分析
     */
    private List<Map<String, Object>> getProductAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> analysis = new ArrayList<>();
        
        // 按产品统计
        List<Map<String, Object>> productStats = failureCaseMapper.getProductStatistics(startTime, endTime);
        
        for (Map<String, Object> stat : productStats) {
            Map<String, Object> item = new HashMap<>();
            item.put("productName", stat.get("productName"));
            item.put("productModel", stat.get("productModel"));
            item.put("caseCount", stat.get("caseCount"));
            item.put("failureRate", Math.round((Double) stat.get("failureRate") * 10000.0) / 100.0);
            item.put("avgCost", Math.round((Double) stat.get("avgCost") * 100.0) / 100.0);
            
            analysis.add(item);
        }
        
        // 按案例数排序
        analysis.sort((a, b) -> Integer.compare((Integer) b.get("caseCount"), (Integer) a.get("caseCount")));
        
        return analysis;
    }

    /**
     * 处理效率分析
     */
    private Map<String, Object> getEfficiencyAnalysis(LocalDateTime startTime, LocalDateTime endTime) {
        Map<String, Object> analysis = new HashMap<>();
        
        // 按处理人统计
        List<Map<String, Object>> assigneeStats = failureCaseMapper.getAssigneeStatistics(startTime, endTime);
        
        List<Map<String, Object>> assigneeEfficiency = new ArrayList<>();
        for (Map<String, Object> stat : assigneeStats) {
            Map<String, Object> item = new HashMap<>();
            Long assigneeId = (Long) stat.get("assigneeId");
            User assignee = userMapper.selectById(assigneeId);
            
            item.put("assigneeId", assigneeId);
            item.put("assigneeName", assignee != null ? assignee.getRealName() : "未知");
            item.put("totalCases", stat.get("totalCases"));
            item.put("completedCases", stat.get("completedCases"));
            item.put("avgProcessingTime", Math.round((Double) stat.get("avgProcessingTime") * 100.0) / 100.0);
            
            double completionRate = (Integer) stat.get("totalCases") > 0 ? 
                (double) (Integer) stat.get("completedCases") / (Integer) stat.get("totalCases") * 100 : 0;
            item.put("completionRate", Math.round(completionRate * 100.0) / 100.0);
            
            assigneeEfficiency.add(item);
        }
        
        // 按完成率排序
        assigneeEfficiency.sort((a, b) -> Double.compare((Double) b.get("completionRate"), (Double) a.get("completionRate")));
        
        analysis.put("assigneeEfficiency", assigneeEfficiency);
        
        // 整体效率指标
        double overallAvgTime = failureCaseMapper.getAverageProcessingTime(startTime, endTime);
        int totalCompleted = failureCaseMapper.countByStatusAndTimeRange("COMPLETED", startTime, endTime);
        int totalCases = failureCaseMapper.countByTimeRange(startTime, endTime);
        double overallCompletionRate = totalCases > 0 ? (double) totalCompleted / totalCases * 100 : 0;
        
        analysis.put("overallAvgProcessingTime", Math.round(overallAvgTime * 100.0) / 100.0);
        analysis.put("overallCompletionRate", Math.round(overallCompletionRate * 100.0) / 100.0);
        
        return analysis;
    }

    /**
     * Top 10 失效案例
     */
    private List<Map<String, Object>> getTopFailureCases(LocalDateTime startTime, LocalDateTime endTime) {
        List<Map<String, Object>> topCases = new ArrayList<>();
        
        // 获取影响最大的案例（按成本或严重程度）
        List<FailureCase> cases = failureCaseMapper.getTopFailureCases(startTime, endTime, 10);
        
        for (FailureCase case_ : cases) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", case_.getId());
            item.put("caseNumber", case_.getCaseNumber());
            item.put("title", case_.getTitle());
            item.put("failureMode", case_.getFailureMode());
            item.put("severityLevel", case_.getSeverityLevel());
            item.put("failureDate", case_.getFailureDate());
            item.put("status", case_.getStatus());
            
            User creator = userMapper.selectById(case_.getCreatorId());
            User assignee = userMapper.selectById(case_.getAssigneeId());
            
            item.put("creator", creator != null ? creator.getRealName() : "未知");
            item.put("assignee", assignee != null ? assignee.getRealName() : "未分配");
            
            topCases.add(item);
        }
        
        return topCases;
    }

    /**
     * 导出Excel报告
     */
    @Transactional
    public String exportReportToExcel(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("导出Excel报告: {} - {}", startTime, endTime);
        
        try {
            // 生成报告数据
            Map<String, Object> reportData = generateFailureAnalysisReport(startTime, endTime);
            
            // 创建Excel文件
            String fileName = "失效分析报告_" + 
                startTime.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "_" +
                endTime.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".xlsx";
            
            // TODO: 使用Apache POI或EasyExcel生成Excel文件
            // 这里简化处理，实际应该生成真实的Excel文件
            
            log.info("Excel报告导出完成: {}", fileName);
            return fileName;
            
        } catch (Exception e) {
            log.error("导出Excel报告失败", e);
            throw new RuntimeException("导出报告失败: " + e.getMessage());
        }
    }

    /**
     * 生成PDF报告
     */
    @Transactional
    public String exportReportToPDF(LocalDateTime startTime, LocalDateTime endTime) {
        log.info("生成PDF报告: {} - {}", startTime, endTime);
        
        try {
            // 生成报告数据
            Map<String, Object> reportData = generateFailureAnalysisReport(startTime, endTime);
            
            // 创建PDF文件
            String fileName = "失效分析报告_" + 
                startTime.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "_" +
                endTime.format(DateTimeFormatter.ofPattern("yyyyMMdd")) + ".pdf";
            
            // TODO: 使用iText或其他PDF库生成PDF文件
            // 这里简化处理，实际应该生成真实的PDF文件
            
            log.info("PDF报告生成完成: {}", fileName);
            return fileName;
            
        } catch (Exception e) {
            log.error("生成PDF报告失败", e);
            throw new RuntimeException("生成PDF报告失败: " + e.getMessage());
        }
    }

    /**
     * 获取仪表板数据
     */
    public Map<String, Object> getDashboardData() {
        log.info("获取仪表板数据");
        
        Map<String, Object> dashboard = new HashMap<>();
        
        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime monthStart = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime yearStart = now.withMonth(1).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            
            // 今日统计
            Map<String, Object> todayStats = getBasicStatistics(
                now.withHour(0).withMinute(0).withSecond(0), now);
            dashboard.put("todayStats", todayStats);
            
            // 本月统计
            Map<String, Object> monthStats = getBasicStatistics(monthStart, now);
            dashboard.put("monthStats", monthStats);
            
            // 本年统计
            Map<String, Object> yearStats = getBasicStatistics(yearStart, now);
            dashboard.put("yearStats", yearStats);
            
            // 最近7天趋势
            List<Map<String, Object>> recentTrend = getRecentTrend(7);
            dashboard.put("recentTrend", recentTrend);
            
            // 失效模式排行
            List<Map<String, Object>> topFailureModes = getFailureModeAnalysis(yearStart, now)
                .stream().limit(5).collect(Collectors.toList());
            dashboard.put("topFailureModes", topFailureModes);
            
            // 待处理紧急案例
            List<Map<String, Object>> urgentCases = getUrgentCases();
            dashboard.put("urgentCases", urgentCases);
            
            dashboard.put("lastUpdateTime", now);
            
        } catch (Exception e) {
            log.error("获取仪表板数据失败", e);
            throw new RuntimeException("获取仪表板数据失败: " + e.getMessage());
        }
        
        return dashboard;
    }

    /**
     * 获取最近趋势
     */
    private List<Map<String, Object>> getRecentTrend(int days) {
        List<Map<String, Object>> trend = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();
        
        for (int i = days - 1; i >= 0; i--) {
            LocalDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            LocalDateTime dayEnd = dayStart.plusDays(1).minusSeconds(1);
            
            int dayCount = failureCaseMapper.countByTimeRange(dayStart, dayEnd);
            int dayCompleted = failureCaseMapper.countByStatusAndTimeRange("COMPLETED", dayStart, dayEnd);
            
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("date", dayStart.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")));
            dayData.put("newCases", dayCount);
            dayData.put("completedCases", dayCompleted);
            
            trend.add(dayData);
        }
        
        return trend;
    }

    /**
     * 获取紧急案例
     */
    private List<Map<String, Object>> getUrgentCases() {
        List<Map<String, Object>> urgentCases = new ArrayList<>();
        
        // 获取高严重程度且未完成的案例
        List<FailureCase> cases = failureCaseMapper.getUrgentCases(10);
        
        for (FailureCase case_ : cases) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", case_.getId());
            item.put("caseNumber", case_.getCaseNumber());
            item.put("title", case_.getTitle());
            item.put("severityLevel", case_.getSeverityLevel());
            item.put("createTime", case_.getCreateTime());
            
            User assignee = userMapper.selectById(case_.getAssigneeId());
            item.put("assignee", assignee != null ? assignee.getRealName() : "未分配");
            
            urgentCases.add(item);
        }
        
        return urgentCases;
    }
}