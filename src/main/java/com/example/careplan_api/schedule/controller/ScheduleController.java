package com.example.careplan_api.schedule.controller;

import com.example.careplan_api.schedule.entity.Schedule;
import com.example.careplan_api.schedule.service.ScheduleService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/schedules")
public class ScheduleController {

    private final ScheduleService scheduleService;

    public ScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @PostMapping
    public ResponseEntity<Schedule> createSchedule(
            @Valid @RequestBody Schedule schedule) {

        Schedule createdSchedule =
                scheduleService.createSchedule(schedule);

        return new ResponseEntity<>(
                createdSchedule,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Schedule>> getAllSchedules() {

        List<Schedule> schedules =
                scheduleService.getAllSchedules();

        return ResponseEntity.ok(schedules);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Schedule> getScheduleById(
            @PathVariable Long id) {

        Schedule schedule =
                scheduleService.getScheduleById(id);

        return ResponseEntity.ok(schedule);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Schedule> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody Schedule schedule) {

        Schedule updatedSchedule =
                scheduleService.updateSchedule(id, schedule);

        return ResponseEntity.ok(updatedSchedule);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchedule(
            @PathVariable Long id) {

        scheduleService.deleteSchedule(id);

        return ResponseEntity.noContent().build();
    }
}