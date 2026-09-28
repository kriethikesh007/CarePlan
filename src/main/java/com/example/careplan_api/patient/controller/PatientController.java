package com.example.careplan_api.patient.controller;

import com.example.careplan_api.patient.entity.Patient;
import com.example.careplan_api.patient.service.PatientService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @PostMapping
    public ResponseEntity<Patient> createPatient(
            @Valid @RequestBody Patient patient) {

        Patient createdPatient = patientService.createPatient(patient);

        return new ResponseEntity<>(createdPatient, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Patient>> getAllPatients() {

        List<Patient> patients = patientService.getAllPatients();

        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatientById(
            @PathVariable Long id) {

        Patient patient = patientService.getPatientById(id);

        return ResponseEntity.ok(patient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody Patient patient) {

        Patient updatedPatient = patientService.updatePatient(id, patient);

        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable Long id) {

        patientService.deletePatient(id);

        return ResponseEntity.noContent().build();
    }
}