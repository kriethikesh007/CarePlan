/**
 * CarePlan Schedules Controller
 * Connects to /api/schedules for Schedule CRUD operations.
 */
let schedulesCache = [];
let patientsList = [];
let medicinesList = [];

document.addEventListener('DOMContentLoaded', async () => {
    CarePlan.initApp();
    await loadSchedules();
    loadDropdownData();

    // Search filter
    const searchInput = document.getElementById('scheduleSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterSchedules(query);
        });
    }

    // Modal open
    const openAddBtn = document.getElementById('openAddScheduleBtn');
    if (openAddBtn) {
        openAddBtn.onclick = () => {
            document.getElementById('addScheduleForm').reset();
            // Set default start date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('addScheduleStart').value = today;
            populateDropdowns('addSchedulePatient', 'addScheduleMedicine');
            CarePlan.showModal('addScheduleModal');
        };
    }

    // Form handlers
    const addForm = document.getElementById('addScheduleForm');
    if (addForm) {
        addForm.onsubmit = handleAddSchedule;
    }

    const editForm = document.getElementById('editScheduleForm');
    if (editForm) {
        editForm.onsubmit = handleUpdateSchedule;
    }

    // Add Dose Time Form handler
    const timeForm = document.getElementById('addScheduleTimeForm');
    if (timeForm) {
        timeForm.onsubmit = async (e) => {
            e.preventDefault();
            const timeInput = document.getElementById('newDoseTimeInput');
            if (timeInput && timeInput.value) {
                const addBtn = document.getElementById('addTimeSubmitBtn');
                addBtn.disabled = true;
                await window.ScheduleTimes.addTime(timeInput.value);
                timeInput.value = '';
                addBtn.disabled = false;
            }
        };
    }
});

async function loadDropdownData() {
    try {
        const [patients, medicines] = await Promise.all([
            api.get('/api/patients').catch(() => []),
            api.get('/api/medicines').catch(() => [])
        ]);
        patientsList = Array.isArray(patients) ? patients : [];
        medicinesList = Array.isArray(medicines) ? medicines : [];
    } catch {
        // Fallback
    }
}

function populateDropdowns(patientSelectId, medicineSelectId, selectedPatientId = null, selectedMedicineId = null) {
    const patientSelect = document.getElementById(patientSelectId);
    const medicineSelect = document.getElementById(medicineSelectId);

    if (patientSelect) {
        patientSelect.innerHTML = '<option value="" disabled selected>Select Patient</option>' +
            patientsList.map(p => `
                <option value="${p.id}" ${p.id == selectedPatientId ? 'selected' : ''}>
                    ${escapeHtml(p.name)} (${p.age}y, ${p.gender})
                </option>
            `).join('');
    }

    if (medicineSelect) {
        medicineSelect.innerHTML = '<option value="" disabled selected>Select Medicine</option>' +
            medicinesList.map(m => `
                <option value="${m.id}" ${m.id == selectedMedicineId ? 'selected' : ''}>
                    ${escapeHtml(m.name)}
                </option>
            `).join('');
    }
}

async function loadSchedules() {
    const loading = document.getElementById('schedulesLoading');
    const grid = document.getElementById('schedulesGrid');
    const empty = document.getElementById('schedulesEmptyState');

    loading.style.display = 'flex';
    grid.style.display = 'none';
    empty.style.display = 'none';

    try {
        const schedules = await api.get('/api/schedules');
        schedulesCache = Array.isArray(schedules) ? schedules : [];
        renderSchedules(schedulesCache);
    } catch (err) {
        CarePlan.showToast('Failed to load schedules: ' + err.message, 'error');
        loading.style.display = 'none';
        empty.style.display = 'flex';
    }
}

