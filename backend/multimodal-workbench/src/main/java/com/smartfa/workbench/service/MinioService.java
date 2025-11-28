package com.smartfa.workbench.service;

import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.smartfa.workbench.config.MinioConfig;
import com.smartfa.workbench.config.MinioConfig;

import java.io.InputStream;
import java.util.concurrent.TimeUnit;

/**
 * MinIO文件存储服务
 */
@Service
public class MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinioConfig minioConfig;

    /**
     * 检查存储桶是否存在，不存在则创建
     */
    public void checkBucket() throws Exception {
        boolean found = minioClient.bucketExists(BucketExistsArgs.builder()
                .bucket(minioConfig.getBucketName())
                .build());
        
        if (!found) {
            minioClient.makeBucket(MakeBucketArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .build());
        }
    }

    /**
     * 上传文件
     */
    public String uploadFile(MultipartFile file, String objectName) throws Exception {
        checkBucket();
        
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
        }
        
        return objectName;
    }

    /**
     * 下载文件
     */
    public InputStream downloadFile(String objectName) throws Exception {
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .build()
        );
    }

    /**
     * 删除文件
     */
    public void deleteFile(String objectName) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .build()
        );
    }

    /**
     * 获取文件预览URL
     */
    public String getPreviewUrl(String objectName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .expiry(7, TimeUnit.DAYS)
                        .build()
        );
    }

    /**
     * 获取文件下载URL
     */
    public String getDownloadUrl(String objectName, String fileName) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .expiry(1, TimeUnit.HOURS)
                        .build()
        );
    }

    /**
     * 检查文件是否存在
     */
    public boolean fileExists(String objectName) throws Exception {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 获取文件信息
     */
    public StatObjectResponse getFileInfo(String objectName) throws Exception {
        return minioClient.statObject(
                StatObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .build()
        );
    }
}