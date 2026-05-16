(function () {
    'use strict';

    const CARD_PADDING = 28;
    const THEME_PADDING = 32;
    const easeSpring = 'cubic-bezier(0.16, 1, 0.3, 1)';

    /* =========================================
       Utilities
       ========================================= */
    function debounce(fn, wait) {
        let t;
        return (...args) => {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    /* =========================================
       Collapsible Cards (Education / Experience)
       ========================================= */
    function expandCard(card) {
        const content = card.querySelector('.card-content');
        if (!content) return;

        card.classList.add('open');
        card.setAttribute('aria-expanded', 'true');

        content.style.transition = 'none';
        content.style.maxHeight = 'none';
        content.style.opacity = '0';
        content.style.marginTop = '0px';
        const targetHeight = content.scrollHeight;
        content.style.maxHeight = '0px';

        requestAnimationFrame(() => {
            content.offsetHeight; // force reflow
            content.style.transition = `max-height 0.5s ${easeSpring}, opacity 0.4s ease, margin-top 0.4s ease`;
            content.style.maxHeight = (targetHeight + CARD_PADDING) + 'px';
            content.style.opacity = '1';
            content.style.marginTop = '16px';
        });
    }

    function collapseCard(card) {
        const content = card.querySelector('.card-content');
        if (!content) return;

        const currentHeight = content.scrollHeight;
        content.style.transition = 'none';
        content.style.maxHeight = currentHeight + 'px';
        content.offsetHeight; // force reflow

        content.style.transition = `max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-top 0.3s ease`;
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.marginTop = '0px';

        card.classList.remove('open');
        card.setAttribute('aria-expanded', 'false');

        const onTransitionEnd = (e) => {
            if (e.propertyName === 'max-height' && !card.classList.contains('open')) {
                content.style.maxHeight = '';
                content.removeEventListener('transitionend', onTransitionEnd);
            }
        };
        content.addEventListener('transitionend', onTransitionEnd);
    }

    function handleCardClick(event, card) {
        const target = event.target;
        if (target.closest('a') || target.closest('.tag')) return;

        const isOpen = card.classList.contains('open');
        if (isOpen) {
            collapseCard(card);
        } else {
            expandCard(card);
        }
    }

    document.querySelectorAll('.card.collapsible').forEach(card => {
        card.addEventListener('click', function (e) {
            e.stopPropagation();
            handleCardClick(e, card);
        });

        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(e, card);
            }
        });
    });

    /* =========================================
       Collapsible Research Themes
       ========================================= */
    function expandTheme(theme) {
        const content = theme.querySelector('.theme-content');
        if (!content) return;

        theme.classList.add('active');
        theme.setAttribute('aria-expanded', 'true');

        content.style.transition = 'none';
        content.style.maxHeight = 'none';
        content.style.opacity = '0';
        content.style.marginTop = '0px';
        const targetHeight = content.scrollHeight;
        content.style.maxHeight = '0px';

        requestAnimationFrame(() => {
            content.offsetHeight; // force reflow
            content.style.transition = `max-height 0.5s ${easeSpring}, opacity 0.4s ease, margin-top 0.4s ease`;
            content.style.maxHeight = (targetHeight + THEME_PADDING) + 'px';
            content.style.opacity = '1';
            content.style.marginTop = '20px';
        });
    }

    function collapseTheme(theme) {
        const content = theme.querySelector('.theme-content');
        if (!content) return;

        const currentHeight = content.scrollHeight;
        content.style.transition = 'none';
        content.style.maxHeight = currentHeight + 'px';
        content.offsetHeight; // force reflow

        content.style.transition = `max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-top 0.3s ease`;
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
        content.style.marginTop = '0px';

        theme.classList.remove('active');
        theme.setAttribute('aria-expanded', 'false');

        const onTransitionEnd = (e) => {
            if (e.propertyName === 'max-height' && !theme.classList.contains('active')) {
                content.style.maxHeight = '';
                content.removeEventListener('transitionend', onTransitionEnd);
            }
        };
        content.addEventListener('transitionend', onTransitionEnd);
    }

    function handleThemeClick(event, theme) {
        const target = event.target;
        if (target.closest('a') || target.closest('.tag') || target.closest('.theme-content')) return;

        const isActive = theme.classList.contains('active');
        if (isActive) {
            collapseTheme(theme);
        } else {
            expandTheme(theme);
        }
    }

    document.querySelectorAll('.research-theme.collapsible-area').forEach(theme => {
        theme.addEventListener('click', function (e) {
            e.stopPropagation();
            handleThemeClick(e, theme);
        });

        theme.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleThemeClick(e, theme);
            }
        });
    });

    /* =========================================
       Height Recalculation on Resize
       ========================================= */
    function updateAllHeights() {
        document.querySelectorAll('.card.collapsible.open').forEach(card => {
            const content = card.querySelector('.card-content');
            if (content) {
                content.style.transition = 'none';
                content.style.maxHeight = 'none';
                const h = content.scrollHeight;
                content.style.maxHeight = (h + CARD_PADDING) + 'px';
            }
        });

        document.querySelectorAll('.research-theme.active').forEach(theme => {
            const content = theme.querySelector('.theme-content');
            if (content) {
                content.style.transition = 'none';
                content.style.maxHeight = 'none';
                const h = content.scrollHeight;
                content.style.maxHeight = (h + THEME_PADDING) + 'px';
            }
        });
    }

    window.addEventListener('resize', debounce(updateAllHeights, 200));

    /* =========================================
       Sticky Nav — Glassmorphism Only
       ========================================= */
    (function initStickyNav() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        const darkMQ = window.matchMedia('(prefers-color-scheme: dark)');
        function updateNavBg() {
            nav.style.background = darkMQ.matches
                ? 'rgba(0, 0, 0, 0.72)'
                : 'rgba(245, 245, 247, 0.72)';
        }
        darkMQ.addEventListener('change', updateNavBg);
        updateNavBg();
    })();

    /* =========================================
       Photography Masonry — Shortest Column
       ========================================= */
    (function initPhotoMasonry() {
        const grid = document.querySelector('.photo-grid');
        if (!grid) return;

        function buildMasonry() {
            const items = Array.from(grid.querySelectorAll('.photo-item'));
            if (items.length === 0) return;

            const COLUMN_COUNT = window.innerWidth < 768 ? 2 : 3;

            // Clear and rebuild columns
            grid.innerHTML = '';
            const columns = Array.from({ length: COLUMN_COUNT }, () => {
                const col = document.createElement('div');
                col.className = 'photo-column';
                return col;
            });
            columns.forEach(c => grid.appendChild(c));

            // Distribute to shortest column
            items.forEach(item => {
                const shortestCol = columns.reduce((prev, curr) =>
                    (curr.scrollHeight <= prev.scrollHeight ? curr : prev), columns[0]
                );
                shortestCol.appendChild(item);
            });
        }

        buildMasonry();

        // Rebuild on resize only if column count changes
        window.addEventListener('resize', debounce(() => {
            const newCount = window.innerWidth < 768 ? 2 : 3;
            const currentCount = document.querySelectorAll('.photo-column').length;
            if (newCount !== currentCount) {
                buildMasonry();
            }
        }, 250));
    })();

    /* =========================================
       Intersection Observer — Scroll Reveal
       ========================================= */
    (function initReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.05,
            rootMargin: '0px 0px 80px 0px'  
        });

        const selectors = [
            'section',
            '.card.collapsible',
            '.research-theme.collapsible-area',
            '.project-card',
            '.award-item',
            '.photo-item'
        ].join(', ');

        const elements = document.querySelectorAll(selectors);
        const viewportHeight = window.innerHeight;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < viewportHeight + 100 && rect.bottom > -50) {
                el.classList.add('reveal');
            } else {
                observer.observe(el);
            }
        });
    })();

    console.log('✅ Portfolio initialized');
})();