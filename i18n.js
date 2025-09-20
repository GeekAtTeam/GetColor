// Internationalization utility for GetColor extension
class I18n {
    constructor() {
        this.messages = {};
        this.currentLocale = this.getCurrentLocale();
    }

    // Get current locale
    getCurrentLocale() {
        return chrome.i18n.getUILanguage() || 'en';
    }

    // Get message by key
    getMessage(key, substitutions = []) {
        try {
            return chrome.i18n.getMessage(key, substitutions);
        } catch (error) {
            console.warn(`Failed to get message for key: ${key}`, error);
            return key; // Fallback to key name
        }
    }

    // Get message with fallback
    getMessageWithFallback(key, fallback) {
        const message = this.getMessage(key);
        return message || fallback || key;
    }

    // Initialize all text content
    initializeTexts() {
        // Update HTML elements with i18n attributes
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const message = this.getMessage(key);
            if (message) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.placeholder = message;
                } else {
                    element.textContent = message;
                }
            }
        });

        // Update title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            const message = this.getMessage(key);
            if (message) {
                element.title = message;
            }
        });
    }

    // Get localized tooltip for color formats
    getColorFormatTooltip(format) {
        const key = `colorFormat${format.charAt(0).toUpperCase() + format.slice(1)}`;
        return this.getMessage(key);
    }

    // Get localized copy button title
    getCopyButtonTitle(format) {
        const key = `copy${format.charAt(0).toUpperCase() + format.slice(1)}`;
        return this.getMessage(key);
    }
}

// Create global instance
window.i18n = new I18n();
