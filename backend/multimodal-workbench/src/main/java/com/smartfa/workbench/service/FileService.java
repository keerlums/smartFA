package com.smartfa.workbench.service;

import com.smartfa.workbench.entity.FileEntity;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 文件服务接口
 * 
 * @author SmartFA Team
 */
public interface FileService {

    /**
     * 上传文件
     */
    FileEntity uploadFile(MultipartFile file, String description, List<String> tags, Long caseId);

    /**
     * 批量上传文件
     */
    List<FileEntity> uploadFiles(MultipartFile[] files, String description, List<String> tags, Long caseId);

    /**
     * 下载文件
     */
    Resource downloadFile(Long id);

    /**
     * 获取文件信息
     */
    FileEntity getFile(Long id);

    /**
     * 分页查询文件
     */
    Page<FileEntity> getFiles(String name, String fileType, Long caseId, List<String> tags, Pageable pageable);

    /**
     * 更新文件信息
     */
    FileEntity updateFile(Long id, Map<String, Object> updateData);

    /**
     * 删除文件
     */
    void deleteFile(Long id);

    /**
     * 批量删除文件
     */
    void deleteFiles(List<Long> ids);

    /**
     * 获取文件统计
     */
    Map<String, Object> getFileStatistics();

    /**
     * 获取文件预览URL
     */
    String getPreviewUrl(Long id);

    /**
     * 获取文件缩略图
     */
    Resource getThumbnail(Long id) throws IOException;

    /**
     * 文件内容提取
     */
    Map<String, Object> extractContent(Long id);

    /**
     * 文件格式转换
     */
    FileEntity convertFile(Long id, String targetFormat);

    /**
     * 搜索文件
     */
    Page<FileEntity> searchFiles(String keyword, String fileType, Long caseId, Pageable pageable);

    /**
     * 生成文件哈希
     */
    String generateFileHash(MultipartFile file) throws IOException;

    /**
     * 检测文件类型
     */
    FileEntity.FileType detectFileType(String filename, String mimeType);

    /**
     * 生成缩略图
     */
    String generateThumbnail(String filePath, String fileType) throws IOException;

    /**
     * 提取元数据
     */
    Map<String, Object> extractMetadata(String filePath, String fileType) throws IOException;

    /**
     * 验证文件
     */
    boolean validateFile(MultipartFile file);

    /**
     * 清理临时文件
     */
    void cleanupTempFiles();

    /**
     * 移动文件到永久存储
     */
    String moveToPermanentStorage(String tempPath, String fileName);
}