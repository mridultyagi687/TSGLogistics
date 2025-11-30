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
  // Create the browser window with optimized settings
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    show: false, // Don't show until ready to prevent flash
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    backgroundColor: "#ffffff",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

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

    mainWindow?.loadURL(startUrl).catch((error) => {
      console.error("Failed to load URL:", error);
      // Fallback to backend URL if web app URL fails
      mainWindow?.loadURL(BACKEND_URL).catch((fallbackError) => {
        console.error("Failed to load fallback URL:", fallbackError);
        // Last resort: show error page
        const errorHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>TSG Logistics - Connection Error</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; padding: 50px; text-align: center; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
                .url { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Unable to Load Application</h1>
                <p>Please check your internet connection and try again.</p>
                <p>Web App URL: <span class="url">${WEB_APP_URL}</span></p>
                <p>Backend URL: <span class="url">${BACKEND_URL}</span></p>
                <p style="margin-top: 30px;"><button onclick="window.location.reload()" style="padding: 10px 20px; background: #6366F1; color: white; border: none; border-radius: 4px; cursor: pointer;">Retry</button></p>
              </div>
            </body>
          </html>
        `;
        mainWindow?.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`);
      });
    });
  }

  // Show window when ready to prevent white flash
  mainWindow.once("ready-to-show", () => {
    if (mainWindow) {
      mainWindow.show();
      // Focus the window
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
    const parsedUrl = new URL(navigationUrl);
    
    const allowedHosts = [
      "localhost",
      "127.0.0.1",
      new URL(BACKEND_URL).hostname,
      new URL(WEB_APP_URL).hostname
    ];

    if (!allowedHosts.includes(parsedUrl.hostname)) {
      event.preventDefault();
      shell.openExternal(navigationUrl);
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
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    // Someone tried to run a second instance, focus our window instead
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

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

