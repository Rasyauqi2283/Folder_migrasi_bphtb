(function () {
    'use strict';

    document.addEventListener('DOMContentLoaded', function () {
        const root = document.documentElement;
        const body = document.body;
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        const footerContent = document.querySelector('.footer');

        if (!mainContent) return;

        // Default widths. Sesuaikan dengan CSS jika berubah.
        const SIDEBAR_WIDTH_EXPANDED = 250;
        const SIDEBAR_WIDTH_COLLAPSED = 60;

        function setMainWidth(px) {
            try { mainContent.style.width = `calc(100vw - ${px}px)`; } catch (_) {}
        }

        function applyLayout(isExpanded) {
            const px = isExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
            setMainWidth(px);
            if (footerContent) footerContent.classList.toggle('shifted', isExpanded);
            mainContent.classList.toggle('shifted', isExpanded);
            body.setAttribute('data-sidebar', isExpanded ? 'expanded' : 'collapsed');
            window.dispatchEvent(new CustomEvent('main:layout', { detail: { expanded: isExpanded } }));
            adjustMainTables();
        }

        // Inisialisasi dari state saat ini
        const initialExpanded = !!(sidebar && sidebar.classList.contains('expand'));
        applyLayout(initialExpanded);

        // Observasi perubahan class pada sidebar (sinkron dengan fungsi expand/collapse di fungsi.js)
        if (sidebar) {
            const observer = new MutationObserver((mutations) => {
                for (const m of mutations) {
                    if (m.attributeName === 'class') {
                        applyLayout(sidebar.classList.contains('expand'));
                        break;
                    }
                }
            });
            observer.observe(sidebar, { attributes: true });
        }

        function adjustMainTables() {
            try {
                // Container should never overflow viewport width
                mainContent.style.maxWidth = '100vw';
                mainContent.style.overflowX = 'hidden';

                const tables = mainContent.querySelectorAll('table');
                tables.forEach((tableEl) => {
                    tableEl.style.width = '95%';
                    tableEl.style.tableLayout = 'fixed';
                    // Ensure wrapping for long tokens (NOP, npwp, etc.)
                    tableEl.querySelectorAll('th, td').forEach((cell) => {
                        cell.style.wordBreak = 'break-word';
                        cell.style.overflowWrap = 'anywhere';
                        cell.style.whiteSpace = 'normal';
                    });
                    // Guard parent container for scroll if content still wider
                    const parent = tableEl.parentElement;
                    if (parent) {
                        parent.style.maxWidth = '100%';
                        // If layout engine still needs room, allow horizontal scroll at container level
                        if (!parent.classList.contains('table-scroll')) {
                            parent.classList.add('table-scroll');
                            parent.style.overflowX = 'auto';
                        }
                    }
                });
            } catch (_) {}
        }

        // API kecil untuk dipakai halaman lain jika perlu
        window.MainLayout = {
            lockScroll(lock) {
                try { root.style.overflow = lock ? 'hidden' : ''; } catch (_) {}
            },
            forceApply(expanded) {
                applyLayout(!!expanded);
            }
        };

        // Initial table adjust
        adjustMainTables();
    });
})();


