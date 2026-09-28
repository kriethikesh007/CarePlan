package com.example.careplan_api.schedule.service;

import com.example.careplan_api.schedule.entity.ScheduleTime;

import java.util.List;

public interface ScheduleTimeService {

    ScheduleTime addScheduleTime(Long scheduleId, ScheduleTime scheduleTime);

    List<ScheduleTime> getScheduleTimes(Long scheduleId);

    void deleteScheduleTime(Long id);
}