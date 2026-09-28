/**
 * CarePlan Dose Logs Controller
 * Connects to /api/dose-logs
 * Endpoints:
 * - POST /api/dose-logs?scheduleTimeId=...&doseDate=...&status=...
 * - GET /api/dose-logs/{id}
 */
let sessionLogsCache = [];
let availableSchedules = [];

document.addEventListener('DOMContentLoaded', async () => {
    CarePlan.initApp();

    // Set today's date in date input
    const dateInput = document.getElementById('doseDateInput');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    await loadSchedulesDropdown();

    // Schedule change listener to load times
    const scheduleSelect = document.getElementById('doseScheduleSelect');
    if (scheduleSelect) {
        scheduleSelect.addEventListener('change', async (e) => {
            const scheduleId = e.target.value;
            await loadTimesForSchedule(scheduleId);
        });
    }

    // Record Dose Form
    const recordForm = document.getElementById('recordDoseForm');
    if (recordForm) {
        recordForm.onsubmit = handleRecordDose;
    }

    // Lookup Form
    const lookupForm = document.getElementById('lookupForm');
    if (lookupForm) {
        lookupForm.onsubmit = handleLookupDose;
    }
});

async function loadSchedulesDropdown() {
    const select = document.getElementById('doseScheduleSelect');
    if (!select) return;

    try {
        const schedules = await api.get('/api/schedules');
        availableSchedules = Array.isArray(schedules) ? schedules : [];

        if (availableSchedules.length === 0) {
            select.innerHTML = '<option value="" disabled selected>No schedules found - Create one first</option>';
            return;
        }

        select.innerHTML = '<option value="" disabled selected>Select Care Schedule</option>' +
            availableSchedules.map(s => {
                const pName = s.patient?.name || 'Patient #' + s.patient?.id;
                const mName = s.medicine?.name || 'Medicine #' + s.medicine?.id;
                return `<option value="${s.id}">#${s.id}: ${escapeHtml(pName)} — ${escapeHtml(mName)} (${s.dosage}mg, ${CarePlan.formatFrequency(s.frequency)})</option>`;
            }).join('');
    } catch (err) {
        select.innerHTML = '<option value="" disabled selected>Failed to load schedules</option>';
        CarePlan.showToast('Failed to load schedules: ' + err.message, 'error');
    }
}

async function loadTimesForSchedule(scheduleId) {
    const timeSelect = document.getElementById('doseTimeSelect');
    if (!timeSelect) return;

    timeSelect.disabled = true;
    timeSelect.innerHTML = '<option value="" disabled selected>Loading dose times...</option>';

    try {
        const times = await api.get(`/api/schedules/${scheduleId}/times`);
        const timeList = Array.isArray(times) ? times : [];

        if (timeList.length === 0) {
            timeSelect.innerHTML = '<option value="" disabled selected>No times set for this schedule (Add times in Schedules tab)</option>';
            timeSelect.disabled = true;
            return;
        }

        timeSelect.innerHTML = '<option value="" disabled selected>Select Scheduled Time Slot</option>' +
            timeList.map(t => {
                return `<option value="${t.id}">Slot #${t.id}: ${CarePlan.formatTime(t.doseTime)} (${t.doseTime})</option>`;
            }).join('');

        timeSelect.disabled = false;
    } catch (err) {
        timeSelect.innerHTML = '<option value="" disabled selected>Failed to load times</option>';
        CarePlan.showToast('Failed to load times: ' + err.message, 'error');
    }
}

async function handleRecordDose(e) {
    e.preventDefault();
    const btn = document.getElementById('recordDoseBtn');
    btn.disabled = true;

    const scheduleTimeId = document.getElementById('doseTimeSelect').value;
    const doseDate = document.getElementById('doseDateInput').value;
    const status = document.getElementById('doseStatusSelect').value;

    if (!scheduleTimeId || !doseDate || !status) {
        CarePlan.showToast('Please fill all required dose fields', 'warning');
        btn.disabled = false;
        return;
    }

    // Backend endpoint uses @RequestParam: POST /api/dose-logs?scheduleTimeId=...&doseDate=...&status=...
    const url = `/api/dose-logs?scheduleTimeId=${encodeURIComponent(scheduleTimeId)}&doseDate=${encodeURIComponent(doseDate)}&status=${encodeURIComponent(status)}`;

    try {
        const result = await api.postParams(url);
        CarePlan.showToast('Dose logged successfully!', 'success');

        // Add to session logs
        sessionLogsCache.unshift(result);
        renderSessionLogs();

        // Also display verification card in lookup
        renderDoseCard(result, 'lookupResultContainer');

    } catch (err) {
        // Handle 409 Duplicate Dose or validation errors
        CarePlan.showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
    }
}

