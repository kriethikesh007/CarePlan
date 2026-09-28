/**
 * CarePlan Patients Controller
 * Connects to /api/patients for CRUD operations.
 */
let patientsCache = [];

document.addEventListener('DOMContentLoaded', () => {
    CarePlan.initApp();
    loadPatients();

    // Search filter listener
    const searchInput = document.getElementById('patientSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterPatients(query);
        });
    }

    // Modal Trigger
    const openAddBtn = document.getElementById('openAddPatientBtn');
    if (openAddBtn) {
        openAddBtn.onclick = () => {
            document.getElementById('addPatientForm').reset();
            clearValidationErrors();
            CarePlan.showModal('addPatientModal');
        };
    }

    // Form Submissions
    const addForm = document.getElementById('addPatientForm');
    if (addForm) {
        addForm.onsubmit = handleAddPatient;
    }

    const editForm = document.getElementById('editPatientForm');
    if (editForm) {
        editForm.onsubmit = handleUpdatePatient;
    }
});

async function loadPatients() {
    const loading = document.getElementById('patientLoading');
    const table = document.getElementById('patientsTable');
    const empty = document.getElementById('patientEmptyState');

    loading.style.display = 'flex';
    table.style.display = 'none';
    empty.style.display = 'none';

    try {
        const patients = await api.get('/api/patients');
        patientsCache = Array.isArray(patients) ? patients : [];
        renderPatients(patientsCache);
    } catch (err) {
        CarePlan.showToast('Failed to load patients: ' + err.message, 'error');
        loading.style.display = 'none';
        empty.style.display = 'flex';
    }
}

