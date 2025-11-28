package com.smartfa.workbench.entity;

import com.smartfa.common.entity.BaseEntity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

/**
 * 文件实体类
 * 
 * @author SmartFA Team
 */
@Entity
@Table(name = "files")
public class FileEntity extends BaseEntity {

    /**
     * 文件ID
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 原始文件名
     */
    @Column(name = "original_name", nullable = false, length = 500)
    private String originalName;

    /**
     * 存储路径
     */
    @Column(name = "storage_path", nullable = false, length = 1000)
    private String storagePath;

    /**
     * 文件大小（字节）
     */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /**
     * 文件类型
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FileType fileType;

    /**
     * MIME类型
     */
    @Column(name = "mime_type", length = 200)
    private String mimeType;

    /**
     * 文件扩展名
     */
    @Column(name = "file_extension", length = 20)
    private String fileExtension;

    /**
     * 文件哈希值（MD5）
     */
    @Column(name = "file_hash", length = 32, unique = true)
    private String fileHash;

    /**
     * 文件描述
     */
    @Column(length = 1000)
    private String description;

    /**
     * 标签列表（JSON格式）
     */
    @Column(name = "tags", columnDefinition = "TEXT")
    private String tags;

    /**
     * 关联案例ID
     */
    @Column(name = "case_id")
    private Long caseId;

    /**
     * 上传者ID
     */
    @Column(name = "uploader_id", nullable = false)
    private Long uploaderId;

    /**
     * 是否公开
     */
    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    /**
     * 下载次数
     */
    @Column(name = "download_count", nullable = false)
    private Integer downloadCount = 0;

    /**
     * 最后下载时间
     */
    @Column(name = "last_download_time")
    private LocalDateTime lastDownloadTime;

    /**
     * 缩略图路径
     */
    @Column(name = "thumbnail_path", length = 1000)
    private String thumbnailPath;

    /**
     * 预览URL
     */
    @Column(name = "preview_url", length = 1000)
    private String previewUrl;

    /**
     * 提取的内容（JSON格式）
     */
    @Column(name = "extracted_content", columnDefinition = "TEXT")
    private String extractedContent;

    /**
     * 处理状态
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProcessStatus processStatus = ProcessStatus.PENDING;

    /**
     * 处理错误信息
     */
    @Column(name = "process_error", length = 1000)
    private String processError;

    /**
     * 处理时间
     */
    @Column(name = "processed_time")
    private LocalDateTime processedTime;

    /**
     * 文件元数据（JSON格式）
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    /**
     * 文件类型枚举
     */
    public enum FileType {
        IMAGE("图像文件"),
        DOCUMENT("文档文件"),
        VIDEO("视频文件"),
        AUDIO("音频文件"),
        ARCHIVE("压缩文件"),
        DATA("数据文件"),
        OTHER("其他文件");

        private final String description;

        FileType(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    /**
     * 处理状态枚举
     */
    public enum ProcessStatus {
        PENDING("待处理"),
        PROCESSING("处理中"),
        COMPLETED("已完成"),
        FAILED("处理失败"),
        SKIPPED("已跳过");

        private final String description;

        ProcessStatus(String description) {
            this.description = description;
        }

        public String getDescription() {
            return description;
        }
    }

    // Getter and Setter methods
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalName() {
        return originalName;
    }

    public void setOriginalName(String originalName) {
        this.originalName = originalName;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public FileType getFileType() {
        return fileType;
    }

    public void setFileType(FileType fileType) {
        this.fileType = fileType;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getFileExtension() {
        return fileExtension;
    }

    public void setFileExtension(String fileExtension) {
        this.fileExtension = fileExtension;
    }

    public String getFileHash() {
        return fileHash;
    }

    public void setFileHash(String fileHash) {
        this.fileHash = fileHash;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTags() {
        return tags;
    }

    public void setTags(String tags) {
        this.tags = tags;
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public Long getUploaderId() {
        return uploaderId;
    }

    public void setUploaderId(Long uploaderId) {
        this.uploaderId = uploaderId;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Integer getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Integer downloadCount) {
        this.downloadCount = downloadCount;
    }

    public LocalDateTime getLastDownloadTime() {
        return lastDownloadTime;
    }

    public void setLastDownloadTime(LocalDateTime lastDownloadTime) {
        this.lastDownloadTime = lastDownloadTime;
    }

    public String getThumbnailPath() {
        return thumbnailPath;
    }

    public void setThumbnailPath(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public String getPreviewUrl() {
        return previewUrl;
    }

    public void setPreviewUrl(String previewUrl) {
        this.previewUrl = previewUrl;
    }

    public String getExtractedContent() {
        return extractedContent;
    }

    public void setExtractedContent(String extractedContent) {
        this.extractedContent = extractedContent;
    }

    public ProcessStatus getProcessStatus() {
        return processStatus;
    }

    public void setProcessStatus(ProcessStatus processStatus) {
        this.processStatus = processStatus;
    }

    public String getProcessError() {
        return processError;
    }

    public void setProcessError(String processError) {
        this.processError = processError;
    }

    public LocalDateTime getProcessedTime() {
        return processedTime;
    }

    public void setProcessedTime(LocalDateTime processedTime) {
        this.processedTime = processedTime;
    }

    public String getMetadata() {
        return metadata;
    }

    public void setMetadata(String metadata) {
        this.metadata = metadata;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        FileEntity that = (FileEntity) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(originalName, that.originalName) &&
                Objects.equals(storagePath, that.storagePath) &&
                Objects.equals(fileSize, that.fileSize) &&
                fileType == that.fileType &&
                Objects.equals(mimeType, that.mimeType) &&
                Objects.equals(fileExtension, that.fileExtension) &&
                Objects.equals(fileHash, that.fileHash) &&
                Objects.equals(description, that.description) &&
                Objects.equals(tags, that.tags) &&
                Objects.equals(caseId, that.caseId) &&
                Objects.equals(uploaderId, that.uploaderId) &&
                Objects.equals(isPublic, that.isPublic) &&
                Objects.equals(downloadCount, that.downloadCount) &&
                Objects.equals(lastDownloadTime, that.lastDownloadTime) &&
                Objects.equals(thumbnailPath, that.thumbnailPath) &&
                Objects.equals(previewUrl, that.previewUrl) &&
                Objects.equals(extractedContent, that.extractedContent) &&
                processStatus == that.processStatus &&
                Objects.equals(processError, that.processError) &&
                Objects.equals(processedTime, that.processedTime) &&
                Objects.equals(metadata, that.metadata);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, originalName, storagePath, fileSize, fileType, mimeType, fileExtension, fileHash, 
                description, tags, caseId, uploaderId, isPublic, downloadCount, lastDownloadTime, thumbnailPath, 
                previewUrl, extractedContent, processStatus, processError, processedTime, metadata);
    }
}