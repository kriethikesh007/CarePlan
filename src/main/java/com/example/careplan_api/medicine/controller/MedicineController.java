package com.example.careplan_api.medicine.controller;

import com.example.careplan_api.medicine.entity.Medicine;
import com.example.careplan_api.medicine.service.MedicineService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    @PostMapping
    public ResponseEntity<Medicine> createMedicine(
            @Valid @RequestBody Medicine medicine) {

        Medicine createdMedicine = medicineService.createMedicine(medicine);

        return new ResponseEntity<>(
                createdMedicine,
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {

        List<Medicine> medicines = medicineService.getAllMedicines();

        return ResponseEntity.ok(medicines);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id) {

        Medicine medicine = medicineService.getMedicineById(id);

        return ResponseEntity.ok(medicine);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody Medicine medicine) {

        Medicine updatedMedicine =
                medicineService.updateMedicine(id, medicine);

        return ResponseEntity.ok(updatedMedicine);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicine(
            @PathVariable Long id) {

        medicineService.deleteMedicine(id);

        return ResponseEntity.noContent().build();
    }
}