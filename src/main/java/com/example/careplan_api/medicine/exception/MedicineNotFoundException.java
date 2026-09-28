package com.example.careplan_api.medicine.exception;

public class MedicineNotFoundException extends RuntimeException {

    public MedicineNotFoundException(String message) {
        super(message);
    }
}