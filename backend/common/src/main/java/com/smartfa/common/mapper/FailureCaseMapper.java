package com.smartfa.common.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartfa.common.entity.FailureCase;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 失效案例Mapper接口
 */
@Mapper
public interface FailureCaseMapper extends BaseMapper<FailureCase> {

    /**
     * 按时间范围统计案例数量
     */
    @Select("SELECT COUNT(*) FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime}")
    int countByTimeRange(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按状态和时间范围统计案例数量
     */
    @Select("SELECT COUNT(*) FROM failure_case WHERE status = #{status} AND create_time >= #{startTime} AND create_time <= #{endTime}")
    int countByStatusAndTimeRange(@Param("status") String status, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取平均处理时间
     */
    @Select("SELECT AVG(DATEDIFF(completion_time, create_time)) FROM failure_case WHERE status = 'COMPLETED' AND create_time >= #{startTime} AND create_time <= #{endTime}")
    Double getAverageProcessingTime(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按失效模式统计
     */
    @Select("SELECT failure_mode, COUNT(*) as count, " +
            "COUNT(*) * 100.0 / (SELECT COUNT(*) FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime}) as percentage " +
            "FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "GROUP BY failure_mode ORDER BY count DESC")
    List<Map<String, Object>> getFailureModeStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按失效模式获取平均严重程度
     */
    @Select("SELECT AVG(CASE severity_level " +
            "WHEN 'LOW' THEN 1 " +
            "WHEN 'MEDIUM' THEN 2 " +
            "WHEN 'HIGH' THEN 3 " +
            "WHEN 'CRITICAL' THEN 4 " +
            "ELSE 0 END) as avgSeverity " +
            "FROM failure_case WHERE failure_mode = #{failureMode} AND create_time >= #{startTime} AND create_time <= #{endTime}")
    Double getAverageSeverityByFailureMode(@Param("failureMode") String failureMode, @Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按严重程度统计
     */
    @Select("SELECT severity_level, COUNT(*) as count, 0 as totalCost FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} GROUP BY severity_level")
    List<Map<String, Object>> getSeverityStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按月统计
     */
    @Select("SELECT YEAR(create_time) as year, MONTH(create_time) as month, COUNT(*) as caseCount, " +
            "SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
            "AVG(CASE WHEN status = 'COMPLETED' THEN DATEDIFF(completion_time, create_time) ELSE NULL END) as avgProcessingTime " +
            "FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "GROUP BY YEAR(create_time), MONTH(create_time) ORDER BY year, month")
    List<Map<String, Object>> getMonthlyStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按产品统计
     */
    @Select("SELECT product_name, product_model, COUNT(*) as caseCount, " +
            "COUNT(*) * 100.0 / (SELECT COUNT(*) FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime}) as failureRate, " +
            "0 as avgCost " +
            "FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "GROUP BY product_name, product_model ORDER BY caseCount DESC")
    List<Map<String, Object>> getProductStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 按处理人统计
     */
    @Select("SELECT assignee_id, COUNT(*) as totalCases, " +
            "SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completedCount, " +
            "AVG(CASE WHEN status = 'COMPLETED' THEN DATEDIFF(completion_time, create_time) ELSE NULL END) as avgProcessingTime " +
            "FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} AND assignee_id IS NOT NULL " +
            "GROUP BY assignee_id ORDER BY completedCount DESC")
    List<Map<String, Object>> getAssigneeStatistics(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime);

    /**
     * 获取Top失效案例
     */
    @Select("SELECT * FROM failure_case WHERE create_time >= #{startTime} AND create_time <= #{endTime} " +
            "ORDER BY " +
            "CASE severity_level " +
            "WHEN 'CRITICAL' THEN 1 " +
            "WHEN 'HIGH' THEN 2 " +
            "WHEN 'MEDIUM' THEN 3 " +
            "WHEN 'LOW' THEN 4 " +
            "ELSE 5 END, " +
            "create_time DESC " +
            "LIMIT #{limit}")
    List<FailureCase> getTopFailureCases(@Param("startTime") LocalDateTime startTime, @Param("endTime") LocalDateTime endTime, @Param("limit") int limit);

    /**
     * 获取紧急案例
     */
    @Select("SELECT * FROM failure_case WHERE severity_level IN ('HIGH', 'CRITICAL') AND status != 'COMPLETED' AND status != 'CLOSED' " +
            "ORDER BY " +
            "CASE severity_level " +
            "WHEN 'CRITICAL' THEN 1 " +
            "WHEN 'HIGH' THEN 2 " +
            "ELSE 3 END, " +
            "create_time ASC " +
            "LIMIT #{limit}")
    List<FailureCase> getUrgentCases(@Param("limit") int limit);

    /**
     * 按案例编号查找案例
     */
    @Select("SELECT * FROM failure_case WHERE case_number = #{caseNumber}")
    FailureCase findByCaseNumber(@Param("caseNumber") String caseNumber);

    /**
     * 按标题模糊查找案例
     */
    @Select("SELECT * FROM failure_case WHERE title LIKE CONCAT('%', #{title}, '%')")
    List<FailureCase> findByTitle(@Param("title") String title);
}