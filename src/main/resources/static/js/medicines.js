/**
 * CarePlan Medicines Controller
 * Connects to /api/medicines for CRUD operations.
 */
let medicinesCache = [];

document.addEventListener('DOMContentLoaded', () => {
    CarePlan.initApp();
    loadMedicines();

    // Search filter
    const searchInput = document.getElementById('medicineSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            filterMedicines(query);
        });
    }

    // Modal triggers
    const openAddBtn = document.getElementById('openAddMedicineBtn');
    if (openAddBtn) {
        openAddBtn.onclick = () => {
            document.getElementById('addMedicineForm').reset();
            CarePlan.showModal('addMedicineModal');
        };
    }

    // Form handlers
    const addForm = document.getElementById('addMedicineForm');
    if (addForm) {
        addForm.onsubmit = handleAddMedicine;
    }

    const editForm = document.getElementById('editMedicineForm');
    if (editForm) {
        editForm.onsubmit = handleUpdateMedicine;
    }
});

async function loadMedicines() {
    const loading = document.getElementById('medicineLoading');
    const grid = document.getElementById('medicinesGrid');
    const empty = document.getElementById('medicineEmptyState');

    loading.style.display = 'flex';
    grid.style.display = 'none';
    empty.style.display = 'none';

    try {
        const medicines = await api.get('/api/medicines');
        medicinesCache = Array.isArray(medicines) ? medicines : [];
        renderMedicines(medicinesCache);
    } catch (err) {
        CarePlan.showToast('Failed to load medicines: ' + err.message, 'error');
        loading.style.display = 'none';
        empty.style.display = 'flex';
    }
}

function renderMedicines(medicines) {
    const loading = document.getElementById('medicineLoading');
    const grid = document.getElementById('medicinesGrid');
    const empty = document.getElementById('medicineEmptyState');

    loading.style.display = 'none';

    if (medicines.length === 0) {
        grid.style.display = 'none';
        empty.style.display = 'flex';
        return;
    }

    empty.style.display = 'none';
    grid.style.display = 'grid';

    grid.innerHTML = medicines.map(m => `
        <div class="glass-card" style="display: flex; flex-direction: column; justify-content: space-between;">
            <div>
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-sm);">
                    <div class="stat-icon blue" style="width: 44px; height: 44px; font-size: 1.25rem;">
                        <i class="ri-capsule-fill"></i>
                    </div>
                    <span class="badge badge-info" style="font-family: var(--font-mono);">ID #${m.id}</span>
                </div>
                <h3 style="font-size: var(--font-size-lg); color: var(--text-primary); margin-bottom: 4px;">
                    ${escapeHtml(m.name)}
                </h3>
                <p style="font-size: var(--font-size-xs); color: var(--text-muted);">Standard Formulation</p>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: var(--spacing-xs); margin-top: var(--spacing-lg); padding-top: var(--spacing-sm); border-top: 1px solid var(--border-glass);">
                <button class="btn-icon" onclick="openEditMedicineModal(${m.id}, '${escapeAttribute(m.name)}')" title="Edit Medicine">
                    <i class="ri-edit-line"></i>
                </button>
                <button class="btn-icon btn-icon-danger" onclick="deleteMedicine(${m.id})" title="Delete Medicine">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function filterMedicines(query) {
    if (!query) {
        renderMedicines(medicinesCache);
        return;
    }
    const filtered = medicinesCache.filter(m => (m.name || '').toLowerCase().includes(query));
    renderMedicines(filtered);
}

async function handleAddMedicine(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveMedBtn');
    saveBtn.disabled = true;

    const payload = {
        name: document.getElementById('addMedName').value.trim()
    };

    try {
        await api.post('/api/medicines', payload);
        CarePlan.showToast('Medicine added to catalog!', 'success');
        CarePlan.hideModal('addMedicineModal');
        await loadMedicines();
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        saveBtn.disabled = false;
    }
}

function openEditMedicineModal(id, name) {
    document.getElementById('editMedId').value = id;
    document.getElementById('editMedName').value = name;
    CarePlan.showModal('editMedicineModal');
}

async function handleUpdateMedicine(e) {
    e.preventDefault();
    const updateBtn = document.getElementById('updateMedBtn');
    updateBtn.disabled = true;

    const id = document.getElementById('editMedId').value;
    const payload = {
        name: document.getElementById('editMedName').value.trim()
    };

    try {
        await api.put(`/api/medicines/${id}`, payload);
        CarePlan.showToast('Medicine updated successfully!', 'success');
        CarePlan.hideModal('editMedicineModal');
        await loadMedicines();
    } catch (err) {
        CarePlan.showToast(err.message, 'error');
    } finally {
        updateBtn.disabled = false;
    }
}

async function deleteMedicine(id) {
    const confirmed = await CarePlan.showConfirm(
        'Are you sure you want to delete this medicine? Any schedules referencing this medicine will be affected.',
        'Delete Medicine'
    );

    if (!confirmed) return;

    try {
        await api.del(`/api/medicines/${id}`);
        CarePlan.showToast('Medicine deleted successfully', 'success');
        await loadMedicines();
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

function escapeAttribute(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
