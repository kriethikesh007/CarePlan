package com.example.careplan_api.medicine.service;

import com.example.careplan_api.medicine.entity.Medicine;

import java.util.List;

public interface MedicineService {

    Medicine createMedicine(Medicine medicine);

    Medicine getMedicineById(Long id);

    List<Medicine> getAllMedicines();

    Medicine updateMedicine(Long id, Medicine medicine);

    void deleteMedicine(Long id);
}