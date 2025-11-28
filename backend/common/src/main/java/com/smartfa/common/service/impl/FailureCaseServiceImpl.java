package com.smartfa.common.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.smartfa.common.entity.FailureCase;
import com.smartfa.common.entity.User;
import com.smartfa.common.exception.BusinessException;
import com.smartfa.common.mapper.FailureCaseMapper;
import com.smartfa.common.service.FailureCaseService;
import com.smartfa.common.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 失效案例服务实现类
 */
@Service
public class FailureCaseServiceImpl extends ServiceImpl<FailureCaseMapper, FailureCase> implements FailureCaseService {

    private static final Logger log = LoggerFactory.getLogger(FailureCaseServiceImpl.class);

    @Autowired
    private UserService userService;

    @Override
    public IPage<FailureCase> getCasePage(Integer page, Integer size, String title, String status,
                                         Long creatorId, Long assigneeId, LocalDate startDate, LocalDate endDate) {
        try {
            Page<FailureCase> pageParam = new Page<>(page, size);
            
            // 构建查询条件
            LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
            
            // 标题搜索
            if (StringUtils.hasText(title)) {
                queryWrapper.like(FailureCase::getTitle, title);
            }
            
            // 状态筛选
            if (StringUtils.hasText(status)) {
                queryWrapper.eq(FailureCase::getStatus, status);
            }
            
            // 创建人筛选
            if (creatorId != null) {
                queryWrapper.eq(FailureCase::getCreatorId, creatorId);
            }
            
            // 处理人筛选
            if (assigneeId != null) {
                queryWrapper.eq(FailureCase::getAssigneeId, assigneeId);
            }
            
            // 日期范围筛选
            if (startDate != null) {
                queryWrapper.ge(FailureCase::getCreateTime, startDate.atStartOfDay());
            }
            if (endDate != null) {
                queryWrapper.le(FailureCase::getCreateTime, endDate.atTime(23, 59, 59));
            }
            
            // 按创建时间倒序
            queryWrapper.orderByDesc(FailureCase::getCreateTime);
            
            // 执行分页查询
            IPage<FailureCase> resultPage = page(pageParam, queryWrapper);
            
            // 加载关联信息
            resultPage.getRecords().forEach(this::loadRelatedInfo);
            
            return resultPage;
            
        } catch (Exception e) {
            log.error("分页查询失效案例失败", e);
            throw new BusinessException("分页查询案例失败: " + e.getMessage());
        }
    }

