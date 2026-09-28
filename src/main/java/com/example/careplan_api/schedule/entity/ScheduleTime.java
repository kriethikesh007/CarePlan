package com.example.careplan_api.schedule.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

@Entity
@Table(
    name = "schedule_time",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"schedule_id", "dose_time"}
        )
    }
)
public class ScheduleTime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "schedule_id", nullable = false)
    @JsonIgnore
    private Schedule schedule;

    @NotNull
    private LocalTime doseTime;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Schedule getSchedule() {
        return schedule;
    }

    public void setSchedule(Schedule schedule) {
        this.schedule = schedule;
    }

    public LocalTime getDoseTime() {
        return doseTime;
    }

    public void setDoseTime(LocalTime doseTime) {
        this.doseTime = doseTime;
    }
}