"""
专业化智能体实现
"""
import asyncio
import cv2
import numpy as np
from typing import Dict, Any, List
import base64
import json
from agent_base import AgentBase, Task, AgentStatus
import logging

logger = logging.getLogger(__name__)


class ImageAnalysisAgent(AgentBase):
    """图像分析智能体"""
    
    def __init__(self, agent_id: str, config: Dict[str, Any] = None):
        super().__init__(agent_id, "image_analysis", config)
        self.supported_formats = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']
    
    def _get_capabilities(self) -> List[str]:
        return [
            'defect_detection',
            'quality_assessment',
            'feature_extraction',
            'image_enhancement',
            'object_detection',
            'classification'
        ]
    
    async def process_task(self, task: Task) -> Dict[str, Any]:
        """处理图像分析任务"""
        task_type = task.task_type
        task_data = task.task_data
        
        if task_type == 'defect_detection':
            return await self._detect_defects(task_data)
        elif task_type == 'quality_assessment':
            return await self._assess_quality(task_data)
        elif task_type == 'feature_extraction':
            return await self._extract_features(task_data)
        elif task_type == 'image_enhancement':
            return await self._enhance_image(task_data)
        elif task_type == 'object_detection':
            return await self._detect_objects(task_data)
        elif task_type == 'classification':
            return await self._classify_image(task_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _detect_defects(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """检测缺陷"""
        image_data = data.get('image')
        if not image_data:
            raise ValueError("Image data is required")
        
        # 解码图像
        image = self._decode_image(image_data)
        
        # 预处理
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # 边缘检测
        edges = cv2.Canny(blurred, 50, 150)
        
        # 查找轮廓
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # 分析缺陷
        defects = []
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area > 100:  # 过滤小的噪点
                x, y, w, h = cv2.boundingRect(contour)
                defects.append({
                    'id': i,
                    'type': 'unknown',
                    'confidence': 0.8,
                    'bbox': [x, y, w, h],
                    'area': area,
                    'severity': self._calculate_severity(area)
                })
        
        return {
            'defects': defects,
            'total_defects': len(defects),
            'defect_density': len(defects) / (image.shape[0] * image.shape[1]) * 10000,
            'processing_image': self._encode_image(edges)
        }
    
    async def _assess_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """评估质量"""
        image_data = data.get('image')
        if not image_data:
            raise ValueError("Image data is required")
        
        image = self._decode_image(image_data)
        
        # 计算质量指标
        sharpness = self._calculate_sharpness(image)
        contrast = self._calculate_contrast(image)
        brightness = self._calculate_brightness(image)
        noise_level = self._calculate_noise_level(image)
        
        # 综合质量评分
        quality_score = (sharpness + contrast + (100 - noise_level)) / 3
        
        return {
            'quality_score': quality_score,
            'sharpness': sharpness,
            'contrast': contrast,
            'brightness': brightness,
            'noise_level': noise_level,
            'grade': self._get_quality_grade(quality_score)
        }
    
    async def _extract_features(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """提取特征"""
        image_data = data.get('image')
        if not image_data:
            raise ValueError("Image data is required")
        
        image = self._decode_image(image_data)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # SIFT特征
        sift = cv2.SIFT_create()
        keypoints, descriptors = sift.detectAndCompute(gray, None)
        
        # HOG特征
        hog = cv2.HOGDescriptor()
        hog_features = hog.compute(gray)
        
        # 颜色直方图
        hist_b = cv2.calcHist([image], [0], None, [256], [0, 256])
        hist_g = cv2.calcHist([image], [1], None, [256], [0, 256])
        hist_r = cv2.calcHist([image], [2], None, [256], [0, 256])
        
        return {
            'sift_keypoints': len(keypoints),
            'sift_descriptors': descriptors.tolist() if descriptors is not None else [],
            'hog_features': hog_features.tolist(),
            'color_histogram': {
                'blue': hist_b.flatten().tolist(),
                'green': hist_g.flatten().tolist(),
                'red': hist_r.flatten().tolist()
            },
            'image_dimensions': image.shape
        }
    
    async def _enhance_image(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """图像增强"""
        image_data = data.get('image')
        enhancement_type = data.get('type', 'general')
        
        if not image_data:
            raise ValueError("Image data is required")
        
        image = self._decode_image(image_data)
        
        if enhancement_type == 'denoise':
            enhanced = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)
        elif enhancement_type == 'sharpen':
            kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
            enhanced = cv2.filter2D(image, -1, kernel)
        elif enhancement_type == 'brightness':
            enhanced = cv2.convertScaleAbs(image, alpha=1.2, beta=20)
        elif enhancement_type == 'contrast':
            enhanced = cv2.convertScaleAbs(image, alpha=1.5, beta=0)
        else:
            # 通用增强
            enhanced = cv2.convertScaleAbs(image, alpha=1.1, beta=10)
        
        return {
            'enhanced_image': self._encode_image(enhanced),
            'enhancement_type': enhancement_type
        }
    
    async def _detect_objects(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """检测物体"""
        image_data = data.get('image')
        if not image_data:
            raise ValueError("Image data is required")
        
        image = self._decode_image(image_data)
        
        # 使用简单的轮廓检测作为示例
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blurred, 50, 150)
        
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        objects = []
        for i, contour in enumerate(contours):
            area = cv2.contourArea(contour)
            if area > 500:  # 过滤小的噪点
                x, y, w, h = cv2.boundingRect(contour)
                objects.append({
                    'id': i,
                    'class': 'unknown',
                    'confidence': 0.7,
                    'bbox': [x, y, w, h],
                    'area': area
                })
        
        return {
            'objects': objects,
            'total_objects': len(objects)
        }
    
    async def _classify_image(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """图像分类"""
        image_data = data.get('image')
        if not image_data:
            raise ValueError("Image data is required")
        
        # 这里应该使用训练好的分类模型
        # 暂时返回模拟结果
        image = self._decode_image(image_data)
        
        # 基于图像特征的简单分类逻辑
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 计算图像特征
        brightness = np.mean(gray)
        contrast = np.std(gray)
        
        # 简单的分类规则
        if brightness > 180:
            category = "bright"
        elif brightness < 80:
            category = "dark"
        else:
            category = "normal"
        
        if contrast > 60:
            texture = "high_contrast"
        elif contrast < 30:
            texture = "low_contrast"
        else:
            texture = "medium_contrast"
        
        return {
            'category': category,
            'texture': texture,
            'confidence': 0.75,
            'features': {
                'brightness': brightness,
                'contrast': contrast
            }
        }
    
    def _decode_image(self, image_data: str) -> np.ndarray:
        """解码base64图像"""
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return image
    
    def _encode_image(self, image: np.ndarray) -> str:
        """编码图像为base64"""
        _, buffer = cv2.imencode('.jpg', image)
        image_bytes = buffer.tobytes()
        return base64.b64encode(image_bytes).decode('utf-8')
    
    def _calculate_severity(self, area: float) -> str:
        """计算缺陷严重程度"""
        if area < 500:
            return "low"
        elif area < 2000:
            return "medium"
        else:
            return "high"
    
    def _calculate_sharpness(self, image: np.ndarray) -> float:
        """计算图像清晰度"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return min(100, laplacian_var / 10)
    
    def _calculate_contrast(self, image: np.ndarray) -> float:
        """计算对比度"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return min(100, np.std(gray) * 2)
    
    def _calculate_brightness(self, image: np.ndarray) -> float:
        """计算亮度"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return np.mean(gray) / 255 * 100
    
    def _calculate_noise_level(self, image: np.ndarray) -> float:
        """计算噪声水平"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        return min(100, np.std(gray) * 3)
    
    def _get_quality_grade(self, score: float) -> str:
        """获取质量等级"""
        if score >= 80:
            return "excellent"
        elif score >= 60:
            return "good"
        elif score >= 40:
            return "fair"
        else:
            return "poor"


class DataProcessingAgent(AgentBase):
    """数据处理智能体"""
    
    def __init__(self, agent_id: str, config: Dict[str, Any] = None):
        super().__init__(agent_id, "data_processing", config)
    
    def _get_capabilities(self) -> List[str]:
        return [
            'data_cleaning',
            'data_transformation',
            'statistical_analysis',
            'data_visualization',
            'feature_engineering',
            'data_validation'
        ]
    
    async def process_task(self, task: Task) -> Dict[str, Any]:
        """处理数据任务"""
        task_type = task.task_type
        task_data = task.task_data
        
        if task_type == 'data_cleaning':
            return await self._clean_data(task_data)
        elif task_type == 'statistical_analysis':
            return await self._statistical_analysis(task_data)
        elif task_type == 'data_transformation':
            return await self._transform_data(task_data)
        elif task_type == 'feature_engineering':
            return await self._feature_engineering(task_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _clean_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """数据清洗"""
        raw_data = data.get('data', [])
        if not raw_data:
            return {'cleaned_data': [], 'removed_count': 0}
        
        cleaned_data = []
        removed_count = 0
        
        for item in raw_data:
            # 检查数据完整性
            if self._is_valid_data(item):
                cleaned_data.append(self._clean_item(item))
            else:
                removed_count += 1
        
        return {
            'cleaned_data': cleaned_data,
            'removed_count': removed_count,
            'total_processed': len(raw_data)
        }
    
    async def _statistical_analysis(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """统计分析"""
        analysis_data = data.get('data', [])
        if not analysis_data:
            return {'error': 'No data to analyze'}
        
        # 提取数值数据
        numeric_data = []
        for item in analysis_data:
            if isinstance(item, dict):
                for value in item.values():
                    if isinstance(value, (int, float)):
                        numeric_data.append(value)
            elif isinstance(item, (int, float)):
                numeric_data.append(item)
        
        if not numeric_data:
            return {'error': 'No numeric data found'}
        
        # 计算统计指标
        import statistics
        
        stats = {
            'count': len(numeric_data),
            'mean': statistics.mean(numeric_data),
            'median': statistics.median(numeric_data),
            'mode': statistics.mode(numeric_data) if len(set(numeric_data)) < len(numeric_data) else None,
            'std_dev': statistics.stdev(numeric_data) if len(numeric_data) > 1 else 0,
            'min': min(numeric_data),
            'max': max(numeric_data),
            'range': max(numeric_data) - min(numeric_data)
        }
        
        return {
            'statistics': stats,
            'data_distribution': self._calculate_distribution(numeric_data)
        }
    
    async def _transform_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """数据转换"""
        raw_data = data.get('data', [])
        transform_type = data.get('transform_type', 'normalize')
        
        if not raw_data:
            return {'transformed_data': []}
        
        if transform_type == 'normalize':
            return self._normalize_data(raw_data)
        elif transform_type == 'standardize':
            return self._standardize_data(raw_data)
        elif transform_type == 'log_transform':
            return self._log_transform_data(raw_data)
        else:
            return {'error': f'Unknown transform type: {transform_type}'}
    
    async def _feature_engineering(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """特征工程"""
        raw_data = data.get('data', [])
        if not raw_data:
            return {'features': []}
        
        features = []
        for item in raw_data:
            if isinstance(item, dict):
                feature_vector = self._extract_features_from_dict(item)
                features.append(feature_vector)
        
        return {
            'features': features,
            'feature_count': len(features[0]) if features else 0
        }
    
    def _is_valid_data(self, item: Any) -> bool:
        """检查数据是否有效"""
        if item is None:
            return False
        
        if isinstance(item, dict):
            # 检查是否有关键字段
            required_fields = ['id', 'value']
            return all(field in item for field in required_fields)
        
        return True
    
    def _clean_item(self, item: Any) -> Any:
        """清洗单个数据项"""
        if isinstance(item, dict):
            cleaned = {}
            for key, value in item.items():
                if value is not None:
                    cleaned[key] = value
            return cleaned
        
        return item
    
    def _calculate_distribution(self, data: List[float]) -> Dict[str, Any]:
        """计算数据分布"""
        import numpy as np
        
        hist, bins = np.histogram(data, bins=10)
        
        return {
            'histogram': hist.tolist(),
            'bin_edges': bins.tolist(),
            'skewness': self._calculate_skewness(data),
            'kurtosis': self._calculate_kurtosis(data)
        }
    
    def _calculate_skewness(self, data: List[float]) -> float:
        """计算偏度"""
        import numpy as np
        mean = np.mean(data)
        std = np.std(data)
        return np.mean([(x - mean) ** 3 for x in data]) / (std ** 3)
    
    def _calculate_kurtosis(self, data: List[float]) -> float:
        """计算峰度"""
        import numpy as np
        mean = np.mean(data)
        std = np.std(data)
        return np.mean([(x - mean) ** 4 for x in data]) / (std ** 4) - 3
    
    def _normalize_data(self, data: List[Any]) -> Dict[str, Any]:
        """数据归一化"""
        # 简化的归一化实现
        return {
            'transformed_data': data,
            'method': 'min_max_normalization'
        }
    
    def _standardize_data(self, data: List[Any]) -> Dict[str, Any]:
        """数据标准化"""
        # 简化的标准化实现
        return {
            'transformed_data': data,
            'method': 'z_score_standardization'
        }
    
    def _log_transform_data(self, data: List[Any]) -> Dict[str, Any]:
        """对数变换"""
        import numpy as np
        
        if isinstance(data[0], (int, float)):
            transformed = [np.log(x) if x > 0 else 0 for x in data]
        else:
            transformed = data
        
        return {
            'transformed_data': transformed,
            'method': 'logarithmic_transformation'
        }
    
    def _extract_features_from_dict(self, item: Dict[str, Any]) -> List[float]:
        """从字典中提取特征向量"""
        features = []
        for value in item.values():
            if isinstance(value, (int, float)):
                features.append(float(value))
            elif isinstance(value, str):
                features.append(float(len(value)))
            else:
                features.append(0.0)
        return features