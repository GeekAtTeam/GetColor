// GetColor Extension - Popup Script
class ColorPicker {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.checkEyeDropperSupport();
        this.MAX_HISTORY_ITEMS = 12;
        this.loadColorHistory();
    }

    initializeElements() {
        this.pickColorBtn = document.getElementById('pickColorBtn');
        this.colorResult = document.getElementById('colorResult');
        this.colorSwatch = document.getElementById('colorSwatch');
        this.colorHex = document.getElementById('colorHex');
        this.colorRgb = document.getElementById('colorRgb');
        this.copyHexBtn = document.getElementById('copyHexBtn');
        this.copyRgbBtn = document.getElementById('copyRgbBtn');
        this.errorMessage = document.getElementById('errorMessage');
        this.successMessage = document.getElementById('successMessage');
        this.errorText = document.getElementById('errorText');
        this.successText = document.getElementById('successText');
        this.colorHistory = document.getElementById('colorHistory');
        this.historyGrid = document.getElementById('historyGrid');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
    }

    bindEvents() {
        this.pickColorBtn.addEventListener('click', () => this.pickColor());
        this.copyHexBtn.addEventListener('click', () => this.copyToClipboard('hex'));
        this.copyRgbBtn.addEventListener('click', () => this.copyToClipboard('rgb'));
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Add click handler for history squares (using event delegation)
        this.historyGrid.addEventListener('click', (e) => {
            const historySquare = e.target.closest('.history-square');
            if (historySquare) {
                const index = parseInt(historySquare.dataset.index);
                this.useHistoryColor(index);
            }
        });
    }

    checkEyeDropperSupport() {
        if (!window.EyeDropper) {
            this.showError('EyeDropper API is not supported in this browser. Please use Chrome 95+ or Edge 95+.');
            this.pickColorBtn.disabled = true;
        }
    }





    displayDefaultColor() {
        // Show default white color
        this.colorSwatch.style.backgroundColor = '#FFFFFF';
        this.colorHex.textContent = '#FFFFFF';
        this.colorRgb.textContent = 'rgb(255,255,255)';
        
        // Store as current color
        this.currentColor = {
            hex: '#FFFFFF',
            rgb: 'rgb(255,255,255)'
        };
    }

    displayColorFromHistory(color) {
        // Display color from history without adding to history again
        this.colorSwatch.style.backgroundColor = color.hex;
        this.colorHex.textContent = color.hex;
        this.colorRgb.textContent = color.rgb;
        
        // Store as current color
        this.currentColor = {
            hex: color.hex,
            rgb: color.rgb
        };
    }

    async pickColor() {
        try {
            this.hideMessages();
            this.pickColorBtn.disabled = true;
            this.pickColorBtn.textContent = 'Picking...';

            // Check if EyeDropper is available
            if (!window.EyeDropper) {
                throw new Error('EyeDropper API not supported');
            }

            // Create EyeDropper instance
            const eyeDropper = new EyeDropper();
            
            // Start the color picker
            const result = await eyeDropper.open();
            
            if (result && result.sRGBHex) {
                // Display the picked color
                this.displayColor(result.sRGBHex);
                this.showSuccess('Color picked successfully!');
            } else {
                throw new Error('No color selected');
            }

        } catch (error) {
            console.error('Color picking error:', error);
            
            // Handle user cancellation gracefully
            if (error.name === 'AbortError' || error.message.includes('canceled')) {
                this.showSuccess('Color picking canceled');
            } else {
                this.showError(this.getErrorMessage(error));
            }
        } finally {
            // Reset button state
            this.pickColorBtn.disabled = false;
            this.pickColorBtn.textContent = 'Pick a Color';
        }
    }


    displayColor(colorValue) {
        console.log('Raw color value from EyeDropper:', colorValue);
        
        // Handle different color formats
        let normalizedHex, rgbValue;
        
        if (colorValue.startsWith('#')) {
            // Standard HEX format
            normalizedHex = colorValue.toUpperCase();
            rgbValue = this.hexToRgb(normalizedHex);
        } else if (colorValue.startsWith('rgb') || colorValue.startsWith('rgba')) {
            // RGB/RGBA format - convert to HEX
            const result = this.rgbaToHex(colorValue);
            if (result) {
                normalizedHex = result.hex;
                rgbValue = result.rgb;
            } else {
                console.error('Failed to parse RGB/RGBA color:', colorValue);
                this.showError('Invalid color format');
                return;
            }
        } else {
            // Try to treat as HEX without #
            normalizedHex = '#' + colorValue.toUpperCase();
            rgbValue = this.hexToRgb(normalizedHex);
        }
        
        // Validate the final HEX format
        const hexPattern = /^#[0-9A-Fa-f]{6}$/;
        if (!hexPattern.test(normalizedHex)) {
            console.error('Invalid final hex format:', normalizedHex);
            this.showError('Invalid color format');
            return;
        }
        
        console.log('Processed color - HEX:', normalizedHex, 'RGB:', rgbValue);
        
        // Update color swatch
        this.colorSwatch.style.backgroundColor = normalizedHex;
        
        // Update color values
        this.colorHex.textContent = normalizedHex;
        this.colorRgb.textContent = rgbValue;
        
        // Color result is always visible
        
        // Store current color for copying
        this.currentColor = {
            hex: normalizedHex,
            rgb: rgbValue
        };
        
        // Add to history
        this.addToHistory(this.currentColor);
    }

    hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Ensure hex is 6 characters long
        if (hex.length === 3) {
            // Convert 3-digit hex to 6-digit
            hex = hex.split('').map(char => char + char).join('');
        }
        
        // Validate hex length
        if (hex.length !== 6) {
            console.error('Invalid hex color:', hex);
            return 'rgb(0,0,0)';
        }
        
        // Parse hex values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Validate parsed values
        if (isNaN(r) || isNaN(g) || isNaN(b)) {
            console.error('Failed to parse hex color:', hex);
            return 'rgb(0,0,0)';
        }
        
        return `rgb(${r},${g},${b})`;
    }

    rgbaToHex(rgbaString) {
        try {
            // Parse RGB/RGBA string like "rgb(255, 0, 0)" or "rgba(255, 0, 0, 0.5)"
            const match = rgbaString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
            
            if (!match) {
                console.error('Invalid RGB/RGBA format:', rgbaString);
                return null;
            }
            
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            
            // Validate RGB values
            if (isNaN(r) || isNaN(g) || isNaN(b) || r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
                console.error('Invalid RGB values:', { r, g, b });
                return null;
            }
            
            // Convert to HEX
            const hex = '#' + [r, g, b].map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? '0' + hex : hex;
            }).join('').toUpperCase();
            
            const rgb = `rgb(${r},${g},${b})`;
            
            return { hex, rgb };
        } catch (error) {
            console.error('Error parsing RGB/RGBA:', error);
            return null;
        }
    }

    async copyToClipboard(format) {
        try {
            if (!this.currentColor) {
                this.showError('No color selected');
                return;
            }

            const textToCopy = format === 'hex' ? this.currentColor.hex : this.currentColor.rgb;
            
            await navigator.clipboard.writeText(textToCopy);
            this.showSuccess(`${format.toUpperCase()} value copied to clipboard!`);
            
        } catch (error) {
            console.error('Copy error:', error);
            this.showError('Failed to copy to clipboard');
        }
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.classList.remove('hidden');
        this.successMessage.classList.add('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => this.hideMessages(), 5000);
    }

    showSuccess(message) {
        this.successText.textContent = message;
        this.successMessage.classList.remove('hidden');
        this.errorMessage.classList.add('hidden');
        
        // Auto-hide after 3 seconds
        setTimeout(() => this.hideMessages(), 3000);
    }

    hideMessages() {
        // Add hiding class to trigger slide down animation
        if (!this.errorMessage.classList.contains('hidden')) {
            this.errorMessage.classList.add('hiding');
            setTimeout(() => {
                this.errorMessage.classList.add('hidden');
                this.errorMessage.classList.remove('hiding');
            }, 300); // Match the slideDown animation duration
        }
        
        if (!this.successMessage.classList.contains('hidden')) {
            this.successMessage.classList.add('hiding');
            setTimeout(() => {
                this.successMessage.classList.add('hidden');
                this.successMessage.classList.remove('hiding');
            }, 300); // Match the slideDown animation duration
        }
    }

    getErrorMessage(error) {
        if (error.name === 'NotAllowedError') {
            return 'Permission denied. Please allow the extension to access the page.';
        } else if (error.name === 'NotSupportedError') {
            return 'EyeDropper API is not supported in this browser.';
        } else if (error.message.includes('not supported')) {
            return 'This feature requires Chrome 95+ or Edge 95+.';
        } else {
            return 'An error occurred while picking the color. Please try again.';
        }
    }

    // Color History Methods - Circular Queue Implementation
    loadColorHistory() {
        chrome.storage.local.get(['colorHistory'], (result) => {
            this.colorHistoryData = result.colorHistory || [];
            this.renderHistory();
            
            // Display the most recent color from history, or default white if no history
            if (this.colorHistoryData.length > 0) {
                const mostRecentColor = this.colorHistoryData[0];
                this.displayColorFromHistory(mostRecentColor);
            } else {
                this.displayDefaultColor();
            }
        });
    }


    saveColorHistory() {
        chrome.storage.local.set({ colorHistory: this.colorHistoryData });
    }

    addToHistory(color) {
        // Validate color object
        if (!color || !color.hex || !color.rgb) {
            console.error('Invalid color object:', color);
            return;
        }
        
        // Validate hex format
        const hexPattern = /^#[0-9A-Fa-f]{3,6}$/;
        if (!hexPattern.test(color.hex)) {
            console.error('Invalid hex color in history:', color.hex);
            return;
        }
        
        // Check if color already exists in history
        const existingIndex = this.colorHistoryData.findIndex(item => item.hex === color.hex);
        
        if (existingIndex !== -1) {
            // Remove existing entry
            this.colorHistoryData.splice(existingIndex, 1);
        }
        
        // Add to beginning of array
        this.colorHistoryData.unshift({
            ...color,
            timestamp: Date.now()
        });
        
        // Implement FIFO circular queue - keep only MAX_HISTORY_ITEMS
        if (this.colorHistoryData.length > this.MAX_HISTORY_ITEMS) {
            this.colorHistoryData = this.colorHistoryData.slice(0, this.MAX_HISTORY_ITEMS);
        }
        
        this.saveColorHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.colorHistoryData.length === 0) {
            this.colorHistory.classList.add('hidden');
            return;
        }

        this.colorHistory.classList.remove('hidden');
        
        // Create grid of color squares
        this.historyGrid.innerHTML = this.colorHistoryData.map((color, index) => {
            // Validate color before rendering
            if (!color || !color.hex) {
                console.error('Invalid color in history at index:', index, color);
                return `<div class="history-square" 
                             style="background-color: #cccccc" 
                             data-index="${index}"
                             title="Invalid color - Click to copy">
                        </div>`;
            }
            
            return `<div class="history-square" 
                         style="background-color: ${color.hex}" 
                         data-index="${index}"
                         title="${color.hex} - Click to copy">
                    </div>`;
        }).join('');
    }

    useHistoryColor(index) {
        const color = this.colorHistoryData[index];
        if (color) {
            // Move the clicked color to the front of the queue
            this.moveColorToFront(index);
            
            // Display the color
            this.displayColorFromHistory(color);
            // this.showSuccess('Color loaded from history!');
        }
    }

    moveColorToFront(index) {
        if (index >= 0 && index < this.colorHistoryData.length) {
            // Remove the color from its current position
            const color = this.colorHistoryData.splice(index, 1)[0];
            
            // Add it to the front of the array
            this.colorHistoryData.unshift(color);
            
            // Save the updated history
            this.saveColorHistory();
            
            // Re-render the history grid
            this.renderHistory();
        }
    }

    async copyHistoryColor(index) {
        const color = this.colorHistoryData[index];
        if (color) {
            try {
                await navigator.clipboard.writeText(color.hex);
                this.showSuccess(`Copied ${color.hex} to clipboard!`);
            } catch (error) {
                this.showError('Failed to copy to clipboard');
            }
        }
    }

    clearHistory() {
        this.colorHistoryData = [];
        this.saveColorHistory();
        this.renderHistory();
        this.displayDefaultColor(); // Show default white after clearing
        this.showSuccess('Color history cleared!');
    }
}

// Initialize the color picker when the popup loads
let colorPicker;
document.addEventListener('DOMContentLoaded', () => {
    colorPicker = new ColorPicker();
});
