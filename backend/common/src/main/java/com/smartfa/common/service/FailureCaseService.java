package com.smartfa.common.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.smartfa.common.entity.FailureCase;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 失效分析案例服务接口
 */
public interface FailureCaseService extends IService<FailureCase> {

    /**
     * 分页查询案例列表
     *
     * @param page 页码
     * @param size 每页大小
     * @param title 案例标题
     * @param status 状态
     * @param creatorId 创建人ID
     * @param assigneeId 负责人ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 案例列表
     */
    IPage<FailureCase> getCasePage(Integer page, Integer size, String title, String status,
                                  Long creatorId, Long assigneeId, LocalDate startDate, LocalDate endDate);

    /**
     * 根据ID查询案例详情
     *
     * @param id 案例ID
     * @return 案例详情
     */
    FailureCase getCaseDetail(Long id);

    /**
     * 创建案例
     *
     * @param failureCase 案例信息
     * @return 创建的案例
     */
    FailureCase createCase(FailureCase failureCase);

    /**
     * 更新案例
     *
     * @param failureCase 案例信息
     * @return 更新的案例
     */
    FailureCase updateCase(FailureCase failureCase);

    /**
     * 删除案例
     *
     * @param id 案例ID
     */
    void deleteCase(Long id);

    /**
     * 分配案例
     *
     * @param id 案例ID
     * @param assigneeId 负责人ID
     */
    void assignCase(Long id, Long assigneeId);

    /**
     * 更新案例状态
     *
     * @param id 案例ID
     * @param status 状态
     */
    void updateCaseStatus(Long id, String status);

    /**
     * 获取案例统计信息
     *
     * @return 统计信息
     */
    Map<String, Object> getCaseStatistics();

    /**
     * 获取最近的案例列表
     *
     * @param limit 限制数量
     * @return 案例列表
     */
    List<FailureCase> getRecentCases(Integer limit);

    /**
     * 生成案例编号
     *
     * @return 案例编号
     */
    String generateCaseNumber();

    /**
     * 根据失效模式查询相关案例
     *
     * @param failureMode 失效模式
     * @param limit 限制数量
     * @return 相关案例列表
     */
    List<FailureCase> findSimilarCases(String failureMode, Integer limit);
}