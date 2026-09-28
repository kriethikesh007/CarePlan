package com.example.careplan_api.doselog.repository;

import com.example.careplan_api.doselog.entity.DoseLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DoseLogRepository extends JpaRepository<DoseLog, Long> {

    Optional<DoseLog> findByScheduleTimeIdAndDoseDate(
            Long scheduleTimeId,
            LocalDate doseDate
    );

    List<DoseLog> findByScheduleTimeScheduleIdAndDoseDateBetween(
            Long scheduleId,
            LocalDate startDate,
            LocalDate endDate
    );
}