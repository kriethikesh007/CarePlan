package com.example.careplan_api.patient.service;

import com.example.careplan_api.patient.entity.Patient;

import java.util.List;

public interface PatientService {

    Patient createPatient(Patient patient);

    Patient getPatientById(Long id);

    List<Patient> getAllPatients();

    Patient updatePatient(Long id, Patient patient);

    void deletePatient(Long id);
}