function renderSchedules(schedules) {
    const loading = document.getElementById('schedulesLoading');
    const grid = document.getElementById('schedulesGrid');
    const empty = document.getElementById('schedulesEmptyState');

    loading.style.display = 'none';

    if (schedules.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = schedules.map(s => {
        const patientName = s.patient?.name || 'Patient #' + (s.patient?.id || '—');
        const medName = s.medicine?.name || 'Medicine #' + (s.medicine?.id || '—');
        const freqText = CarePlan.formatFrequency(s.frequency);

        return `
            <div class="glass-card glass-card-interactive" onclick="viewScheduleDetails(${s.id})">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="stat-icon red" style="width: 36px; height: 36px; font-size: 1.1rem;">
                            <i class="ri-capsule-line"></i>
                        </div>
                        <div>
                            <div style="font-weight: var(--font-weight-bold); font-size: var(--font-size-base); color: var(--text-primary);">${escapeHtml(medName)}</div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-secondary);">${s.dosage} mg</div>
                        </div>
                    </div>
                    <span class="badge badge-info">${freqText}</span>
                </div>

                <div style="margin: var(--spacing-md) 0; padding: var(--spacing-sm); background: var(--bg-glass-subtle); border-radius: var(--radius-xs); border: 1px solid var(--border-glass);">
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted); text-transform: uppercase;">Patient</div>
                    <div style="font-weight: var(--font-weight-semibold); color: var(--text-primary); font-size: var(--font-size-sm);">${escapeHtml(patientName)}</div>
                </div>

                <div style="display: flex; align-items: center; gap: 6px; font-size: var(--font-size-xs); color: var(--text-muted);">
                    <i class="ri-calendar-line"></i>
                    <span>${CarePlan.formatDate(s.startDate)} → ${CarePlan.formatDate(s.endDate)}</span>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: var(--spacing-md); padding-top: var(--spacing-sm); border-top: 1px solid var(--border-glass);" onclick="event.stopPropagation();">
                    <button class="btn btn-secondary btn-sm" onclick="viewScheduleDetails(${s.id})">
                        <i class="ri-time-line"></i> Times
                    </button>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditScheduleModal(${s.id})" title="Edit Schedule">
                            <i class="ri-edit-line"></i>
                        </button>
                        <button class="btn-icon btn-icon-danger" onclick="deleteSchedule(${s.id})" title="Delete Schedule">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function filterSchedules(query) {
    if (!query) {
        renderSchedules(schedulesCache);
        return;
    }
    const filtered = schedulesCache.filter(s => {
        const pMatch = (s.patient?.name || '').toLowerCase().includes(query);
        const mMatch = (s.medicine?.name || '').toLowerCase().includes(query);
        return pMatch || mMatch;
    });
    renderSchedules(filtered);
}

async function handleAddSchedule(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveScheduleBtn');
    saveBtn.disabled = true;

    const patientId = document.getElementById('addSchedulePatient').value;
    const medicineId = document.getElementById('addScheduleMedicine').value;
    const dosage = parseFloat(document.getElementById('addScheduleDosage').value);
    const frequency = document.getElementById('addScheduleFrequency').value;
    const startDate = document.getElementById('addScheduleStart').value;
    const endDate = document.getElementById('addScheduleEnd').value || null;

    const payload = {
        patient: { id: parseInt(patientId, 10) },
        medicine: { id: parseInt(medicineId, 10) },
        dosage: dosage,
        frequency: frequency,
        startDate: startDate,
        endDate: endDate
    };

    try {
        const created = await api.post('/api/schedules', payload);
        CarePlan.showToast('Schedule created successfully!', 'success');
        CarePlan.hideModal('addScheduleModal');
        await loadSchedules();
        // Immediately offer to configure dose times
        if (created && created.id) {
            viewScheduleDetails(created.id);
        }
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        saveBtn.disabled = false;
    }
}

async function openEditScheduleModal(scheduleId) {
    try {
        const schedule = await api.get(`/api/schedules/${scheduleId}`);
        document.getElementById('editScheduleId').value = schedule.id;

        populateDropdowns(
            'editSchedulePatient',
            'editScheduleMedicine',
            schedule.patient?.id,
            schedule.medicine?.id
        );

        document.getElementById('editScheduleDosage').value = schedule.dosage;
        document.getElementById('editScheduleFrequency').value = schedule.frequency;
        document.getElementById('editScheduleStart').value = schedule.startDate || '';
        document.getElementById('editScheduleEnd').value = schedule.endDate || '';

        CarePlan.showModal('editScheduleModal');
    } catch (err) {
        CarePlan.showToast('Failed to load schedule: ' + err.message, 'error');
    }
}

async function handleUpdateSchedule(e) {
    e.preventDefault();
    const updateBtn = document.getElementById('updateScheduleBtn');
    updateBtn.disabled = true;

    const scheduleId = document.getElementById('editScheduleId').value;
    const patientId = document.getElementById('editSchedulePatient').value;
    const medicineId = document.getElementById('editScheduleMedicine').value;
    const dosage = parseFloat(document.getElementById('editScheduleDosage').value);
    const frequency = document.getElementById('editScheduleFrequency').value;
    const startDate = document.getElementById('editScheduleStart').value;
    const endDate = document.getElementById('editScheduleEnd').value || null;

    const payload = {
        patient: { id: parseInt(patientId, 10) },
        medicine: { id: parseInt(medicineId, 10) },
        dosage: dosage,
        frequency: frequency,
        startDate: startDate,
        endDate: endDate
    };

    try {
        await api.put(`/api/schedules/${scheduleId}`, payload);
        CarePlan.showToast('Schedule updated successfully!', 'success');
        CarePlan.hideModal('editScheduleModal');
        await loadSchedules();
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        updateBtn.disabled = false;
    }
}

async function viewScheduleDetails(scheduleId) {
    try {
        const schedule = await api.get(`/api/schedules/${scheduleId}`);
        const overview = document.getElementById('scheduleOverviewBody');

        const pName = schedule.patient?.name || 'Patient #' + schedule.patient?.id;
        const mName = schedule.medicine?.name || 'Medicine #' + schedule.medicine?.id;

        overview.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">Patient</span>
                    <span class="detail-value">${escapeHtml(pName)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Prescribed Medicine</span>
                    <span class="detail-value">${escapeHtml(mName)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Dosage</span>
                    <span class="detail-value">${schedule.dosage} mg</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Frequency</span>
                    <span class="detail-value">${CarePlan.formatFrequency(schedule.frequency)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Start Date</span>
                    <span class="detail-value">${CarePlan.formatDate(schedule.startDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">End Date</span>
                    <span class="detail-value">${CarePlan.formatDate(schedule.endDate)}</span>
                </div>
            </div>
        `;

        CarePlan.showModal('scheduleDetailModal');
        // Load embedded ScheduleTimes
        await window.ScheduleTimes.load(scheduleId);
    } catch (err) {
        CarePlan.showToast('Failed to load schedule: ' + err.message, 'error');
    }
}

async function deleteSchedule(scheduleId) {
    const confirmed = await CarePlan.showConfirm(
        'Are you sure you want to permanently delete this medication schedule and all associated dose times?',
        'Delete Schedule'
    );

    if (!confirmed) return;

    try {
        await api.del(`/api/schedules/${scheduleId}`);
        CarePlan.showToast('Schedule deleted successfully', 'success');
        await loadSchedules();
    } catch (err) {
        CarePlan.showToast('Failed to delete: ' + err.message, 'error');
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
