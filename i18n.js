// Internationalization utility for GetColor extension
class I18n {
    constructor() {
        this.messages = {
            en: {
                colorFormatHex: "HEX: Hexadecimal color value, commonly used in web development",
                colorFormatRgb: "RGB: Red, Green, Blue values, range 0-255",
                colorFormatHsl: "HSL: Hue, Saturation, Lightness - more intuitive color representation",
                copyHex: "Copy HEX",
                copyRgb: "Copy RGB",
                copyHsl: "Copy HSL",
                recentColors: "Recent Colors",
                clearHistory: "Clear all history",
                pickColor: "Pick a Color",
                pickingColor: "Picking...",
                clickAnywhere: "Click anywhere on the screen to pick a color",
                colorPickedSuccess: "Color picked successfully!",
                colorPickedCanceled: "Color picking canceled",
                colorHistoryCleared: "Color history cleared!",
                valueCopied: "value copied to clipboard!",
                noColorSelected: "No color selected",
                failedToCopy: "Failed to copy to clipboard",
                eyedropperNotSupported: "EyeDropper API is not supported in this browser. Please use Chrome 95+ or Edge 95+.",
                language: "Language",
                autoDetect: "Auto Detect",
                settings: "Settings",
                languageChanged: "Language changed successfully!"
            },
            zh_CN: {
                colorFormatHex: "HEX: 十六进制颜色值，常用于Web开发",
                colorFormatRgb: "RGB: 红绿蓝三原色值，范围0-255",
                colorFormatHsl: "HSL: 色相、饱和度、明度，更直观的颜色表示",
                copyHex: "复制HEX",
                copyRgb: "复制RGB",
                copyHsl: "复制HSL",
                recentColors: "最近颜色",
                clearHistory: "清除所有历史",
                pickColor: "选择颜色",
                pickingColor: "取色中...",
                clickAnywhere: "点击屏幕任意位置选择颜色",
                colorPickedSuccess: "颜色选择成功！",
                colorPickedCanceled: "颜色选择已取消",
                colorHistoryCleared: "颜色历史已清除！",
                valueCopied: "值已复制到剪贴板！",
                noColorSelected: "未选择颜色",
                failedToCopy: "复制到剪贴板失败",
                eyedropperNotSupported: "此浏览器不支持 EyeDropper API。请使用 Chrome 95+ 或 Edge 95+。",
                language: "语言",
                autoDetect: "自动检测",
                settings: "设置",
                languageChanged: "语言切换成功！"
            }
        };
        this.currentLocale = this.getCurrentLocale();
        this.supportedLocales = ['en', 'zh_CN'];
    }

    // Get current locale
    getCurrentLocale() {
        return chrome.i18n.getUILanguage() || 'en';
    }

    // Get message by key
    getMessage(key, substitutions = []) {
        try {
            const locale = this.currentLocale === 'auto' ? this.getCurrentLocale() : this.currentLocale;
            const messages = this.messages[locale] || this.messages['en'];
            return messages[key] || key;
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

        // Update select options
        const selectOptions = document.querySelectorAll('option[data-i18n]');
        selectOptions.forEach(option => {
            const key = option.getAttribute('data-i18n');
            const message = this.getMessage(key);
            if (message) {
                option.textContent = message;
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

    // Load user language preference
    async loadLanguagePreference() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['languagePreference'], (result) => {
                resolve(result.languagePreference || 'auto');
            });
        });
    }

    // Save user language preference
    async saveLanguagePreference(language) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ languagePreference: language }, () => {
                resolve();
            });
        });
    }

    // Get effective locale (user preference or auto-detect)
    async getEffectiveLocale() {
        const preference = await this.loadLanguagePreference();
        if (preference === 'auto') {
            const browserLocale = this.getCurrentLocale();
            return this.supportedLocales.includes(browserLocale) ? browserLocale : 'en';
        }
        return this.supportedLocales.includes(preference) ? preference : 'en';
    }

    // Change language
    async changeLanguage(language) {
        await this.saveLanguagePreference(language);
        this.currentLocale = language === 'auto' ? this.getCurrentLocale() : language;
        
        // Update all text content immediately
        this.initializeTexts();
        
        // Show success message
        if (window.colorPicker) {
            window.colorPicker.showSuccess(this.getMessage('languageChanged'));
        }
    }

    // Initialize language selector
    async initializeLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;

        const preference = await this.loadLanguagePreference();
        this.currentLocale = preference === 'auto' ? this.getCurrentLocale() : preference;
        languageSelect.value = preference;

        languageSelect.addEventListener('change', async (e) => {
            const newLanguage = e.target.value;
            await this.changeLanguage(newLanguage);
        });
    }
}

// Create global instance
window.i18n = new I18n();
