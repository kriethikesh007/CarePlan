package com.example.careplan_api.doselog.exception;

public class DoseAlreadyLoggedException extends RuntimeException {

    public DoseAlreadyLoggedException(String message) {
        super(message);
    }
}