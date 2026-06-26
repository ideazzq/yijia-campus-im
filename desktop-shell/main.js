const { app, BrowserWindow, dialog, nativeImage } = require("electron");
const net = require("net");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const APP_VERSION = "0.0.3";
const APP_FOLDER_NAME = "YijiaCampusSystem";
const APP_DISPLAY_NAME = "翼家校园通信系统";
const BACKEND_EXE_NAME = "YijiaApp.exe";
const APP_ID = "com.yijia.campus";
const DEFAULT_LOCAL_BASE_URL = "http://127.0.0.1:8080";
const PORT = 8080;
const HOST = "127.0.0.1";
const START_TIMEOUT_MS = 90000;

let backendProcess = null;
let mainWindow = null;

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

function getResourcePath(...segments) {
  return path.join(process.resourcesPath, ...segments);
}

function getRuntimeRoot() {
  return getResourcePath("runtime", "YijiaApp");
}

function findBackendExecutable(rootDir, maxDepth = 3, depth = 0) {
  if (!fs.existsSync(rootDir) || depth > maxDepth) {
    return null;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase() === BACKEND_EXE_NAME.toLowerCase()) {
      return path.join(rootDir, entry.name);
    }
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const found = findBackendExecutable(path.join(rootDir, entry.name), maxDepth, depth + 1);
    if (found) {
      return found;
    }
  }

  return null;
}

function getBackendExecutableInfo() {
  const runtimeRoot = getRuntimeRoot();
  const directCandidate = path.join(runtimeRoot, BACKEND_EXE_NAME);

  if (fs.existsSync(directCandidate)) {
    return {
      executable: directCandidate,
      workingDirectory: runtimeRoot
    };
  }

  const discoveredExecutable = findBackendExecutable(runtimeRoot);
  if (!discoveredExecutable) {
    return null;
  }

  return {
    executable: discoveredExecutable,
    workingDirectory: path.dirname(discoveredExecutable)
  };
}

function getIconPath() {
  return getResourcePath("assets", "yijia-app-icon.png");
}

function getRuntimeConfigPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function normalizeBaseUrl(baseUrl) {
  if (!baseUrl) {
    return "";
  }

  return baseUrl.trim().replace(/\/+$/, "");
}

function loadRuntimeConfig() {
  const configPath = getRuntimeConfigPath();

  try {
    if (!fs.existsSync(configPath)) {
      return {};
    }

    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch {
    return {};
  }
}

function getConfiguredServerBaseUrl() {
  const runtimeConfig = loadRuntimeConfig();
  const candidate = runtimeConfig.serverBaseUrl || process.env.YIJIA_SERVER_BASE_URL || "";
  return normalizeBaseUrl(candidate);
}

function getSigninUrl(baseUrl) {
  return `${normalizeBaseUrl(baseUrl)}/signin`;
}

function getBackendEnvironment() {
  const userDataDir = app.getPath("userData");
  const databaseDir = path.join(userDataDir, "data");
  fs.mkdirSync(databaseDir, { recursive: true });

  const databasePath = path.join(databaseDir, "chatappdb").replace(/\\/g, "/");

  return {
    ...process.env,
    YIJIA_DB_URL: process.env.YIJIA_DB_URL || `jdbc:h2:file:${databasePath};AUTO_SERVER=TRUE`
  };
}

function ensureDefaultRuntimeConfig() {
  const configPath = getRuntimeConfigPath();

  if (fs.existsSync(configPath)) {
    return;
  }

  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(
    configPath,
    JSON.stringify(
      {
        serverBaseUrl: "",
        notes: "Leave serverBaseUrl empty to use the embedded local backend. Set it to your deployed server URL to use a remote server."
      },
      null,
      2
    ),
    "utf8"
  );
}

function waitForPort(host, port, timeoutMs) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = new net.Socket();

      socket.setTimeout(1500);

      socket.once("connect", () => {
        socket.destroy();
        resolve();
      });

      socket.once("timeout", () => {
        socket.destroy();
        scheduleRetry();
      });

      socket.once("error", () => {
        socket.destroy();
        scheduleRetry();
      });

      socket.connect(port, host);
    };

    const scheduleRetry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error("The embedded backend did not become ready in time."));
        return;
      }

      setTimeout(tryConnect, 500);
    };

    tryConnect();
  });
}

function startBackend() {
  const backendInfo = getBackendExecutableInfo();

  if (!backendInfo) {
    throw new Error(`Missing backend executable under: ${getRuntimeRoot()}`);
  }

  backendProcess = spawn(backendInfo.executable, [], {
    cwd: backendInfo.workingDirectory,
    env: getBackendEnvironment(),
    shell: true,
    windowsHide: true,
    detached: false,
    stdio: "ignore"
  });

  backendProcess.once("exit", (code) => {
    if (mainWindow && !mainWindow.isDestroyed() && code !== 0) {
      dialog.showErrorBox("翼家校园通信系统启动失败", `内置服务异常退出，退出码：${code}`);
      app.quit();
    }
  });
}

function createWindow(targetUrl) {
  const icon = nativeImage.createFromPath(getIconPath());

  mainWindow = new BrowserWindow({
    width: 1420,
    height: 920,
    minWidth: 1180,
    minHeight: 760,
    show: false,
    title: APP_DISPLAY_NAME,
    backgroundColor: "#f2fbff",
    autoHideMenuBar: true,
    icon,
    webPreferences: {
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  mainWindow.loadURL(targetUrl);
}

async function bootstrap() {
  const configuredServerBaseUrl = getConfiguredServerBaseUrl();

  if (configuredServerBaseUrl) {
    createWindow(getSigninUrl(configuredServerBaseUrl));
    return;
  }

  startBackend();
  await waitForPort(HOST, PORT, START_TIMEOUT_MS);
  createWindow(getSigninUrl(DEFAULT_LOCAL_BASE_URL));
}

app.whenReady().then(async () => {
  app.setName(APP_FOLDER_NAME);
  app.setAppUserModelId(APP_ID);
  ensureDefaultRuntimeConfig();

  try {
    await bootstrap();
  } catch (error) {
    dialog.showErrorBox("翼家校园通信系统启动失败", error instanceof Error ? error.message : String(error));
    app.quit();
  }
});

app.on("second-instance", () => {
  if (!mainWindow) {
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.focus();
});

app.on("window-all-closed", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
