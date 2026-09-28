package com.example.careplan_api.schedule.service;

import com.example.careplan_api.schedule.entity.Schedule;

import java.util.List;

public interface ScheduleService {

    Schedule createSchedule(Schedule schedule);

    Schedule getScheduleById(Long id);

    List<Schedule> getAllSchedules();

    Schedule updateSchedule(Long id, Schedule schedule);

    void deleteSchedule(Long id);
}