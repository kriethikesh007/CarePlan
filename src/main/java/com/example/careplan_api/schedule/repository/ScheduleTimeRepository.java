package com.example.careplan_api.schedule.repository;

import com.example.careplan_api.schedule.entity.ScheduleTime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleTimeRepository
        extends JpaRepository<ScheduleTime, Long> {

    List<ScheduleTime> findByScheduleId(Long scheduleId);
}