async function handleLookupDose(e) {
    e.preventDefault();
    const lookupBtn = document.getElementById('lookupBtn');
    lookupBtn.disabled = true;

    const idInput = document.getElementById('lookupIdInput');
    const logId = idInput.value.trim();
    const container = document.getElementById('lookupResultContainer');

    container.innerHTML = `
        <div class="page-loading" style="padding: var(--spacing-md);">
            <div class="loading-spinner loading-spinner-sm"></div>
            <span class="page-loading-text">Verifying record #${logId}...</span>
        </div>
    `;

    try {
        const log = await api.get(`/api/dose-logs/${logId}`);
        renderDoseCard(log, 'lookupResultContainer');
    } catch (err) {
        container.innerHTML = `
            <div style="padding: var(--spacing-md); background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: var(--radius-sm); color: var(--color-danger); font-size: var(--font-size-xs); text-align: center;">
                <i class="ri-error-warning-line" style="font-size: 1.2rem; display: block; margin-bottom: 4px;"></i>
                Record #${escapeHtml(logId)} not found in database.
            </div>
        `;
    } finally {
        lookupBtn.disabled = false;
    }
}

function renderDoseCard(log, targetContainerId) {
    const container = document.getElementById(targetContainerId);
    if (!container || !log) return;

    const isTaken = log.status === 'TAKEN';
    const badgeClass = isTaken ? 'badge-success' : 'badge-danger';
    const statusIcon = isTaken ? 'ri-checkbox-circle-fill' : 'ri-close-circle-fill';

    let takenAtFormatted = '— (Omitted / Missed)';
    if (log.takenAt) {
        try {
            takenAtFormatted = new Date(log.takenAt).toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short'
            });
        } catch {
            takenAtFormatted = log.takenAt;
        }
    }

    container.innerHTML = `
        <div style="background: var(--bg-glass-subtle); border: 1px solid var(--border-glass-strong); border-radius: var(--radius-md); padding: var(--spacing-md);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--spacing-sm);">
                <strong style="color: var(--color-primary); font-family: var(--font-mono); font-size: var(--font-size-sm);">Dose Log #${log.id}</strong>
                <span class="badge ${badgeClass}"><i class="${statusIcon}"></i> ${log.status}</span>
            </div>
            <div class="detail-grid" style="gap: var(--spacing-xs);">
                <div class="detail-item">
                    <span class="detail-label">Calendar Date</span>
                    <span class="detail-value">${CarePlan.formatDate(log.doseDate)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Scheduled Slot</span>
                    <span class="detail-value">${CarePlan.formatTime(log.scheduleTime?.doseTime)}</span>
                </div>
                <div class="detail-item" style="grid-column: span 2;">
                    <span class="detail-label">Actual Timestamp</span>
                    <span class="detail-value">${takenAtFormatted}</span>
                </div>
            </div>
        </div>
    `;
}

function renderSessionLogs() {
    const container = document.getElementById('sessionLogsList');
    const badge = document.getElementById('sessionLogCount');
    if (!container) return;

    if (badge) {
        badge.textContent = `${sessionLogsCache.length} Logged`;
    }

    if (sessionLogsCache.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--spacing-lg); color: var(--text-muted); font-size: var(--font-size-xs);">
                Doses recorded during this clinical session will be summarized here.
            </div>
        `;
        return;
    }

    container.innerHTML = sessionLogsCache.map(log => {
        const isTaken = log.status === 'TAKEN';
        const badgeClass = isTaken ? 'badge-success' : 'badge-danger';
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--spacing-sm) var(--spacing-md); background: var(--bg-glass-subtle); border-radius: var(--radius-xs); border: 1px solid var(--border-glass);">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="badge ${badgeClass}">${log.status}</span>
                    <span style="font-size: var(--font-size-xs); color: var(--text-primary); font-weight: var(--font-weight-medium);">Slot #${log.scheduleTime?.id || '—'} (${CarePlan.formatTime(log.scheduleTime?.doseTime)})</span>
                </div>
                <div style="font-size: var(--font-size-xs); color: var(--text-muted);">
                    ${CarePlan.formatDate(log.doseDate)}
                </div>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
