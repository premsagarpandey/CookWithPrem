/**
 * CookWithPrem Security & Anti-Inspection Guard
 * Protects website against Chrome Inspect Element, hotkey inspection,
 * anti-debugging, and protects source code integrity.
 */

(function () {
    'use strict';

    // 1. Disable Right-Click Context Menu
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    });

    // 2. Intercept & Suppress DevTools Keyboard Shortcuts
    document.addEventListener('keydown', function (e) {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }

        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+Shift+K, Ctrl+U (and Mac Cmd+Opt equivalents)
        const isCmdOrCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;
        const key = e.key ? e.key.toLowerCase() : String.fromCharCode(e.keyCode).toLowerCase();

        if (
            (isCmdOrCtrl && isShift && (key === 'i' || key === 'j' || key === 'c' || key === 'k' || key === 'e')) ||
            (isCmdOrCtrl && (key === 'u' || key === 's')) ||
            (isCmdOrCtrl && isAlt && (key === 'i' || key === 'j' || key === 'c' || key === 'u'))
        ) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });

    // 3. Console Scrubber & Anti-Tamper Notice
    const noop = function () {};
    const originalClear = console.clear;

    function scrubConsole() {
        if (typeof console !== 'undefined') {
            console.log = noop;
            console.info = noop;
            console.warn = noop;
            console.error = noop;
            console.table = noop;
            console.dir = noop;
            console.trace = noop;
        }
    }

    scrubConsole();
    setInterval(scrubConsole, 1000);

    // 4. Anti-Debugging Traps & DevTools Window Detection
    let devtoolsOpen = false;

    function detectDevTools() {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;

        if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
            devtoolsOpen = true;
            if (originalClear) originalClear();
            console.warn('%c⚠️ SECURITY NOTICE: Source Code & DevTools Inspection Restricted on CookWithPrem.', 'color: #e74c3c; font-size: 16px; font-weight: bold;');
        } else if (!widthThreshold && !heightThreshold) {
            devtoolsOpen = false;
        }
    }

    window.addEventListener('resize', detectDevTools);
    setInterval(detectDevTools, 1500);

    // 5. Anti-Select & Drag Shield for Sensitive Components
    document.addEventListener('dragstart', function (e) {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
})();
