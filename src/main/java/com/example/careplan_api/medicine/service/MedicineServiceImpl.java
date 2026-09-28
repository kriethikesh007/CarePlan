package com.example.careplan_api.medicine.service;

import com.example.careplan_api.medicine.entity.Medicine;
import com.example.careplan_api.medicine.exception.MedicineNotFoundException;
import com.example.careplan_api.medicine.repository.MedicineRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicineServiceImpl implements MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineServiceImpl(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @Override
    public Medicine createMedicine(Medicine medicine) {
        return medicineRepository.save(medicine);
    }

    @Override
    public Medicine getMedicineById(Long id) {
        return medicineRepository.findById(id)
                .orElseThrow(() ->
                        new MedicineNotFoundException(
                                "Medicine not found with id: " + id));
    }

    @Override
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @Override
    public Medicine updateMedicine(Long id, Medicine medicine) {

        Medicine existingMedicine = getMedicineById(id);

        existingMedicine.setName(medicine.getName());

        return medicineRepository.save(existingMedicine);
    }

    @Override
    public void deleteMedicine(Long id) {

        Medicine existingMedicine = getMedicineById(id);

        medicineRepository.delete(existingMedicine);
    }
}