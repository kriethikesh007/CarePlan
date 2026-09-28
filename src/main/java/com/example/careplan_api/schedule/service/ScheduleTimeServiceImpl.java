package com.example.careplan_api.schedule.service;

import com.example.careplan_api.schedule.entity.Schedule;
import com.example.careplan_api.schedule.entity.ScheduleTime;
import com.example.careplan_api.schedule.exception.ScheduleNotFoundException;
import com.example.careplan_api.schedule.repository.ScheduleRepository;
import com.example.careplan_api.schedule.repository.ScheduleTimeRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleTimeServiceImpl implements ScheduleTimeService {

    private final ScheduleTimeRepository scheduleTimeRepository;
    private final ScheduleRepository scheduleRepository;

    public ScheduleTimeServiceImpl(
            ScheduleTimeRepository scheduleTimeRepository,
            ScheduleRepository scheduleRepository) {

        this.scheduleTimeRepository = scheduleTimeRepository;
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    public ScheduleTime addScheduleTime(Long scheduleId, ScheduleTime scheduleTime) {

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ScheduleNotFoundException(
                        "Schedule not found with id: " + scheduleId));

        scheduleTime.setSchedule(schedule);

        return scheduleTimeRepository.save(scheduleTime);
    }

    @Override
    public List<ScheduleTime> getScheduleTimes(Long scheduleId) {

        if (!scheduleRepository.existsById(scheduleId)) {
            throw new ScheduleNotFoundException(
                    "Schedule not found with id: " + scheduleId);
        }

        return scheduleTimeRepository.findByScheduleId(scheduleId);
    }

    @Override
    public void deleteScheduleTime(Long id) {

        if (!scheduleTimeRepository.existsById(id)) {
            throw new RuntimeException(
                    "Schedule time not found with id: " + id);
        }

        scheduleTimeRepository.deleteById(id);
    }
}