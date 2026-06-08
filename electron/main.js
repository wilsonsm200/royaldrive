const { app, BrowserWindow } = require("electron")
const { spawn } = require("child_process")
const path = require("path")
const http = require("http")
const os = require("os")

let mainWindow, pocketbaseProcess, nextProcess

const RESOURCES = process.resourcesPath
const MAIN_IP = "192.168.100.3"

function getLocalIP() {
  const interfaces = os.networkInterfaces()
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) return iface.address
    }
  }
  return "127.0.0.1"
}

const IS_MAIN = getLocalIP() === MAIN_IP

function waitForPort(host, port, callback) {
  http.get("http://" + host + ":" + port, () => callback())
    .on("error", () => setTimeout(() => waitForPort(host, port, callback), 500))
}

function startPocketBase() {
  const pbPath = path.join(RESOURCES, "backend", "pocketbase.exe")
  const pbData = path.join(RESOURCES, "backend", "pb_data")
  pocketbaseProcess = spawn(pbPath, ["serve", "--http=0.0.0.0:8090", "--dir", pbData], {
    cwd: path.join(RESOURCES, "backend"),
    windowsHide: true,
    shell: false,
  })
  pocketbaseProcess.on("error", (err) => console.error("PocketBase error:", err))
}

function startNext() {
  nextProcess = spawn("npm", ["run", "start", "--", "--hostname", "0.0.0.0", "--port", "3000"], {
    cwd: path.join(RESOURCES, "frontend"),
    windowsHide: true,
    shell: true,
  })
  nextProcess.on("error", (err) => console.error("Next.js error:", err))
}

function createWindow(url) {
  mainWindow = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: "RoyalDrive Mobility",
    webPreferences: { nodeIntegration: false },
    autoHideMenuBar: true,
    show: false,
  })
  mainWindow.loadURL(url)
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
    mainWindow.focus()
  })
  mainWindow.on("closed", () => { mainWindow = null })
}

app.whenReady().then(() => {
  if (IS_MAIN) {
    startPocketBase()
    startNext()
    waitForPort("127.0.0.1", 3000, () => createWindow("http://127.0.0.1:3000"))
  } else {
    waitForPort(MAIN_IP, 3000, () => createWindow("http://" + MAIN_IP + ":3000"))
  }
})

app.on("window-all-closed", () => {
  if (pocketbaseProcess) pocketbaseProcess.kill()
  if (nextProcess) nextProcess.kill()
  app.quit()
})