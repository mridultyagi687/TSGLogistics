# TSG Logistics Desktop App

Electron-based desktop application for TSG Logistics.

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build TypeScript
npm run build

# Build for macOS (.dmg)
npm run build:mac

# Build for Windows (.exe)
npm run build:win

# Build for all platforms
npm run build:all
```

## Configuration

The app connects to the backend services. You can configure the URLs via:

1. Environment variables:
   - `BACKEND_URL` - Backend API URL
   - `WEB_APP_URL` - Web app URL (default: https://tsglogistics-ui.onrender.com)

2. App settings (stored in electron-store)

## Building Distributables

### macOS (.dmg)
```bash
npm run build:mac
```

Output: `dist-electron/TSG Logistics-{version}.dmg`

### Windows (.exe)
```bash
npm run build:win
```

Output: `dist-electron/TSG Logistics Setup {version}.exe`

**Note:** Building Windows .exe on macOS requires:
- Wine (for code signing) - optional
- Or build on a Windows machine
- Or use GitHub Actions/CI for cross-platform builds

The .exe installer will:
- Allow custom installation directory
- Create desktop shortcut
- Create Start Menu shortcut
- Run the app after installation

## Troubleshooting

### App crashes on startup
- Check that the backend URL is accessible
- Check console logs for errors
- Try setting `BACKEND_URL` environment variable

### Memory issues
- The app includes optimizations to prevent memory leaks
- Close and reopen the app if memory usage is high

## Security

- Node integration is disabled
- Context isolation is enabled
- Remote module is disabled
- External links open in default browser

