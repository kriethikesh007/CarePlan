package com.example.careplan_api.schedule.repository;

import com.example.careplan_api.schedule.entity.Schedule;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

}