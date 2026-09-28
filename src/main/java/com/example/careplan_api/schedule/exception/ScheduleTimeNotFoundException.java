package com.example.careplan_api.schedule.exception;

public class ScheduleTimeNotFoundException extends RuntimeException {

    public ScheduleTimeNotFoundException(String message) {
        super(message);
    }
}