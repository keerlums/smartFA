package com.smartfa.hub.service;

import com.smartfa.hub.entity.Task;
import com.smartfa.hub.dto.SubTaskDto;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import static com.smartfa.hub.entity.Task.TaskType.*;

/**
 * 任务分解服务
 */
@Service
public class TaskDecompositionService {

    /**
     * 智能分解任务
     */
    public List<SubTaskDto> decomposeTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        switch (task.getType()) {
            case IMAGE_ANALYSIS:
                subTasks.addAll(decomposeImageAnalysisTask(task));
                break;
            case DOCUMENT_ANALYSIS:
                subTasks.addAll(decomposeDocumentAnalysisTask(task));
                break;
            case MULTI_MODAL_FUSION:
                subTasks.addAll(decomposeMultimodalAnalysisTask(task));
                break;
            case FAILURE_ANALYSIS:
                subTasks.addAll(decomposeFailureAnalysisTask(task));
                break;
            default:
                subTasks.addAll(decomposeGenericTask(task));
                break;
        }
        
        return subTasks;
    }

    /**
     * 分解图像分析任务
     */
    private List<SubTaskDto> decomposeImageAnalysisTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        // 预处理任务
        SubTaskDto preprocessing = SubTaskDto.builder()
                .name("图像预处理")
                .type("IMAGE_PREPROCESSING")
                .description("图像去噪、增强、标准化")
                .agentType("IMAGE_PROCESSING")
                .priority("1")
                .estimatedDuration(30)
                .build();
        subTasks.add(preprocessing);
        
        // 特征提取任务
        SubTaskDto featureExtraction = SubTaskDto.builder()
                .name("特征提取")
                .type("FEATURE_EXTRACTION")
                .description("提取图像的关键特征")
                .agentType("IMAGE_ANALYSIS")
                .priority("2")
                .estimatedDuration(60)
                .dependencies(List.of(preprocessing.getId()))
                .build();
        subTasks.add(featureExtraction);
        
        // 模式识别任务
        SubTaskDto patternRecognition = SubTaskDto.builder()
                .name("模式识别")
                .type("PATTERN_RECOGNITION")
                .description("识别失效模式和特征")
                .agentType("PATTERN_RECOGNITION")
                .priority("3")
                .estimatedDuration(45)
                .dependencies(List.of(featureExtraction.getId()))
                .build();
        subTasks.add(patternRecognition);
        
        // 结果验证任务
        SubTaskDto validation = SubTaskDto.builder()
                .name("结果验证")
                .type("RESULT_VALIDATION")
                .description("验证分析结果的准确性")
                .agentType("VALIDATION")
                .priority("4")
                .estimatedDuration(20)
                .dependencies(List.of(patternRecognition.getId()))
                .build();
        subTasks.add(validation);
        
        return subTasks;
    }

    /**
     * 分解文档分析任务
     */
    private List<SubTaskDto> decomposeDocumentAnalysisTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        // 文档解析任务
        SubTaskDto parsing = SubTaskDto.builder()
                .name("文档解析")
                .type("DOCUMENT_PARSING")
                .description("解析文档结构和内容")
                .agentType("DOCUMENT_PROCESSING")
                .priority("1")
                .estimatedDuration(25)
                .build();
        subTasks.add(parsing);
        
        // 信息提取任务
        SubTaskDto extraction = SubTaskDto.builder()
                .name("信息提取")
                .type("INFORMATION_EXTRACTION")
                .description("提取关键信息和数据")
                .agentType("NLP_PROCESSING")
                .priority("2")
                .estimatedDuration(40)
                .dependencies(List.of(parsing.getId()))
                .build();
        subTasks.add(extraction);
        
        // 语义分析任务
        SubTaskDto semanticAnalysis = SubTaskDto.builder()
                .name("语义分析")
                .type("SEMANTIC_ANALYSIS")
                .description("分析文档语义和关联")
                .agentType("SEMANTIC_ANALYSIS")
                .priority("3")
                .estimatedDuration(50)
                .dependencies(List.of(extraction.getId()))
                .build();
        subTasks.add(semanticAnalysis);
        
        return subTasks;
    }

    /**
     * 分解多模态分析任务
     */
    private List<SubTaskDto> decomposeMultimodalAnalysisTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        // 数据融合任务
        SubTaskDto dataFusion = SubTaskDto.builder()
                .name("多模态数据融合")
                .type("DATA_FUSION")
                .description("融合不同模态的数据")
                .agentType("DATA_FUSION")
                .priority("1")
                .estimatedDuration(60)
                .build();
        subTasks.add(dataFusion);
        
        // 联合分析任务
        SubTaskDto jointAnalysis = SubTaskDto.builder()
                .name("联合分析")
                .type("JOINT_ANALYSIS")
                .description("跨模态联合分析")
                .agentType("MULTIMODAL_ANALYSIS")
                .priority("2")
                .estimatedDuration(90)
                .dependencies(List.of(dataFusion.getId()))
                .build();
        subTasks.add(jointAnalysis);
        
        // 综合评估任务
        SubTaskDto comprehensiveEvaluation = SubTaskDto.builder()
                .name("综合评估")
                .type("COMPREHENSIVE_EVALUATION")
                .description("综合评估分析结果")
                .agentType("EVALUATION")
                .priority("3")
                .estimatedDuration(30)
                .dependencies(List.of(jointAnalysis.getId()))
                .build();
        subTasks.add(comprehensiveEvaluation);
        
        return subTasks;
    }

    /**
     * 分解失效分析任务
     */
    private List<SubTaskDto> decomposeFailureAnalysisTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        // 初步分析任务
        SubTaskDto preliminaryAnalysis = SubTaskDto.builder()
                .name("初步分析")
                .type("PRELIMINARY_ANALYSIS")
                .description("进行初步的失效分析")
                .agentType("FAILURE_ANALYSIS")
                .priority("1")
                .estimatedDuration(45)
                .build();
        subTasks.add(preliminaryAnalysis);
        
        // 深度分析任务
        SubTaskDto deepAnalysis = SubTaskDto.builder()
                .name("深度分析")
                .type("DEEP_ANALYSIS")
                .description("进行深度的失效机理分析")
                .agentType("DEEP_ANALYSIS")
                .priority("2")
                .estimatedDuration(120)
                .dependencies(List.of(preliminaryAnalysis.getId()))
                .build();
        subTasks.add(deepAnalysis);
        
        // 根因分析任务
        SubTaskDto rootCauseAnalysis = SubTaskDto.builder()
                .name("根因分析")
                .type("ROOT_CAUSE_ANALYSIS")
                .description("分析失效的根本原因")
                .agentType("ROOT_CAUSE_ANALYSIS")
                .priority("3")
                .estimatedDuration(80)
                .dependencies(List.of(deepAnalysis.getId()))
                .build();
        subTasks.add(rootCauseAnalysis);
        
        // 改进建议任务
        SubTaskDto improvementSuggestions = SubTaskDto.builder()
                .name("改进建议")
                .type("IMPROVEMENT_SUGGESTIONS")
                .description("提供改进建议")
                .agentType("EXPERIENCE_BASED")
                .priority("4")
                .estimatedDuration(40)
                .dependencies(List.of(rootCauseAnalysis.getId()))
                .build();
        subTasks.add(improvementSuggestions);
        
        return subTasks;
    }

    /**
     * 分解通用任务
     */
    private List<SubTaskDto> decomposeGenericTask(Task task) {
        List<SubTaskDto> subTasks = new ArrayList<>();
        
        // 数据准备任务
        SubTaskDto dataPreparation = SubTaskDto.builder()
                .name("数据准备")
                .type("DATA_PREPARATION")
                .description("准备分析所需的数据")
                .agentType("DATA_PROCESSING")
                .priority("1")
                .estimatedDuration(30)
                .build();
        subTasks.add(dataPreparation);
        
        // 核心分析任务
        SubTaskDto coreAnalysis = SubTaskDto.builder()
                .name("核心分析")
                .type("CORE_ANALYSIS")
                .description("执行核心分析任务")
                .agentType("GENERAL_ANALYSIS")
                .priority("2")
                .estimatedDuration(60)
                .dependencies(List.of(dataPreparation.getId()))
                .build();
        subTasks.add(coreAnalysis);
        
        // 结果整理任务
        SubTaskDto resultOrganization = SubTaskDto.builder()
                .name("结果整理")
                .type("RESULT_ORGANIZATION")
                .description("整理和格式化分析结果")
                .agentType("RESULT_PROCESSING")
                .priority("3")
                .estimatedDuration(20)
                .dependencies(List.of(coreAnalysis.getId()))
                .build();
        subTasks.add(resultOrganization);
        
        return subTasks;
    }
}