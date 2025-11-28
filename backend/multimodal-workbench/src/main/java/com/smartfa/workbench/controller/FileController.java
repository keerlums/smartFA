package com.smartfa.workbench.controller;

import com.smartfa.common.vo.Result;
import com.smartfa.workbench.entity.FileEntity;
import com.smartfa.workbench.service.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

/**
 * 文件管理控制器
 * 
 * @author SmartFA Team
 */
@Tag(name = "文件管理", description = "文件上传、下载、预览等操作")
@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileService fileService;

    @Operation(summary = "上传文件")
    @PostMapping("/upload")
    public Result<FileEntity> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "caseId", required = false) Long caseId) {
        
        FileEntity fileEntity = fileService.uploadFile(file, description, tags, caseId);
        return Result.success(fileEntity);
    }

    @Operation(summary = "批量上传文件")
    @PostMapping("/batch-upload")
    public Result<List<FileEntity>> uploadFiles(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "caseId", required = false) Long caseId) {
        
        List<FileEntity> fileEntities = fileService.uploadFiles(files, description, tags, caseId);
        return Result.success(fileEntities);
    }

    @Operation(summary = "下载文件")
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            HttpServletRequest request) throws IOException {
        
        FileEntity fileEntity = fileService.getFile(id);
        Resource resource = fileService.downloadFile(id);
        
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            contentType = "application/octet-stream";
        }
        
        String encodedFilename = URLEncoder.encode(fileEntity.getOriginalName(), StandardCharsets.UTF_8);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                        "attachment; filename=\"" + encodedFilename + "\"")
                .body(resource);
    }

    @Operation(summary = "预览文件")
    @GetMapping("/preview/{id}")
    public ResponseEntity<Resource> previewFile(
            @PathVariable Long id,
            HttpServletRequest request) throws IOException {
        
        FileEntity fileEntity = fileService.getFile(id);
        Resource resource = fileService.downloadFile(id);
        
        String contentType = null;
        try {
            contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
        } catch (IOException ex) {
            contentType = "application/octet-stream";
        }
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }

    @Operation(summary = "获取文件信息")
    @GetMapping("/{id}")
    public Result<FileEntity> getFile(@PathVariable Long id) {
        FileEntity fileEntity = fileService.getFile(id);
        return Result.success(fileEntity);
    }

    @Operation(summary = "分页查询文件")
    @GetMapping
    public Result<Page<FileEntity>> getFiles(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) Long caseId,
            @RequestParam(required = false) List<String> tags,
            Pageable pageable) {
        
        Page<FileEntity> files = fileService.getFiles(name, fileType, caseId, tags, pageable);
        return Result.success(files);
    }

    @Operation(summary = "更新文件信息")
    @PutMapping("/{id}")
    public Result<FileEntity> updateFile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updateData) {
        
        FileEntity fileEntity = fileService.updateFile(id, updateData);
        return Result.success(fileEntity);
    }

    @Operation(summary = "删除文件")
    @DeleteMapping("/{id}")
    public Result<Void> deleteFile(@PathVariable Long id) {
        fileService.deleteFile(id);
        return Result.success();
    }

    @Operation(summary = "批量删除文件")
    @DeleteMapping("/batch")
    public Result<Void> deleteFiles(@RequestBody List<Long> ids) {
        fileService.deleteFiles(ids);
        return Result.success();
    }

    @Operation(summary = "获取文件统计")
    @GetMapping("/statistics")
    public Result<Map<String, Object>> getFileStatistics() {
        Map<String, Object> statistics = fileService.getFileStatistics();
        return Result.success(statistics);
    }

    @Operation(summary = "获取文件预览URL")
    @GetMapping("/{id}/preview-url")
    public Result<String> getPreviewUrl(@PathVariable Long id) {
        String previewUrl = fileService.getPreviewUrl(id);
        return Result.success(previewUrl);
    }

    @Operation(summary = "获取文件缩略图")
    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> getThumbnail(@PathVariable Long id) throws IOException {
        Resource thumbnail = fileService.getThumbnail(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(thumbnail);
    }

    @Operation(summary = "文件内容提取")
    @PostMapping("/{id}/extract")
    public Result<Map<String, Object>> extractContent(@PathVariable Long id) {
        Map<String, Object> content = fileService.extractContent(id);
        return Result.success(content);
    }

    @Operation(summary = "文件格式转换")
    @PostMapping("/{id}/convert")
    public Result<FileEntity> convertFile(
            @PathVariable Long id,
            @RequestParam String targetFormat) {
        
        FileEntity convertedFile = fileService.convertFile(id, targetFormat);
        return Result.success(convertedFile);
    }

    @Operation(summary = "搜索文件")
    @GetMapping("/search")
    public Result<Page<FileEntity>> searchFiles(
            @RequestParam String keyword,
            @RequestParam(required = false) String fileType,
            @RequestParam(required = false) Long caseId,
            Pageable pageable) {
        
        Page<FileEntity> files = fileService.searchFiles(keyword, fileType, caseId, pageable);
        return Result.success(files);
    }
}