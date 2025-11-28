package com.smartfa.workbench.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartfa.common.entity.FailureCase;
import com.smartfa.common.service.FailureCaseService;
import com.smartfa.common.vo.Result;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * 案例控制器测试类
 */
@WebMvcTest(CaseController.class)
class CaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FailureCaseService caseService;

    @Autowired
    private ObjectMapper objectMapper;

    private FailureCase testCase;

    @BeforeEach
    void setUp() {
        testCase = new FailureCase();
        testCase.setId(1L);
        testCase.setCaseNumber("FA202401010001");
        testCase.setTitle("测试案例");
        testCase.setDescription("这是一个测试案例");
        testCase.setProductName("测试产品");
        testCase.setProductModel("TM-001");
        testCase.setFailureDate(LocalDate.now());
        testCase.setFailureLocation("测试位置");
        testCase.setFailureMode("疲劳失效");
        testCase.setFailureMechanism("循环载荷");
        testCase.setSeverityLevel("中等");
        testCase.setStatus("PENDING");
        testCase.setCreatorId(1L);
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testGetCases_Success() throws Exception {
        // Given
        List<FailureCase> cases = Arrays.asList(testCase);
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<FailureCase> page =
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(1, 10, 1);
        page.setRecords(cases);
        when(caseService.getCasePage(anyInt(), anyInt(), anyString(), anyString(), 
                                     any(), any(), any(), any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/cases")
                .param("page", "1")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.records").isArray())
                .andExpect(jsonPath("$.data.records[0].caseNumber").value("FA202401010001"));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testGetCaseById_Success() throws Exception {
        // Given
        when(caseService.getCaseDetail(1L)).thenReturn(testCase);

        // When & Then
        mockMvc.perform(get("/api/cases/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.caseNumber").value("FA202401010001"))
                .andExpect(jsonPath("$.data.title").value("测试案例"));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testGetCaseById_NotFound() throws Exception {
        // Given
        when(caseService.getCaseDetail(999L)).thenReturn(null);

        // When & Then
        mockMvc.perform(get("/api/cases/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.message").value("案例不存在"));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testCreateCase_Success() throws Exception {
        // Given
        FailureCase newCase = new FailureCase();
        newCase.setTitle("新案例");
        newCase.setDescription("新创建的案例");
        
        when(caseService.createCase(any(FailureCase.class))).thenReturn(testCase);

        // When & Then
        mockMvc.perform(post("/api/cases")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCase)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.caseNumber").value("FA202401010001"));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testUpdateCase_Success() throws Exception {
        // Given
        FailureCase updateCase = new FailureCase();
        updateCase.setTitle("更新案例");
        updateCase.setDescription("更新后的案例描述");
        
        when(caseService.updateCase(any(FailureCase.class))).thenReturn(testCase);

        // When & Then
        mockMvc.perform(put("/api/cases/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateCase)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.caseNumber").value("FA202401010001"));
    }

    @Test
    @WithMockUser(roles = {"ADMIN"})
    void testDeleteCase_Success() throws Exception {
        // Given
        when(caseService.getCaseDetail(1L)).thenReturn(testCase);
        doNothing().when(caseService).deleteCase(1L);

        // When & Then
        mockMvc.perform(delete("/api/cases/1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testAssignCase_Success() throws Exception {
        // Given
        doNothing().when(caseService).assignCase(1L, 2L);

        // When & Then
        mockMvc.perform(put("/api/cases/1/assign")
                .with(csrf())
                .param("assigneeId", "2")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testUpdateCaseStatus_Success() throws Exception {
        // Given
        doNothing().when(caseService).updateCaseStatus(1L, "PROCESSING");

        // When & Then
        mockMvc.perform(put("/api/cases/1/status")
                .with(csrf())
                .param("status", "PROCESSING")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testGetCaseStatistics_Success() throws Exception {
        // Given
        when(caseService.getCaseStatistics()).thenReturn(java.util.Map.of(
            "totalCount", 100,
            "todayCount", 5,
            "monthCount", 25
        ));

        // When & Then
        mockMvc.perform(get("/api/cases/statistics")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.totalCount").value(100))
                .andExpect(jsonPath("$.data.todayCount").value(5));
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testGetRecentCases_Success() throws Exception {
        // Given
        List<FailureCase> recentCases = Arrays.asList(testCase);
        when(caseService.getRecentCases(5)).thenReturn(recentCases);

        // When & Then
        mockMvc.perform(get("/api/cases/recent")
                .param("limit", "5")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].caseNumber").value("FA202401010001"));
    }

    @Test
    void testGetCases_Unauthorized() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/cases")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = {"USER"})
    void testCreateCase_Forbidden() throws Exception {
        // Given
        FailureCase newCase = new FailureCase();
        newCase.setTitle("新案例");

        // When & Then
        mockMvc.perform(post("/api/cases")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(newCase)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = {"FA_ENGINEER"})
    void testCreateCase_ValidationError() throws Exception {
        // Given
        FailureCase invalidCase = new FailureCase();
        // Missing required fields

        // When & Then
        mockMvc.perform(post("/api/cases")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidCase)))
                .andExpect(status().isBadRequest());
    }
}