package com.example.careplan_api.doselog.service;

import com.example.careplan_api.doselog.entity.DoseLog;

import java.time.LocalDate;
import java.util.List;

public interface DoseLogService {

    DoseLog createDoseLog(
            Long scheduleTimeId,
            LocalDate doseDate,
            String status
    );

    DoseLog getDoseLogById(Long id);

    List<DoseLog> getMissedDoseHistory(
            Long patientId,
            LocalDate startDate,
            LocalDate endDate
    );
}