function renderPatients(patients) {
    const loading = document.getElementById('patientLoading');
    const table = document.getElementById('patientsTable');
    const empty = document.getElementById('patientEmptyState');
    const tbody = document.getElementById('patientsTableBody');

    loading.style.display = 'none';

    if (patients.length === 0) {
        table.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    table.style.display = 'table';

    tbody.innerHTML = patients.map(p => {
        const genderBadgeClass = p.gender === 'MALE' ? 'badge-info' : (p.gender === 'FEMALE' ? 'badge-danger' : 'badge-warning');
        return `
            <tr>
                <td><strong style="color: var(--color-primary); font-family: var(--font-mono);">#${p.id}</strong></td>
                <td>
                    <div style="font-weight: var(--font-weight-semibold); color: var(--text-primary);">${escapeHtml(p.name)}</div>
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span>${p.age} yrs</span>
                        <span class="badge ${genderBadgeClass}">${p.gender}</span>
                    </div>
                </td>
                <td>${escapeHtml(p.phoneNumber)}</td>
                <td>
                    <div>${escapeHtml(p.emergencyContactName)}</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">${escapeHtml(p.emergencyContactNumber)}</div>
                </td>
                <td>
                    <span style="font-size: var(--font-size-xs); color: var(--text-secondary);">${p.weight} kg / ${p.height} cm</span>
                </td>
                <td>
                    <div class="actions-cell" style="justify-content: flex-end;">
                        <button class="btn-icon" onclick="viewPatientDetails(${p.id})" title="View Profile">
                            <i class="ri-eye-line"></i>
                        </button>
                        <button class="btn-icon" onclick="openEditModal(${p.id})" title="Edit Patient">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="deletePatient(${p.id})" title="Delete Patient">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterPatients(query) {
    if (!query) {
        renderPatients(patientsCache);
        return;
    }
    const filtered = patientsCache.filter(p => {
        const nameMatch = (p.name || '').toLowerCase().includes(query);
        const phoneMatch = (p.phoneNumber || '').toLowerCase().includes(query);
        return nameMatch || phoneMatch;
    });
    renderPatients(filtered);
}

async function handleAddPatient(e) {
    e.preventDefault();
    clearValidationErrors();

    const saveBtn = document.getElementById('savePatientBtn');
    saveBtn.disabled = true;

    const payload = {
        name: document.getElementById('addName').value.trim(),
        age: parseInt(document.getElementById('addAge').value, 10),
        gender: document.getElementById('addGender').value,
        phoneNumber: document.getElementById('addPhone').value.trim(),
        emergencyContactName: document.getElementById('addEmergName').value.trim(),
        emergencyContactNumber: document.getElementById('addEmergPhone').value.trim(),
        weight: parseFloat(document.getElementById('addWeight').value),
        height: parseFloat(document.getElementById('addHeight').value)
    };

    try {
        await api.post('/api/patients', payload);
        CarePlan.showToast('Patient registered successfully!', 'success');
        CarePlan.hideModal('addPatientModal');
        await loadPatients();
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        saveBtn.disabled = false;
    }
}

async function openEditModal(patientId) {
    try {
        const patient = await api.get(`/api/patients/${patientId}`);
        document.getElementById('editId').value = patient.id;
        document.getElementById('editName').value = patient.name || '';
        document.getElementById('editAge').value = patient.age || '';
        document.getElementById('editGender').value = patient.gender || 'MALE';
        document.getElementById('editPhone').value = patient.phoneNumber || '';
        document.getElementById('editEmergName').value = patient.emergencyContactName || '';
        document.getElementById('editEmergPhone').value = patient.emergencyContactNumber || '';
        document.getElementById('editWeight').value = patient.weight || '';
        document.getElementById('editHeight').value = patient.height || '';

        CarePlan.showModal('editPatientModal');
    } catch (err) {
        CarePlan.showToast('Failed to load patient: ' + err.message, 'error');
    }
}

async function handleUpdatePatient(e) {
    e.preventDefault();
    const updateBtn = document.getElementById('updatePatientBtn');
    updateBtn.disabled = true;

    const patientId = document.getElementById('editId').value;
    const payload = {
        name: document.getElementById('editName').value.trim(),
        age: parseInt(document.getElementById('editAge').value, 10),
        gender: document.getElementById('editGender').value,
        phoneNumber: document.getElementById('editPhone').value.trim(),
        emergencyContactName: document.getElementById('editEmergName').value.trim(),
        emergencyContactNumber: document.getElementById('editEmergPhone').value.trim(),
        weight: parseFloat(document.getElementById('editWeight').value),
        height: parseFloat(document.getElementById('editHeight').value)
    };

    try {
        await api.put(`/api/patients/${patientId}`, payload);
        CarePlan.showToast('Patient updated successfully!', 'success');
        CarePlan.hideModal('editPatientModal');
        await loadPatients();
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        updateBtn.disabled = false;
    }
}

async function viewPatientDetails(patientId) {
    try {
        const patient = await api.get(`/api/patients/${patientId}`);
        const modalBody = document.getElementById('patientDetailBody');

        // BMI Calculation
        let bmiDisplay = '—';
        if (patient.height && patient.weight && patient.height > 0) {
            const heightInM = patient.height / 100;
            const bmi = (patient.weight / (heightInM * heightInM)).toFixed(1);
            bmiDisplay = `${bmi} kg/m²`;
        }

        modalBody.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--spacing-md); margin-bottom: var(--spacing-lg); padding-bottom: var(--spacing-md); border-bottom: 1px solid var(--border-glass);">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark)); color: white; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                    <i class="ri-user-line"></i>
                </div>
                <div>
                    <h2 style="font-size: var(--font-size-xl); margin-bottom: 2px;">${escapeHtml(patient.name)}</h2>
                    <span class="badge ${patient.gender === 'MALE' ? 'badge-info' : 'badge-danger'}">${patient.gender}</span>
                    <span style="font-size: var(--font-size-xs); color: var(--text-muted); margin-left: 8px;">Record #${patient.id}</span>
                </div>
            </div>

            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Age</span>
                    <span class="detail-value">${patient.age} Years</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Phone Number</span>
                    <span class="detail-value">${escapeHtml(patient.phoneNumber)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Height</span>
                    <span class="detail-value">${patient.height} cm</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Weight</span>
                    <span class="detail-value">${patient.weight} kg</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Calculated BMI</span>
                    <span class="detail-value">${bmiDisplay}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Emergency Contact</span>
                    <span class="detail-value">${escapeHtml(patient.emergencyContactName)}</span>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <span class="detail-label">Emergency Phone</span>
                    <span class="detail-value">${escapeHtml(patient.emergencyContactNumber)}</span>
                </div>
            </div>
        `;

        CarePlan.showModal('viewPatientModal');
    } catch (err) {
        CarePlan.showToast('Failed to load patient: ' + err.message, 'error');
    }
}

async function deletePatient(patientId) {
    const confirmed = await CarePlan.showConfirm(
        'Are you sure you want to permanently delete this patient record? Any associated schedules will also be affected.',
        'Delete Patient'
    );

    if (!confirmed) return;

    try {
        await api.del(`/api/patients/${patientId}`);
        CarePlan.showToast('Patient deleted successfully', 'success');
        await loadPatients();
    } catch (err) {
        CarePlan.showToast('Failed to delete: ' + err.message, 'error');
    }
}

function clearValidationErrors() {
    document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-input.error, .form-select.error').forEach(el => el.classList.remove('error'));
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
