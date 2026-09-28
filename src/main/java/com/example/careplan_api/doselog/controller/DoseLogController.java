package com.example.careplan_api.doselog.controller;

import com.example.careplan_api.doselog.entity.DoseLog;
import com.example.careplan_api.doselog.service.DoseLogService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dose-logs")
public class DoseLogController {

    private final DoseLogService doseLogService;

    public DoseLogController(DoseLogService doseLogService) {
        this.doseLogService = doseLogService;
    }

    @PostMapping
    public ResponseEntity<DoseLog> createDoseLog(
            @RequestParam Long scheduleTimeId,
            @RequestParam LocalDate doseDate,
            @RequestParam String status) {

        DoseLog doseLog = doseLogService.createDoseLog(
                scheduleTimeId,
                doseDate,
                status
        );

        return new ResponseEntity<>(
                doseLog,
                HttpStatus.CREATED
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoseLog> getDoseLogById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                doseLogService.getDoseLogById(id)
        );
    }
}