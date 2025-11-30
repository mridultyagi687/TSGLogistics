import { app, BrowserWindow, Menu, shell } from "electron";
import * as path from "path";
import * as fs from "fs";
import Store from "electron-store";

// Initialize electron-store for persistent data
const store = new Store();

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === "development";

// Backend URL - can be configured via environment variable or settings
const BACKEND_URL = process.env.BACKEND_URL || store.get("backendUrl") as string || "https://tsg-logistics.onrender.com";
const WEB_APP_URL = process.env.WEB_APP_URL || store.get("webAppUrl") as string || "https://tsglogistics-ui.onrender.com";

function createWindow(): void {
  // Check if preload file exists, use empty string if not
  let preloadPath = path.join(__dirname, "preload.js");
  try {
    if (!fs.existsSync(preloadPath)) {
      preloadPath = path.join(__dirname, "preload.ts"); // Try TypeScript version
      if (!fs.existsSync(preloadPath)) {
        console.warn("Preload file not found, continuing without it");
        preloadPath = ""; // Electron will handle empty preload gracefully
      }
    }
  } catch (err) {
    console.warn("Error checking preload file:", err);
    preloadPath = "";
  }

  // Create the browser window with optimized settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: true, // Show immediately to prevent "not responding"
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: preloadPath || undefined
    }
  });

  // Show loading indicator immediately
  mainWindow.loadURL(`data:text/html,${encodeURIComponent(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Loading TSG Logistics...</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100vh; 
            margin: 0; 
            background: #f5f5f5; 
          }
          .container { text-align: center; }
          .spinner { 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #6366F1; 
            border-radius: 50%; 
            width: 50px; 
            height: 50px; 
            animation: spin 1s linear infinite; 
            margin: 0 auto 20px; 
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h1 { color: #333; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>Loading TSG Logistics...</h1>
        </div>
      </body>
    </html>
  `)}`);

  // Load the app - try multiple paths
  loadApp();

  function loadApp() {
    // Try different possible paths for the HTML file
    const possiblePaths = [
      path.join(__dirname, "../frontend/dist/index.html"),
      path.join(process.resourcesPath, "frontend/dist/index.html"),
      path.join(app.getAppPath(), "frontend/dist/index.html"),
      path.join(__dirname, "frontend/dist/index.html")
    ];

    // Check if any local HTML file exists (for packaged app)
    let htmlPath: string | null = null;
    for (const possiblePath of possiblePaths) {
      try {
        if (fs.existsSync(possiblePath)) {
          htmlPath = possiblePath;
          console.log("Found local HTML file:", htmlPath);
          break;
        }
      } catch (err) {
        // Continue checking other paths
      }
    }

    if (htmlPath) {
      console.log("Loading from local HTML file:", htmlPath);
      mainWindow?.loadFile(htmlPath).catch((error) => {
        console.error("Failed to load local HTML file:", error);
        // Fallback to URL
        loadFromUrl();
      });
    } else {
      // No local file found, load from URL
      console.log("No local HTML file found, loading from URL");
      loadFromUrl();
    }
  }

  function loadFromUrl() {
    const startUrl = isDev 
      ? "http://localhost:3000" 
      : WEB_APP_URL;

    // Set timeout to prevent hanging
    const loadTimeout = setTimeout(() => {
      console.warn("URL load timeout, showing error page");
      showErrorPage("Connection timeout. Please check your internet connection.");
    }, 10000); // 10 second timeout

    mainWindow?.loadURL(startUrl, {
      timeout: 5000
    }).then(() => {
      clearTimeout(loadTimeout);
    }).catch((error) => {
      clearTimeout(loadTimeout);
      console.error("Failed to load URL:", error);
      // Fallback to backend URL if web app URL fails
      if (BACKEND_URL && BACKEND_URL !== startUrl) {
        mainWindow?.loadURL(BACKEND_URL, {
          timeout: 5000
        }).catch((fallbackError) => {
          console.error("Failed to load fallback URL:", fallbackError);
          showErrorPage(`Unable to connect to application servers.\n\nWeb App: ${WEB_APP_URL}\nBackend: ${BACKEND_URL}`);
        });
      } else {
        showErrorPage(`Unable to connect to application.\n\nURL: ${startUrl}`);
      }
    });
  }

  function showErrorPage(message: string) {
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>TSG Logistics - Connection Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 50px; text-align: center; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; line-height: 1.6; white-space: pre-line; }
            .url { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; font-size: 0.9em; }
            button { padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 20px; }
            button:hover { background: #4F46E5; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Unable to Load Application</h1>
            <p>${message}</p>
            <button onclick="window.location.reload()">Retry</button>
          </div>
        </body>
      </html>
    `;
    mainWindow?.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`);
  }

  // Window is already shown, just focus when ready
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.focus();
      if (isDev) {
        mainWindow.webContents.openDevTools();
      }
    }
  });

  // Handle window closed
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  // Prevent navigation to external URLs (except allowed domains)
  mainWindow.webContents.on("will-navigate", (event, navigationUrl) => {
    try {
      const parsedUrl = new URL(navigationUrl);
      
      // Safely get hostnames from URLs
      const allowedHosts = ["localhost", "127.0.0.1"];
      try {
        allowedHosts.push(new URL(BACKEND_URL).hostname);
      } catch (e) {
        console.warn("Invalid BACKEND_URL:", BACKEND_URL);
      }
      try {
        allowedHosts.push(new URL(WEB_APP_URL).hostname);
      } catch (e) {
        console.warn("Invalid WEB_APP_URL:", WEB_APP_URL);
      }

      if (!allowedHosts.includes(parsedUrl.hostname)) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    } catch (error) {
      console.error("Error parsing navigation URL:", error);
      // Allow navigation if we can't parse the URL
    }
  });

  // Create application menu
  createMenu();

  // Handle crashes gracefully
  mainWindow.webContents.on("render-process-gone", (event, details) => {
    console.error("Render process crashed:", details);
    // Optionally reload the window
    if (details.reason === "crashed") {
      // Don't auto-reload to prevent crash loop
      console.error("App crashed. Please restart the application.");
    }
  });

  // Prevent unresponsive renderer
  mainWindow.on("unresponsive", () => {
    console.warn("Window became unresponsive");
  });

  mainWindow.on("responsive", () => {
    console.log("Window became responsive again");
  });
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "File",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => {
            if (mainWindow) {
              mainWindow.reload();
            }
          }
        },
        {
          label: "Settings",
          click: () => {
            // Open settings window/dialog
            console.log("Open settings");
          }
        },
        { type: "separator" },
        {
          label: "Quit",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools", visible: isDev },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Window",
      submenu: [
        { role: "minimize" },
        { role: "close" }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About TSG Logistics",
          click: () => {
            // Show about dialog
            console.log("About TSG Logistics");
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "services" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" }
      ]
    });

    // Window menu
    template[4].submenu = [
      { role: "close" },
      { role: "minimize" },
      { role: "zoom" },
      { type: "separator" },
      { role: "front" }
    ];
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on("window-all-closed", () => {
  // On macOS, keep the app running even when all windows are closed
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Handle app protocol (optional - for custom URL schemes)
app.setAsDefaultProtocolClient("tsg-logistics");

// Prevent multiple instances (optional)
// Only enforce single instance after app is ready
app.whenReady().then(() => {
  const gotTheLock = app.requestSingleInstanceLock();

  if (!gotTheLock) {
    console.log("Another instance is already running, quitting...");
    app.quit();
  } else {
    app.on("second-instance", () => {
      // Someone tried to run a second instance, focus our window instead
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.focus();
      } else {
        // Window was closed, create a new one
        createWindow();
      }
    });
  }
});

// Security: Prevent new window creation
app.on("web-contents-created", (event, contents) => {
  contents.on("new-window", (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// Handle uncaught exceptions to prevent crashes
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Don't quit the app - log the error instead
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // Don't quit the app - log the error instead
});

