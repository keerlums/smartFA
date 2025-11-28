package com.smartfa.common.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.smartfa.common.entity.User;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 失效分析案例实体类
 */
@TableName("fa_case")
public class FailureCase {

    /**
     * 案例ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 案例编号
     */
    @TableField("case_number")
    private String caseNumber;

    /**
     * 案例标题
     */
    @TableField("title")
    private String title;

    /**
     * 案例描述
     */
    @TableField("description")
    private String description;

    /**
     * 产品名称
     */
    @TableField("product_name")
    private String productName;

    /**
     * 产品型号
     */
    @TableField("product_model")
    private String productModel;

    /**
     * 失效日期
     */
    @TableField("failure_date")
    private LocalDate failureDate;

    /**
     * 失效位置
     */
    @TableField("failure_location")
    private String failureLocation;

    /**
     * 失效模式
     */
    @TableField("failure_mode")
    private String failureMode;

    /**
     * 失效机理
     */
    @TableField("failure_mechanism")
    private String failureMechanism;

    /**
     * 严重程度
     */
    @TableField("severity_level")
    private String severityLevel;

    /**
     * 状态：PENDING-待处理，PROCESSING-处理中，COMPLETED-已完成，CLOSED-已关闭
     */
    @TableField("status")
    private String status;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 负责人ID
     */
    @TableField("assignee_id")
    private Long assigneeId;

    /**
     * 创建时间
     */
    @TableField(value = "create_time", fill = FieldFill.INSERT)
    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(value = "update_time", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;

    /**
     * 创建人信息（非数据库字段）
     */
    @TableField(exist = false)
    private User creator;

    /**
     * 负责人信息（非数据库字段）
     */
    @TableField(exist = false)
    private User assignee;

    /**
     * 完成时间
     */
    @TableField("completion_time")
    private LocalDateTime completionTime;

    /**
     * 创建人姓名（非数据库字段）
     */
    @TableField(exist = false)
    private String creatorName;

    /**
     * 负责人姓名（非数据库字段）
     */
    @TableField(exist = false)
    private String assigneeName;

    // Getter and Setter methods
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCaseNumber() {
        return caseNumber;
    }

    public void setCaseNumber(String caseNumber) {
        this.caseNumber = caseNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductModel() {
        return productModel;
    }

    public void setProductModel(String productModel) {
        this.productModel = productModel;
    }

    public LocalDate getFailureDate() {
        return failureDate;
    }

    public void setFailureDate(LocalDate failureDate) {
        this.failureDate = failureDate;
    }

    public String getFailureLocation() {
        return failureLocation;
    }

    public void setFailureLocation(String failureLocation) {
        this.failureLocation = failureLocation;
    }

    public String getFailureMode() {
        return failureMode;
    }

    public void setFailureMode(String failureMode) {
        this.failureMode = failureMode;
    }

    public String getFailureMechanism() {
        return failureMechanism;
    }

    public void setFailureMechanism(String failureMechanism) {
        this.failureMechanism = failureMechanism;
    }

    public String getSeverityLevel() {
        return severityLevel;
    }

    public void setSeverityLevel(String severityLevel) {
        this.severityLevel = severityLevel;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(Long creatorId) {
        this.creatorId = creatorId;
    }

    public Long getAssigneeId() {
        return assigneeId;
    }

    public void setAssigneeId(Long assigneeId) {
        this.assigneeId = assigneeId;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }

    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }

    public User getCreator() {
        return creator;
    }

    public void setCreator(User creator) {
        this.creator = creator;
    }

    public User getAssignee() {
        return assignee;
    }

    public void setAssignee(User assignee) {
        this.assignee = assignee;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public String getAssigneeName() {
        return assigneeName;
    }

    public void setAssigneeName(String assigneeName) {
        this.assigneeName = assigneeName;
    }
}