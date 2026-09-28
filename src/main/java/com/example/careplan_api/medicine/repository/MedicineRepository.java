package com.example.careplan_api.medicine.repository;

import com.example.careplan_api.medicine.entity.Medicine;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

}