    @Override
    public FailureCase getCaseDetail(Long id) {
        try {
            FailureCase failureCase = getById(id);
            if (failureCase == null) {
                throw new BusinessException("案例不存在");
            }
            
            // 加载关联信息
            loadRelatedInfo(failureCase);
            
            return failureCase;
            
        } catch (Exception e) {
            log.error("获取失效案例失败", e);
            throw new BusinessException("获取案例失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public FailureCase createCase(FailureCase failureCase) {
        try {
            // 生成案例编号
            String caseNumber = generateCaseNumber();
            failureCase.setCaseNumber(caseNumber);
            
            // 设置创建时间
            failureCase.setCreateTime(LocalDateTime.now());
            failureCase.setUpdateTime(LocalDateTime.now());
            
            // 设置初始状态
            if (!StringUtils.hasText(failureCase.getStatus())) {
                failureCase.setStatus("PENDING");
            }
            
            // 保存案例
            boolean saved = save(failureCase);
            if (saved) {
                log.info("创建失效案例成功: {}", caseNumber);
                return failureCase;
            } else {
                throw new BusinessException("创建案例失败");
            }
            
        } catch (Exception e) {
            log.error("创建失效案例失败", e);
            throw new BusinessException("创建案例失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public FailureCase updateCase(FailureCase failureCase) {
        try {
            // 检查案例是否存在
            FailureCase existingCase = getById(failureCase.getId());
            if (existingCase == null) {
                throw new BusinessException("案例不存在");
            }
            
            // 更新基本信息
            existingCase.setTitle(failureCase.getTitle());
            existingCase.setDescription(failureCase.getDescription());
            existingCase.setProductName(failureCase.getProductName());
            existingCase.setProductModel(failureCase.getProductModel());
            existingCase.setFailureLocation(failureCase.getFailureLocation());
            existingCase.setFailureMode(failureCase.getFailureMode());
            existingCase.setFailureMechanism(failureCase.getFailureMechanism());
            existingCase.setSeverityLevel(failureCase.getSeverityLevel());
            existingCase.setAssigneeId(failureCase.getAssigneeId());
            existingCase.setStatus(failureCase.getStatus());
            existingCase.setUpdateTime(LocalDateTime.now());
            
            // 保存更新
            boolean updated = updateById(existingCase);
            if (updated) {
                log.info("更新失效案例成功: {}", existingCase.getCaseNumber());
                return existingCase;
            } else {
                throw new BusinessException("更新案例失败");
            }
            
        } catch (Exception e) {
            log.error("更新失效案例失败", e);
            throw new BusinessException("更新案例失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteCase(Long id) {
        try {
            // 检查案例是否存在
            FailureCase failureCase = getById(id);
            if (failureCase == null) {
                throw new BusinessException("案例不存在");
            }
            
            // 检查案例状态（已完成或关闭的案例不能删除）
            if ("COMPLETED".equals(failureCase.getStatus()) || "CLOSED".equals(failureCase.getStatus())) {
                throw new BusinessException("案例无法删除");
            }
            
            // 删除案例
            boolean deleted = removeById(id);
            if (!deleted) {
                throw new BusinessException("删除案例失败");
            }
            
            log.info("删除失效案例成功: {}", failureCase.getCaseNumber());
            
        } catch (Exception e) {
            log.error("删除失效案例失败", e);
            throw new BusinessException("删除案例失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void assignCase(Long id, Long assigneeId) {
        try {
            // 检查案例是否存在
            FailureCase failureCase = getById(id);
            if (failureCase == null) {
                throw new BusinessException("案例不存在");
            }
            
            // 检查处理人是否存在
            User assignee = userService.getById(assigneeId);
            if (assignee == null) {
                throw new BusinessException("处理人不存在");
            }
            
            // 更新处理人和状态
            failureCase.setAssigneeId(assigneeId);
            failureCase.setStatus("PROCESSING");
            failureCase.setUpdateTime(LocalDateTime.now());
            
            boolean updated = updateById(failureCase);
            if (!updated) {
                throw new BusinessException("分配案例失败");
            }
            
            log.info("分配案例成功: {} -> {}", failureCase.getCaseNumber(), assignee.getRealName());
            
        } catch (Exception e) {
            log.error("分配案例失败", e);
            throw new BusinessException("分配案例失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void updateCaseStatus(Long id, String status) {
        try {
            // 检查案例是否存在
            FailureCase failureCase = getById(id);
            if (failureCase == null) {
                throw new BusinessException("案例不存在");
            }
            
            // 验证状态转换
            if (!isValidStatusTransition(failureCase.getStatus(), status)) {
                throw new BusinessException("无效的状态转换");
            }
            
            // 更新状态
            failureCase.setStatus(status);
            failureCase.setUpdateTime(LocalDateTime.now());
            
            // 如果是完成状态，记录完成时间
            if ("COMPLETED".equals(status)) {
                failureCase.setCompletionTime(LocalDateTime.now());
            }
            
            boolean updated = updateById(failureCase);
            if (!updated) {
                throw new BusinessException("更新案例状态失败");
            }
            
            log.info("更新案例状态成功: {} -> {}", failureCase.getCaseNumber(), status);
            
        } catch (Exception e) {
            log.error("更新案例状态失败", e);
            throw new BusinessException("更新案例状态失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getCaseStatistics() {
        try {
            Map<String, Object> statistics = new HashMap<>();
            
            // 总案例数
            int totalCount = Math.toIntExact(count());
            statistics.put("totalCount", totalCount);
            
            // 按状态统计
            Map<String, Integer> statusStats = new HashMap<>();
            statusStats.put("PENDING", countByStatus("PENDING"));
            statusStats.put("PROCESSING", countByStatus("PROCESSING"));
            statusStats.put("COMPLETED", countByStatus("COMPLETED"));
            statusStats.put("CLOSED", countByStatus("CLOSED"));
            statistics.put("statusStatistics", statusStats);
            
            // 按严重程度统计
            Map<String, Integer> severityStats = new HashMap<>();
            severityStats.put("LOW", countBySeverityLevel("LOW"));
            severityStats.put("MEDIUM", countBySeverityLevel("MEDIUM"));
            severityStats.put("HIGH", countBySeverityLevel("HIGH"));
            severityStats.put("CRITICAL", countBySeverityLevel("CRITICAL"));
            statistics.put("severityStatistics", severityStats);
            
            // 今日新增
            LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
            int todayCount = countByCreateTime(todayStart, LocalDateTime.now());
            statistics.put("todayCount", todayCount);
            
            // 本月新增
            LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            int monthCount = countByCreateTime(monthStart, LocalDateTime.now());
            statistics.put("monthCount", monthCount);
            
            return statistics;
            
        } catch (Exception e) {
            log.error("获取案例统计失败", e);
            throw new BusinessException("获取案例统计失败: " + e.getMessage());
        }
    }

    @Override
    public List<FailureCase> getRecentCases(Integer limit) {
        try {
            LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.orderByDesc(FailureCase::getCreateTime);
            queryWrapper.last("LIMIT " + limit);
            
            List<FailureCase> cases = list(queryWrapper);
            
            // 加载关联信息
            cases.forEach(this::loadRelatedInfo);
            
            return cases;
            
        } catch (Exception e) {
            log.error("获取最近案例失败", e);
            throw new BusinessException("获取最近案例失败: " + e.getMessage());
        }
    }

    @Override
    public String generateCaseNumber() {
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String prefix = "FA-" + datePrefix + "-";
        
        // 查询当天最大的编号
        LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.likeRight(FailureCase::getCaseNumber, prefix);
        queryWrapper.orderByDesc(FailureCase::getCaseNumber);
        queryWrapper.last("LIMIT 1");
        
        FailureCase lastCase = getOne(queryWrapper);
        
        int sequence = 1;
        if (lastCase != null) {
            String lastNumber = lastCase.getCaseNumber();
            String sequenceStr = lastNumber.substring(prefix.length());
            sequence = Integer.parseInt(sequenceStr) + 1;
        }
        
        return prefix + String.format("%04d", sequence);
    }

    @Override
    public List<FailureCase> findSimilarCases(String failureMode, Integer limit) {
        try {
            LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
            queryWrapper.like(FailureCase::getFailureMode, failureMode);
            queryWrapper.orderByDesc(FailureCase::getCreateTime);
            queryWrapper.last("LIMIT " + limit);
            
            List<FailureCase> cases = list(queryWrapper);
            
            // 加载关联信息
            cases.forEach(this::loadRelatedInfo);
            
            return cases;
            
        } catch (Exception e) {
            log.error("查找相似案例失败", e);
            throw new BusinessException("查找相似案例失败: " + e.getMessage());
        }
    }

    /**
     * 加载关联信息
     */
    private void loadRelatedInfo(FailureCase failureCase) {
        // 加载创建者信息
        if (failureCase.getCreatorId() != null) {
            User creator = userService.getById(failureCase.getCreatorId());
            if (creator != null) {
                failureCase.setCreatorName(creator.getRealName());
            }
        }
        
        // 加载处理人信息
        if (failureCase.getAssigneeId() != null) {
            User assignee = userService.getById(failureCase.getAssigneeId());
            if (assignee != null) {
                failureCase.setAssigneeName(assignee.getRealName());
            }
        }
    }

    /**
     * 验证状态转换是否有效
     */
    private boolean isValidStatusTransition(String currentStatus, String newStatus) {
        switch (currentStatus) {
            case "PENDING":
                return "PROCESSING".equals(newStatus) || "CLOSED".equals(newStatus);
            case "PROCESSING":
                return "COMPLETED".equals(newStatus) || "CLOSED".equals(newStatus) || "PENDING".equals(newStatus);
            case "COMPLETED":
                return "CLOSED".equals(newStatus);
            case "CLOSED":
                return false; // 已关闭的案例不能改变状态
            default:
                return false;
        }
    }

    /**
     * 按状态统计数量
     */
    private int countByStatus(String status) {
        LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FailureCase::getStatus, status);
        return Math.toIntExact(count(queryWrapper));
    }

    /**
     * 按严重程度统计数量
     */
    private int countBySeverityLevel(String severityLevel) {
        LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(FailureCase::getSeverityLevel, severityLevel);
        return Math.toIntExact(count(queryWrapper));
    }

    /**
     * 按创建时间统计数量
     */
    private int countByCreateTime(LocalDateTime startTime, LocalDateTime endTime) {
        LambdaQueryWrapper<FailureCase> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.ge(FailureCase::getCreateTime, startTime);
        queryWrapper.le(FailureCase::getCreateTime, endTime);
        return Math.toIntExact(count(queryWrapper));
    }
}