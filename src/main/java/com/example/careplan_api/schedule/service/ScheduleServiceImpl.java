package com.example.careplan_api.schedule.service;

import com.example.careplan_api.schedule.entity.Schedule;
import com.example.careplan_api.schedule.exception.ScheduleNotFoundException;
import com.example.careplan_api.schedule.repository.ScheduleRepository;
import com.example.careplan_api.patient.entity.Patient;
import com.example.careplan_api.patient.repository.PatientRepository;
import com.example.careplan_api.medicine.entity.Medicine;
import com.example.careplan_api.medicine.repository.MedicineRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final PatientRepository patientRepository;
    private final MedicineRepository medicineRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository, PatientRepository patientRepository,
            MedicineRepository medicineRepository) {
        this.scheduleRepository = scheduleRepository;
        this.patientRepository = patientRepository;
        this.medicineRepository = medicineRepository;
    }

    @Override
    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Override
    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new ScheduleNotFoundException(
                        "Schedule not found with id: " + id));
    }

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Override
    public Schedule updateSchedule(Long id, Schedule schedule) {

        Schedule existingSchedule = getScheduleById(id);

        Patient patient = patientRepository.findById(schedule.getPatient().getId())
                .orElseThrow(() -> new RuntimeException(
                        "Patient not found with id: "
                                + schedule.getPatient().getId()));

        Medicine medicine = medicineRepository.findById(schedule.getMedicine().getId())
                .orElseThrow(() -> new RuntimeException(
                        "Medicine not found with id: "
                                + schedule.getMedicine().getId()));

        existingSchedule.setPatient(patient);
        existingSchedule.setMedicine(medicine);
        existingSchedule.setDosage(schedule.getDosage());
        existingSchedule.setFrequency(schedule.getFrequency());
        existingSchedule.setStartDate(schedule.getStartDate());
        existingSchedule.setEndDate(schedule.getEndDate());

        return scheduleRepository.save(existingSchedule);
    }

    @Override
    public void deleteSchedule(Long id) {

        Schedule existingSchedule = getScheduleById(id);

        scheduleRepository.delete(existingSchedule);
    }
}