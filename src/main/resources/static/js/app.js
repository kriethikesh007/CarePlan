/**
 * CarePlan Core Application Utilities & Shell Orchestration
 */
(function() {
    const CarePlan = {
        /**
         * Toast Notification System
         */
        showToast(message, type = 'success') {
            let container = document.getElementById('toastContainer');
            if (!container) {
                container = document.createElement('div');
                container.id = 'toastContainer';
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            const iconMap = {
                success: 'ri-checkbox-circle-fill',
                error: 'ri-close-circle-fill',
                info: 'ri-information-fill',
                warning: 'ri-alert-fill'
            };

            const iconClass = iconMap[type] || iconMap.info;

            toast.innerHTML = `
                <i class="toast-icon ${iconClass}"></i>
                <div class="toast-message">${escapeHtml(message)}</div>
                <i class="toast-close ri-close-line" title="Close"></i>
            `;

            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.onclick = () => removeToast(toast);

            container.appendChild(toast);

            // Auto-dismiss after 4.5 seconds
            const timer = setTimeout(() => {
                removeToast(toast);
            }, 4500);

            function removeToast(el) {
                clearTimeout(timer);
                el.style.animation = 'toastSlideOut 0.3s forwards';
                setTimeout(() => el.remove(), 300);
            }
        },

        /**
         * Glass Modal Controller
         */
        showModal(modalId) {
            const modalOverlay = document.getElementById(modalId);
            if (modalOverlay) {
                modalOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                const firstInput = modalOverlay.querySelector('input, select, textarea');
                if (firstInput) {
                    setTimeout(() => firstInput.focus(), 80);
                }
            }
        },

        hideModal(modalId) {
            const modalOverlay = document.getElementById(modalId);
            if (modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        /**
         * Glass Confirmation Dialog
         */
        showConfirm(message, title = 'Confirm Action') {
            return new Promise((resolve) => {
                let overlay = document.getElementById('globalConfirmModal');
                if (!overlay) {
                    overlay = document.createElement('div');
                    overlay.id = 'globalConfirmModal';
                    overlay.className = 'modal-overlay';
                    overlay.innerHTML = `
                        <div class="modal" style="max-width: 420px; text-align: center;">
                            <div class="modal-body" style="padding: var(--spacing-xl);">
                                <div style="width: 56px; height: 56px; border-radius: 50%; background: rgba(239, 68, 68, 0.12); color: var(--color-danger); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; margin: 0 auto var(--spacing-md);">
                                    <i class="ri-alert-line"></i>
                                </div>
                                <h3 id="confirmTitle" class="modal-title" style="margin-bottom: var(--spacing-xs);">${title}</h3>
                                <p id="confirmMessage" style="font-size: var(--font-size-sm); color: var(--text-secondary);"></p>
                            </div>
                            <div class="modal-footer" style="justify-content: center; gap: var(--spacing-md);">
                                <button class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
                                <button class="btn btn-danger" id="confirmOkBtn">Delete</button>
                            </div>
                        </div>
                    `;
                    document.body.appendChild(overlay);
                }

                overlay.querySelector('#confirmTitle').textContent = title;
                overlay.querySelector('#confirmMessage').textContent = message;

                const okBtn = overlay.querySelector('#confirmOkBtn');
                const cancelBtn = overlay.querySelector('#confirmCancelBtn');

                const cleanup = (result) => {
                    overlay.classList.remove('active');
                    document.body.style.overflow = '';
                    okBtn.onclick = null;
                    cancelBtn.onclick = null;
                    resolve(result);
                };

                okBtn.onclick = () => cleanup(true);
                cancelBtn.onclick = () => cleanup(false);

                overlay.onclick = (e) => {
                    if (e.target === overlay) cleanup(false);
                };

                overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        },

        /**
         * Formatting Utilities
         */
        formatDate(dateStr) {
            if (!dateStr) return '—';
            try {
                const date = new Date(dateStr + 'T00:00:00');
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            } catch {
                return dateStr;
            }
        },

        formatTime(timeStr) {
            if (!timeStr) return '—';
            try {
                const parts = timeStr.split(':');
                let hour = parseInt(parts[0], 10);
                const minute = parts[1] || '00';
                const ampm = hour >= 12 ? 'PM' : 'AM';
                hour = hour % 12 || 12;
                return `${hour}:${minute} ${ampm}`;
            } catch {
                return timeStr;
            }
        },

        formatFrequency(freq) {
            const map = {
                'ONCE_DAILY': 'Once Daily',
                'TWICE_DAILY': 'Twice Daily',
                'THREE_TIMES_DAILY': 'Three Times Daily'
            };
            return map[freq] || freq || '—';
        },

        /**
         * Initialize App Shell Events (Sidebar, Drawer, Theme)
         */
        initApp() {
            // Theme button
            const themeToggleBtn = document.getElementById('themeToggle');
            if (themeToggleBtn && window.ThemeManager) {
                themeToggleBtn.onclick = () => window.ThemeManager.toggle();
                window.ThemeManager.updateIcons(document.documentElement.getAttribute('data-theme') || 'dark');
            }

            // Mobile menu drawer
            const menuToggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            const sidebarClose = document.getElementById('sidebarClose');
            const sidebarOverlay = document.getElementById('sidebarOverlay');

            if (menuToggle && sidebar) {
                menuToggle.onclick = () => {
                    sidebar.classList.add('active');
                    if (sidebarOverlay) sidebarOverlay.classList.add('active');
                };
            }

            const closeSidebar = () => {
                if (sidebar) sidebar.classList.remove('active');
                if (sidebarOverlay) sidebarOverlay.classList.remove('active');
            };

            if (sidebarClose) sidebarClose.onclick = closeSidebar;
            if (sidebarOverlay) sidebarOverlay.onclick = closeSidebar;

            // Global modal background dismissal
            document.querySelectorAll('.modal-overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    if (e.target === overlay) {
                        overlay.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                });
            });

            // Close modals on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    const activeModal = document.querySelector('.modal-overlay.active');
                    if (activeModal) {
                        activeModal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }
            });
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

    window.CarePlan = CarePlan;
})();
