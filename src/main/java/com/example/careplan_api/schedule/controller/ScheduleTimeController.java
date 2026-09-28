package com.example.careplan_api.schedule.controller;

import com.example.careplan_api.schedule.entity.ScheduleTime;
import com.example.careplan_api.schedule.service.ScheduleTimeService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleTimeController {

    private final ScheduleTimeService scheduleTimeService;

    public ScheduleTimeController(
            ScheduleTimeService scheduleTimeService) {

        this.scheduleTimeService = scheduleTimeService;
    }

    @PostMapping("/{scheduleId}/times")
    public ResponseEntity<ScheduleTime> addScheduleTime(
            @PathVariable Long scheduleId,
            @RequestBody ScheduleTime scheduleTime) {

        ScheduleTime createdScheduleTime =
                scheduleTimeService.addScheduleTime(
                        scheduleId,
                        scheduleTime);

        return new ResponseEntity<>(
                createdScheduleTime,
                HttpStatus.CREATED);
    }

    @GetMapping("/{scheduleId}/times")
    public ResponseEntity<List<ScheduleTime>> getScheduleTimes(
            @PathVariable Long scheduleId) {

        List<ScheduleTime> scheduleTimes =
                scheduleTimeService.getScheduleTimes(scheduleId);

        return ResponseEntity.ok(scheduleTimes);
    }

    @DeleteMapping("/times/{id}")
    public ResponseEntity<Void> deleteScheduleTime(
            @PathVariable Long id) {

        scheduleTimeService.deleteScheduleTime(id);

        return ResponseEntity.noContent().build();
    }
}