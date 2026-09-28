/**
 * CarePlan Schedule Times Controller
 * Handles specific dose times for a given medication schedule.
 * Endpoints:
 * - GET /api/schedules/{scheduleId}/times
 * - POST /api/schedules/{scheduleId}/times (body: { "doseTime": "08:00:00" })
 * - DELETE /api/schedules/times/{id}
 */
const ScheduleTimes = {
    currentScheduleId: null,

    async load(scheduleId) {
        this.currentScheduleId = scheduleId;
        const container = document.getElementById('scheduleTimesListContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="page-loading" style="padding: var(--spacing-md);">
                <div class="loading-spinner loading-spinner-sm"></div>
                <span class="page-loading-text">Loading dose times...</span>
            </div>
        `;

        try {
            const times = await api.get(`/api/schedules/${scheduleId}/times`);
            this.render(Array.isArray(times) ? times : []);
        } catch (err) {
            container.innerHTML = `<p style="font-size: var(--font-size-xs); color: var(--color-danger); text-align: center;">Failed to load times: ${escapeHtml(err.message)}</p>`;
        }
    },

    render(times) {
        const container = document.getElementById('scheduleTimesListContainer');
        if (!container) return;

        if (times.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: var(--spacing-lg); background: var(--bg-glass-subtle); border-radius: var(--radius-sm); border: 1px dashed var(--border-glass);">
                    <i class="ri-time-line" style="font-size: 1.8rem; color: var(--text-muted); opacity: 0.6;"></i>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary); margin-top: 4px;">No dose times set yet</div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-muted);">Add the times at which this medication should be taken daily.</div>
                </div>
            `;
            return;
        }

        // Sort chronologically
        times.sort((a, b) => (a.doseTime || '').localeCompare(b.doseTime || ''));

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: var(--spacing-xs);">
                ${times.map(t => {
                    const period = this.getTimePeriod(t.doseTime);
                    return `
                        <div class="schedule-time-card">
                            <div class="time-icon">
                                <i class="ri-alarm-line"></i>
                            </div>
                            <div style="flex: 1;">
                                <div class="time-display">${CarePlan.formatTime(t.doseTime)}</div>
                                <div class="time-period">${period} slot · ID #${t.id}</div>
                            </div>
                            <button class="btn-icon btn-icon-danger" onclick="ScheduleTimes.deleteTime(${t.id})" title="Remove time">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    getTimePeriod(timeStr) {
        if (!timeStr) return 'General';
        const hour = parseInt(timeStr.split(':')[0], 10);
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        return 'Evening / Night';
    },

    async addTime(doseTimeString) {
        if (!this.currentScheduleId) {
            CarePlan.showToast('No active schedule selected', 'error');
            return;
        }

        // Ensure format HH:mm:ss
        let formattedTime = doseTimeString;
        if (formattedTime.length === 5) {
            formattedTime += ':00';
        }

        const payload = {
            doseTime: formattedTime
        };

        try {
            await api.post(`/api/schedules/${this.currentScheduleId}/times`, payload);
            CarePlan.showToast('Dose time added successfully', 'success');
            await this.load(this.currentScheduleId);
        } catch (err) {
            CarePlan.showToast(err.message, 'error');
        }
    },

    async deleteTime(timeId) {
        const confirmed = await CarePlan.showConfirm('Are you sure you want to remove this scheduled dose time?', 'Delete Dose Time');
        if (!confirmed) return;

        try {
            await api.del(`/api/schedules/times/${timeId}`);
            CarePlan.showToast('Dose time removed', 'success');
            await this.load(this.currentScheduleId);
        } catch (err) {
            CarePlan.showToast('Failed to remove: ' + err.message, 'error');
        }
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

window.ScheduleTimes = ScheduleTimes;
