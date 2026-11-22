# Android + Termux development

The project is designed to avoid native Node modules. Run it inside the Ubuntu environment installed through Termux.

## 1. Check the runtime

```bash
node -v
npm -v
git --version
```

Use Node.js 20 or newer. If npm reports that your Node version is unsupported, fix the Node/npm pairing before installing dependencies.

## 2. Clone the repository

```bash
git clone https://github.com/andrewewat2-design/virtual-live-studio.git
cd virtual-live-studio
```

If you already cloned it:

```bash
cd ~/virtual-live-studio
git pull
```

## 3. Install and verify

```bash
npm install
npm run check
npm test
npm run build
```

Do not proceed to the browser test if any command fails. Copy the complete error output for debugging.

## 4. Start the studio

```bash
npm run dev
```

Open `http://127.0.0.1:5173` in the browser on the same phone. The frontend uses port 5173 and proxies API/WebSocket requests to the local Node server on port 8787.

Stop the development processes with Ctrl+C in the terminal.

## 5. Screen capture test

The screen-capture feature depends on browser support. Open the studio in a browser that exposes `navigator.mediaDevices.getDisplayMedia`. Tap **Share TikTok screen**, choose the TikTok browser tab/window in the browser's own chooser, and verify that the preview appears. Stop sharing using the studio button or the browser's sharing indicator.

If the API is unavailable in the Android browser, do not treat that as a project failure: record the browser name/version and repeat the screen-capture acceptance test in a supported desktop browser. Android browser support is a compatibility question that must be measured on the actual device.

The current milestone only previews the selected screen locally. It does not send captured frames to a server or AI provider and does not yet interpret comments. Never share a screen containing passwords, private messages, payment details, or other information you do not want captured.
