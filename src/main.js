// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, Menu, globalShortcut } = require('electron')
const path = require('path')
const isDev = require('electron-is-dev')

function createWindow() {
    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // 禁用同源策略，允许跨域请求
            webSecurity: false,
        },
        icon: 'public/favicon.ico',
    })

    mainWindow.loadURL(
        isDev
            ? 'http://localhost:3000'
            : `file://${path.join(__dirname, '../build/index.html')}`
    )
    if (isDev) {
        // 只有开发环境才打开开发者工具
        mainWindow.webContents.openDevTools()
    }

    // 在开发环境和生产环境均可通过快捷键打开devTools
    // 此段代码最好在createMenu()之后，否则在macOS可能导致createMenu()失效。
    globalShortcut.register('CommandOrControl+Shift+i', function () {
        mainWindow.webContents.openDevTools()
    })

    createMenu()
}

// 设置菜单栏
function createMenu() {
    // darwin表示macOS，针对macOS的设置
    if (process.platform === 'darwin') {
        const template = [
            {
                label: 'App Demo',
                submenu: [
                    {
                        role: 'about',
                    },
                    {
                        role: 'quit',
                    },
                ],
            },
        ]
        let menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
    } else {
        // windows及linux系统
        Menu.setApplicationMenu(null)
    }
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
        // 打开的窗口，那么程序会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。
require('./ipcMain/readDir')
require('./ipcMain/version')
