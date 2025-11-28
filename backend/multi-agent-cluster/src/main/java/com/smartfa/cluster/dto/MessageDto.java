package com.smartfa.cluster.dto;

import java.time.LocalDateTime;

/**
 * 消息DTO
 * 
 * @author SmartFA Team
 */
public class MessageDto {

    /**
     * 消息ID
     */
    private Long id;

    /**
     * 发送者ID
     */
    private Long senderId;

    /**
     * 接收者ID
     */
    private Long receiverId;

    /**
     * 消息类型
     */
    private String messageType;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 消息状态
     */
    private String status;

    /**
     * 发送时间
     */
    private LocalDateTime sendTime;

    /**
     * 接收时间
     */
    private LocalDateTime receiveTime;

    /**
     * 发送者智能体ID
     */
    private String fromAgentId;

    /**
     * 接收者智能体ID
     */
    private String toAgentId;

    /**
     * 时间戳
     */
    private Long timestamp;

    // Getter 和 Setter 方法
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getMessageType() {
        return messageType;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public void setType(String type) {
        this.messageType = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getSendTime() {
        return sendTime;
    }

    public void setSendTime(LocalDateTime sendTime) {
        this.sendTime = sendTime;
    }

    public LocalDateTime getReceiveTime() {
        return receiveTime;
    }

    public void setReceiveTime(LocalDateTime receiveTime) {
        this.receiveTime = receiveTime;
    }

    public String getFromAgentId() {
        return fromAgentId;
    }

    public void setFromAgentId(String fromAgentId) {
        this.fromAgentId = fromAgentId;
    }

    public String getToAgentId() {
        return toAgentId;
    }

    public void setToAgentId(String toAgentId) {
        this.toAgentId = toAgentId;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }
}