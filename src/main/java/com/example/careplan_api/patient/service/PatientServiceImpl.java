package com.example.careplan_api.patient.service;

import com.example.careplan_api.patient.entity.Patient;
import com.example.careplan_api.patient.repository.PatientRepository;
import com.example.careplan_api.patient.exception.PatientNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;

    public PatientServiceImpl(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @Override
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }

    @Override
    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new PatientNotFoundException(
                        "Patient not found with id: " + id));
    }

    @Override
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    @Override
    public Patient updatePatient(Long id, Patient patient) {
        Patient existingPatient = getPatientById(id);

        existingPatient.setName(patient.getName());
        existingPatient.setAge(patient.getAge());
        existingPatient.setGender(patient.getGender());
        existingPatient.setPhoneNumber(patient.getPhoneNumber());
        existingPatient.setEmergencyContactName(patient.getEmergencyContactName());
        existingPatient.setEmergencyContactNumber(patient.getEmergencyContactNumber());
        existingPatient.setWeight(patient.getWeight());
        existingPatient.setHeight(patient.getHeight());

        return patientRepository.save(existingPatient);
    }

    @Override
    public void deletePatient(Long id) {
        Patient existingPatient = getPatientById(id);
        patientRepository.delete(existingPatient);
    }
}