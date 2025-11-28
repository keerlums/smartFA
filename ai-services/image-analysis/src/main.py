"""
图像分析AI服务
提供失效分析相关的图像处理和分析功能
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import asyncio
import redis
import json
import cv2
import numpy as np
from PIL import Image
import io
import base64
from loguru import logger
from datetime import datetime

# 配置日志
logger.add("logs/image_analysis.log", rotation="10 MB", level="INFO")

app = FastAPI(
    title="图像分析AI服务",
    description="失效分析智能辅助平台 - 图像分析服务",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis连接
redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)

# 数据模型
class ImageAnalysisRequest(BaseModel):
    task_id: str
    analysis_type: str
    parameters: Dict[str, Any] = {}

class ImageAnalysisResult(BaseModel):
    task_id: str
    status: str
    results: Dict[str, Any]
    execution_time: float
    timestamp: str

class ImageEnhancementRequest(BaseModel):
    enhancement_type: str  # "denoise", "sharpen", "contrast", "brightness"
    parameters: Dict[str, Any] = {}

class DefectDetectionRequest(BaseModel):
    detection_type: str  # "crack", "corrosion", "void", "contamination"
    sensitivity: float = 0.5
    parameters: Dict[str, Any] = {}

# 图像分析核心功能
class ImageAnalyzer:
    def __init__(self):
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    async def analyze_image(self, image_data: bytes, analysis_type: str, parameters: Dict) -> Dict[str, Any]:
        """分析图像"""
        try:
            # 解码图像
            image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("无法解析图像")
            
            results = {}
            
            if analysis_type == "defect_detection":
                results = await self.detect_defects(image, parameters)
            elif analysis_type == "quality_assessment":
                results = await self.assess_quality(image, parameters)
            elif analysis_type == "dimensional_measurement":
                results = await self.measure_dimensions(image, parameters)
            elif analysis_type == "surface_analysis":
                results = await self.analyze_surface(image, parameters)
            elif analysis_type == "comparative_analysis":
                results = await self.comparative_analysis(image, parameters)
            else:
                raise ValueError(f"不支持的分析类型: {analysis_type}")
            
            return results
            
        except Exception as e:
            logger.error(f"图像分析失败: {str(e)}")
            raise
    
    async def detect_defects(self, image: np.ndarray, parameters: Dict) -> Dict[str, Any]:
        """缺陷检测"""
        defect_type = parameters.get("defect_type", "crack")
        sensitivity = parameters.get("sensitivity", 0.5)
        
        # 转换为灰度图
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        defects = []
        
        if defect_type == "crack":
            # 裂纹检测
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > sensitivity * 100:
                    x, y, w, h = cv2.boundingRect(contour)
                    defects.append({
                        "type": "crack",
                        "confidence": min(area / 1000, 1.0),
                        "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                        "area": float(area)
                    })
        
        elif defect_type == "corrosion":
            # 腐蚀检测
            hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
            # 定义腐蚀颜色范围（棕色/橙色）
            lower_corrosion = np.array([8, 50, 50])
            upper_corrosion = np.array([25, 255, 255])
            mask = cv2.inRange(hsv, lower_corrosion, upper_corrosion)
            
            contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                area = cv2.contourArea(contour)
                if area > sensitivity * 50:
                    x, y, w, h = cv2.boundingRect(contour)
                    defects.append({
                        "type": "corrosion",
                        "confidence": min(area / 500, 1.0),
                        "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                        "area": float(area)
                    })
        
        return {
            "defects": defects,
            "total_defects": len(defects),
            "defect_density": len(defects) / (image.shape[0] * image.shape[1]) * 10000
        }
    
    async def assess_quality(self, image: np.ndarray, parameters: Dict) -> Dict[str, Any]:
        """质量评估"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 计算各种质量指标
        metrics = {}
        
        # 清晰度（拉普拉斯方差）
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        metrics["sharpness"] = float(laplacian_var)
        
        # 亮度统计
        metrics["brightness_mean"] = float(np.mean(gray))
        metrics["brightness_std"] = float(np.std(gray))
        
        # 对比度
        metrics["contrast"] = float(np.std(gray) / np.mean(gray) if np.mean(gray) > 0 else 0)
        
        # 信噪比估算
        noise = cv2.GaussianBlur(gray, (5, 5), 0)
        snr = np.mean(gray) / (np.std(gray - noise) + 1e-6)
        metrics["snr"] = float(snr)
        
        # 综合质量评分（0-100）
        quality_score = min(100, (
            min(laplacian_var / 100, 1) * 30 +
            min(snr / 10, 1) * 30 +
            min(metrics["contrast"] * 10, 1) * 20 +
            (1 - abs(metrics["brightness_mean"] - 128) / 128) * 20
        ))
        
        return {
            "quality_metrics": metrics,
            "overall_score": quality_score,
            "quality_grade": "优秀" if quality_score >= 80 else "良好" if quality_score >= 60 else "一般" if quality_score >= 40 else "差"
        }
    
    async def measure_dimensions(self, image: np.ndarray, parameters: Dict) -> Dict[str, Any]:
        """尺寸测量"""
        # 获取标定信息
        pixels_per_mm = parameters.get("pixels_per_mm", 1.0)
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 边缘检测
        edges = cv2.Canny(gray, 50, 150)
        
        # 查找轮廓
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        measurements = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:  # 过滤小轮廓
                # 计算边界框
                x, y, w, h = cv2.boundingRect(contour)
                
                # 计算实际尺寸
                width_mm = w / pixels_per_mm
                height_mm = h / pixels_per_mm
                area_mm2 = area / (pixels_per_mm ** 2)
                
                measurements.append({
                    "object_id": len(measurements),
                    "width_pixels": int(w),
                    "height_pixels": int(h),
                    "width_mm": round(width_mm, 3),
                    "height_mm": round(height_mm, 3),
                    "area_mm2": round(area_mm2, 3),
                    "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                })
        
        return {
            "measurements": measurements,
            "total_objects": len(measurements),
            "calibration": pixels_per_mm
        }
    
    async def analyze_surface(self, image: np.ndarray, parameters: Dict) -> Dict[str, Any]:
        """表面分析"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 表面粗糙度分析
        # 使用梯度计算表面纹理
        grad_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # 粗糙度指标
        roughness = np.mean(gradient_magnitude)
        texture_uniformity = 1.0 / (np.std(gradient_magnitude) + 1e-6)
        
        # 表面缺陷检测
        # 使用自适应阈值检测异常区域
        adaptive_thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2
        )
        
        contours, _ = cv2.findContours(adaptive_thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        surface_defects = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 50:
                x, y, w, h = cv2.boundingRect(contour)
                surface_defects.append({
                    "type": "surface_anomaly",
                    "area": float(area),
                    "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                })
        
        return {
            "surface_metrics": {
                "roughness": float(roughness),
                "texture_uniformity": float(texture_uniformity),
                "mean_intensity": float(np.mean(gray)),
                "intensity_std": float(np.std(gray))
            },
            "surface_defects": surface_defects,
            "defect_count": len(surface_defects)
        }
    
    async def comparative_analysis(self, image: np.ndarray, parameters: Dict) -> Dict[str, Any]:
        """对比分析"""
        reference_image_data = parameters.get("reference_image")
        if not reference_image_data:
            raise ValueError("对比分析需要提供参考图像")
        
        # 解码参考图像
        ref_image = cv2.imdecode(np.frombuffer(reference_image_data, np.uint8), cv2.IMREAD_COLOR)
        if ref_image is None:
            raise ValueError("无法解析参考图像")
        
        # 确保图像尺寸一致
        if image.shape != ref_image.shape:
            ref_image = cv2.resize(ref_image, (image.shape[1], image.shape[0]))
        
        # 计算差异
        diff = cv2.absdiff(image, ref_image)
        gray_diff = cv2.cvtColor(diff, cv2.COLOR_BGR2GRAY)
        
        # 差异统计
        mean_diff = np.mean(gray_diff)
        std_diff = np.std(gray_diff)
        max_diff = np.max(gray_diff)
        
        # 显著差异区域
        _, thresh_diff = cv2.threshold(gray_diff, mean_diff + std_diff, 255, cv2.THRESH_BINARY)
        contours, _ = cv2.findContours(thresh_diff, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        significant_differences = []
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 100:
                x, y, w, h = cv2.boundingRect(contour)
                significant_differences.append({
                    "area": float(area),
                    "bbox": {"x": int(x), "y": int(y), "width": int(w), "height": int(h)},
                    "intensity": float(np.mean(gray_diff[y:y+h, x:x+w]))
                })
        
        # 相似度评分（0-100）
        similarity_score = max(0, 100 - (mean_diff / 255) * 100)
        
        return {
            "similarity_score": similarity_score,
            "difference_metrics": {
                "mean_difference": float(mean_diff),
                "std_difference": float(std_diff),
                "max_difference": float(max_diff)
            },
            "significant_differences": significant_differences,
            "difference_count": len(significant_differences)
        }

# 全局分析器实例
analyzer = ImageAnalyzer()

# API端点
@app.get("/")
async def root():
    return {"message": "图像分析AI服务运行中", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze", response_model=ImageAnalysisResult)
async def analyze_image(
    request: ImageAnalysisRequest,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """分析图像"""
    start_time = datetime.now()
    
    try:
        # 验证文件类型
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="请上传图像文件")
        
        # 读取图像数据
        image_data = await file.read()
        
        # 更新任务状态
        await redis_client.set(f"task:{request.task_id}:status", "running")
        
        # 执行分析
        results = await analyzer.analyze_image(image_data, request.analysis_type, request.parameters)
        
        # 计算执行时间
        execution_time = (datetime.now() - start_time).total_seconds()
        
        # 构建结果
        result = ImageAnalysisResult(
            task_id=request.task_id,
            status="completed",
            results=results,
            execution_time=execution_time,
            timestamp=datetime.now().isoformat()
        )
        
        # 更新Redis中的结果
        await redis_client.setex(
            f"task:{request.task_id}:result",
            3600,  # 1小时过期
            json.dumps(result.dict())
        )
        
        return result
        
    except Exception as e:
        logger.error(f"图像分析失败: {str(e)}")
        await redis_client.set(f"task:{request.task_id}:status", "failed")
        await redis_client.set(f"task:{request.task_id}:error", str(e))
        
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/enhance")
async def enhance_image(
    enhancement_type: str,
    file: UploadFile = File(...),
    parameters: Dict[str, Any] = {}
):
    """图像增强"""
    try:
        # 读取图像
        image_data = await file.read()
        image = cv2.imdecode(np.frombuffer(image_data, np.uint8), cv2.IMREAD_COLOR)
        
        if image is None:
            raise ValueError("无法解析图像")
        
        enhanced_image = image.copy()
        
        if enhancement_type == "denoise":
            # 去噪
            enhanced_image = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        
        elif enhancement_type == "sharpen":
            # 锐化
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            enhanced_image = cv2.filter2D(image, -1, kernel)
        
        elif enhancement_type == "contrast":
            # 对比度增强
            alpha = parameters.get("alpha", 1.5)  # 对比度
            beta = parameters.get("beta", 0)      # 亮度
            enhanced_image = cv2.convertScaleAbs(image, alpha=alpha, beta=beta)
        
        elif enhancement_type == "brightness":
            # 亮度调整
            beta = parameters.get("beta", 50)
            enhanced_image = cv2.convertScaleAbs(image, alpha=1.0, beta=beta)
        
        # 编码为base64返回
        _, buffer = cv2.imencode('.jpg', enhanced_image)
        img_base64 = base64.b64encode(buffer).decode('utf-8')
        
        return {
            "enhanced_image": img_base64,
            "enhancement_type": enhancement_type,
            "parameters": parameters
        }
        
    except Exception as e:
        logger.error(f"图像增强失败: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/task/{task_id}/status")
async def get_task_status(task_id: str):
    """获取任务状态"""
    status = await redis_client.get(f"task:{task_id}:status")
    if not status:
        raise HTTPException(status_code=404, detail="任务不存在")
    
    result = {"task_id": task_id, "status": status}
    
    # 如果任务完成，返回结果
    if status == "completed":
        result_data = await redis_client.get(f"task:{task_id}:result")
        if result_data:
            result["result"] = json.loads(result_data)
    
    # 如果任务失败，返回错误信息
    elif status == "failed":
        error = await redis_client.get(f"task:{task_id}:error")
        if error:
            result["error"] = error
    
    return result

@app.get("/capabilities")
async def get_capabilities():
    """获取服务能力"""
    return {
        "supported_analysis_types": [
            "defect_detection",
            "quality_assessment", 
            "dimensional_measurement",
            "surface_analysis",
            "comparative_analysis"
        ],
        "supported_enhancements": [
            "denoise",
            "sharpen",
            "contrast",
            "brightness"
        ],
        "supported_formats": [".jpg", ".jpeg", ".png", ".bmp", ".tiff"],
        "max_file_size": "50MB"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )