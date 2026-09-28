/**
 * CarePlan Dashboard Controller
 * Loads real-time clinical statistics and builds the medication timeline.
 */
document.addEventListener('DOMContentLoaded', async () => {
    CarePlan.initApp();

    // Display formatted today's date badge
    const todayBadge = document.getElementById('todayDateBadge');
    if (todayBadge) {
        const today = new Date();
        todayBadge.textContent = today.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    await loadDashboardData();
});

async function loadDashboardData() {
    try {
        // Fetch all primary resources in parallel
        const [patients, medicines, schedules] = await Promise.all([
            api.get('/api/patients').catch(() => []),
            api.get('/api/medicines').catch(() => []),
            api.get('/api/schedules').catch(() => [])
        ]);

        // Animate primary KPI stats
        animateCounter('statPatients', patients.length);
        animateCounter('statMedicines', medicines.length);

        // Filter active schedules based on today's date
        const todayStr = new Date().toISOString().split('T')[0];
        const activeSchedules = schedules.filter(s => {
            const startsOk = !s.startDate || s.startDate <= todayStr;
            const endsOk = !s.endDate || s.endDate >= todayStr;
            return startsOk && endsOk;
        });

        animateCounter('statSchedules', activeSchedules.length);

        // Fetch ScheduleTimes for each active schedule to calculate today's dose slots & populate timeline
        let totalDoseSlots = 0;
        const timelineEntries = [];

        const scheduleTimePromises = activeSchedules.map(async (schedule) => {
            try {
                const times = await api.get(`/api/schedules/${schedule.id}/times`);
                if (Array.isArray(times)) {
                    totalDoseSlots += times.length;
                    times.forEach(t => {
                        timelineEntries.push({
                            scheduleId: schedule.id,
                            timeId: t.id,
                            doseTime: t.doseTime,
                            patientName: schedule.patient?.name || 'Patient #' + schedule.patient?.id,
                            medicineName: schedule.medicine?.name || 'Medicine #' + schedule.medicine?.id,
                            dosage: schedule.dosage,
                            frequency: schedule.frequency
                        });
                    });
                }
            } catch (err) {
                // Ignore schedule-level errors in timeline
            }
        });

        await Promise.all(scheduleTimePromises);

        animateCounter('statDoses', totalDoseSlots);
        renderTimeline(timelineEntries);

        // Update backend connectivity indicator
        const statusText = document.getElementById('backendStatusText');
        if (statusText) statusText.textContent = 'CarePlan API Connected';

    } catch (err) {
        CarePlan.showToast('Failed to load dashboard statistics: ' + err.message, 'error');
        const statusText = document.getElementById('backendStatusText');
        if (statusText) statusText.textContent = 'Offline / Connecting...';
    }
}

function animateCounter(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (targetValue === 0) {
        el.textContent = '0';
        return;
    }

    let start = 0;
    const duration = 800; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetValue / steps;

    const timer = setInterval(() => {
        start += increment;
        if (start >= targetValue) {
            el.textContent = targetValue;
            clearInterval(timer);
        } else {
            el.textContent = Math.floor(start);
        }
    }, stepTime);
}

function renderTimeline(entries) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    if (entries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="empty-icon ri-calendar-line"></i>
                <h3 class="empty-title">No Medication Slots Today</h3>
                <p class="empty-text">There are currently no active schedules or scheduled dose times registered for today.</p>
                <a href="pages/schedules.html" class="btn btn-primary btn-sm">
                    <i class="ri-add-line"></i> Create Schedule
                </a>
            </div>
        `;
        return;
    }

    // Sort timeline chronologically
    entries.sort((a, b) => (a.doseTime || '').localeCompare(b.doseTime || ''));

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    let html = '<div class="timeline">';

    entries.forEach(entry => {
        const timeParts = (entry.doseTime || '00:00:00').split(':');
        const doseHour = parseInt(timeParts[0], 10);
        const doseMinute = parseInt(timeParts[1] || '0', 10);

        const isPast = (doseHour < currentHour) || (doseHour === currentHour && doseMinute <= currentMinute);
        const statusBadgeClass = isPast ? 'badge-warning' : 'badge-info';
        const statusText = isPast ? 'Due' : 'Upcoming';
        const timelineItemClass = isPast ? 'upcoming' : 'upcoming';

        html += `
            <div class="timeline-item ${timelineItemClass}">
                <div class="timeline-time">${CarePlan.formatTime(entry.doseTime)}</div>
                <div class="timeline-content">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <div class="timeline-medicine">${escapeHtml(entry.medicineName)}</div>
                            <div class="timeline-dose">
                                ${entry.dosage} mg · ${CarePlan.formatFrequency(entry.frequency)}
                            </div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: 4px;">
                                <i class="ri-user-line" style="margin-right: 3px;"></i>Patient: <strong style="color: var(--text-secondary);">${escapeHtml(entry.patientName)}</strong>
                            </div>
                        </div>
                        <span class="badge ${statusBadgeClass}">${statusText}</span>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    container.innerHTML = html;
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
