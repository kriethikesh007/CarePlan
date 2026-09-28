package com.example.careplan_api.schedule.service;

import com.example.careplan_api.schedule.entity.Schedule;
import com.example.careplan_api.schedule.exception.ScheduleNotFoundException;
import com.example.careplan_api.schedule.repository.ScheduleRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    public ScheduleServiceImpl(ScheduleRepository scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }

    @Override
    public Schedule createSchedule(Schedule schedule) {
        return scheduleRepository.save(schedule);
    }

    @Override
    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() ->
                        new ScheduleNotFoundException(
                                "Schedule not found with id: " + id));
    }

    @Override
    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    @Override
    public Schedule updateSchedule(Long id, Schedule schedule) {

        Schedule existingSchedule = getScheduleById(id);

        existingSchedule.setPatient(schedule.getPatient());
        existingSchedule.setMedicine(schedule.getMedicine());
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