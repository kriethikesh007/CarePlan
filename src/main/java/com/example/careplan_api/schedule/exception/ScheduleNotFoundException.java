package com.example.careplan_api.schedule.exception;

public class ScheduleNotFoundException extends RuntimeException {

    public ScheduleNotFoundException(String message) {
        super(message);
    }
}