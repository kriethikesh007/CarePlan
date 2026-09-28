package com.example.careplan_api.exception;

import com.example.careplan_api.patient.exception.PatientNotFoundException;
import com.example.careplan_api.medicine.exception.MedicineNotFoundException;
import com.example.careplan_api.schedule.exception.ScheduleNotFoundException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.careplan_api.doselog.exception.DoseAlreadyLoggedException;
import com.example.careplan_api.doselog.exception.DoseLogNotFoundException;
import com.example.careplan_api.schedule.exception.ScheduleTimeNotFoundException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PatientNotFoundException.class)
    public ResponseEntity<Map<String, String>> handlePatientNotFound(
            PatientNotFoundException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MedicineNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleMedicineNotFound(
            MedicineNotFoundException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ScheduleNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleScheduleNotFound(
            ScheduleNotFoundException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DoseAlreadyLoggedException.class)
    public ResponseEntity<Map<String, String>> handleDoseAlreadyLogged(
            DoseAlreadyLoggedException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.CONFLICT);
    }

    @ExceptionHandler(DoseLogNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleDoseLogNotFound(
            DoseLogNotFoundException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(ScheduleTimeNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleScheduleTimeNotFound(
            ScheduleTimeNotFoundException exception) {

        Map<String, String> response = new HashMap<>();

        response.put("message", exception.getMessage());

        return new ResponseEntity<>(
                response,
                HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(
            MethodArgumentNotValidException exception) {

        Map<String, String> errors = new HashMap<>();

        exception.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));

        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}