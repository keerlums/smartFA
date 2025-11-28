package com.smartfa.cluster.repository;

import com.smartfa.cluster.entity.Agent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 智能体数据访问接口
 * 
 * @author SmartFA Team
 */
@Repository
public interface AgentRepository extends JpaRepository<Agent, Long> {
}