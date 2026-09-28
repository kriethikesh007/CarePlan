package com.example.careplan_api.patient.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.careplan_api.patient.entity.Patient;

public interface PatientRepository extends JpaRepository<Patient, Long> {

}