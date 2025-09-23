# GetColor
A simple and powerful browser extension for picking colors from the screen.

Supports Chrome, Edge and other Chromium-based browsers.  

![](./icons/getcolor-icon-128px.png)

## ✨ Features

- 🎨 **Pick a pixel color** — Click anywhere on the screen to get its HEX/RGB/HSL value  
- 📋 **Copy to clipboard** — One-click copy for easy use in design or code  
- 🖌️ **Simple interface** — Lightweight and user-friendly popup UI  

> 🚧 More features are on the way:
> - Calculate average color of a selected area
> - Analyze color palettes in a region
> - Export palettes for design tools



## 🚀 Installation

### From source
1. Clone this repo

   ```bash
   git clone https://github.com/GeekAtTeam/GetColor.git
   cd GetColor
   ```

2. Open your browser and go to:

   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`

3. Enable **Developer mode**

4. Click **Load unpacked** and select this project folder

The extension icon will now appear in your toolbar 🎉



## 🛠️ Development

- The extension is built with **Manifest V3**
- Uses the EyeDropper API for color picking
- Popup UI is built with plain HTML/CSS/JS (easy to extend)

### File structure

```bash
getcolor/
│── manifest.json      # Extension config
│── background.js      # Background service worker
│── content.js         # (Future) Injected scripts
│── popup.html         # Popup UI
│── popup.js
│── icons/             # Extension icons
```



## 📦 Build & Publish

When ready to release:

1. Zip the extension folder
2. Submit to:
   - [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
   - [Edge Add-ons](https://partner.microsoft.com/dashboard/microsoftedge)



## 🤝 Contributing

Contributions are welcome!

- Report issues via [GitHub Issues](https://github.com/GeekAtTeam/GetColor/issues)
- Submit PRs with improvements or new features



## 📄 License

This project is licensed under the [MIT License](./LICENSE).
