package com.example.careplan_api.doselog.entity;

import com.example.careplan_api.schedule.entity.ScheduleTime;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "dose_log",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"schedule_time_id", "dose_date"}
        )
    }
)
public class DoseLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "schedule_time_id", nullable = false)
    private ScheduleTime scheduleTime;

    @Column(nullable = false)
    private LocalDate doseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DoseStatus status;

    private LocalDateTime takenAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ScheduleTime getScheduleTime() {
        return scheduleTime;
    }

    public void setScheduleTime(ScheduleTime scheduleTime) {
        this.scheduleTime = scheduleTime;
    }

    public LocalDate getDoseDate() {
        return doseDate;
    }

    public void setDoseDate(LocalDate doseDate) {
        this.doseDate = doseDate;
    }

    public DoseStatus getStatus() {
        return status;
    }

    public void setStatus(DoseStatus status) {
        this.status = status;
    }

    public LocalDateTime getTakenAt() {
        return takenAt;
    }

    public void setTakenAt(LocalDateTime takenAt) {
        this.takenAt = takenAt;
    }
}