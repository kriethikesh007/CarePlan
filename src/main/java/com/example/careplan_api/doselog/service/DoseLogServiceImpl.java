package com.example.careplan_api.doselog.service;

import com.example.careplan_api.doselog.entity.DoseLog;
import com.example.careplan_api.doselog.entity.DoseStatus;
import com.example.careplan_api.doselog.exception.DoseAlreadyLoggedException;
import com.example.careplan_api.doselog.exception.DoseLogNotFoundException;
import com.example.careplan_api.doselog.repository.DoseLogRepository;
import com.example.careplan_api.schedule.entity.ScheduleTime;
import com.example.careplan_api.schedule.exception.ScheduleTimeNotFoundException;
import com.example.careplan_api.schedule.repository.ScheduleTimeRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DoseLogServiceImpl implements DoseLogService {

    private final DoseLogRepository doseLogRepository;
    private final ScheduleTimeRepository scheduleTimeRepository;

    public DoseLogServiceImpl(
            DoseLogRepository doseLogRepository,
            ScheduleTimeRepository scheduleTimeRepository) {

        this.doseLogRepository = doseLogRepository;
        this.scheduleTimeRepository = scheduleTimeRepository;
    }

    @Override
    public DoseLog createDoseLog(
            Long scheduleTimeId,
            LocalDate doseDate,
            String status) {

        // 1. Verify ScheduleTime exists
        ScheduleTime scheduleTime =
                scheduleTimeRepository.findById(scheduleTimeId)
                        .orElseThrow(() ->
                                new ScheduleTimeNotFoundException(
                                        "Schedule time not found with id: "
                                                + scheduleTimeId));

        // 2. Check whether this exact dose slot was already logged
        if (doseLogRepository
                .findByScheduleTimeIdAndDoseDate(
                        scheduleTimeId,
                        doseDate)
                .isPresent()) {

            throw new DoseAlreadyLoggedException(
                    "Dose already logged for schedule time "
                            + scheduleTimeId
                            + " on "
                            + doseDate);
        }

        // 3. Convert status
        DoseStatus doseStatus;

        try {
            doseStatus = DoseStatus.valueOf(
                    status.toUpperCase());
        } catch (IllegalArgumentException exception) {

            throw new IllegalArgumentException(
                    "Invalid dose status. Use TAKEN or MISSED.");
        }

        // 4. Create DoseLog
        DoseLog doseLog = new DoseLog();

        doseLog.setScheduleTime(scheduleTime);
        doseLog.setDoseDate(doseDate);
        doseLog.setStatus(doseStatus);

        // 5. Store actual time only when dose was taken
        if (doseStatus == DoseStatus.TAKEN) {
            doseLog.setTakenAt(LocalDateTime.now());
        }

        return doseLogRepository.save(doseLog);
    }

    @Override
    public DoseLog getDoseLogById(Long id) {

        return doseLogRepository.findById(id)
                .orElseThrow(() ->
                        new DoseLogNotFoundException(
                                "Dose log not found with id: " + id));
    }

    @Override
    public List<DoseLog> getMissedDoseHistory(
            Long patientId,
            LocalDate startDate,
            LocalDate endDate) {

        /*
         * We will implement patient-based missed-dose
         * retrieval properly after adding the required
         * repository query.
         */
        throw new UnsupportedOperationException(
                "Missed-dose history will be implemented next.");
    }
}