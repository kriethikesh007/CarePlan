/**
 * CarePlan Theme Manager
 * Controls Dark and Light mode, system preference detection, and localStorage persistence.
 */
(function() {
    const STORAGE_KEY = 'careplan_theme_preference';

    const ThemeManager = {
        init() {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved === 'light' || saved === 'dark') {
                this.apply(saved);
            } else {
                // Check OS system preference
                const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.apply(prefersDark ? 'dark' : 'light');
            }

            // Listen for system theme changes if no override
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (!localStorage.getItem(STORAGE_KEY)) {
                        this.apply(e.matches ? 'dark' : 'light');
                    }
                });
            }
        },

        toggle() {
            const current = document.documentElement.getAttribute('data-theme') || 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            this.apply(next);
            localStorage.setItem(STORAGE_KEY, next);
        },

        apply(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            this.updateIcons(theme);
        },

        updateIcons(theme) {
            const toggleBtns = document.querySelectorAll('#themeToggle, .theme-toggle-btn');
            toggleBtns.forEach(btn => {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'ri-sun-line' : 'ri-moon-line';
                }
                btn.setAttribute('title', theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode');
            });
        }
    };

    window.ThemeManager = ThemeManager;
    // Execute immediately to prevent flash of wrong theme
    ThemeManager.init();
})();
