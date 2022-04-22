const {app, BrowserWindow, Menu, ipcMain} = require('electron');
const path = require("path");
const fs = require("fs");

/* 全局变量 */
// 窗口实例
var mainWindow = null ;
// 窗口位置
var x=0;
var y=0;

app.on('ready',()=>{
    mainWindow = new BrowserWindow({ 
        width:800,
        height:600,
        autoHideMenuBar:true,
        frame:false,
        webPreferences:{ 
            // nodeIntegration: true,
            // contextIsolation: false,
            // enableRemoteModule:true
            nodeIntegration:false, //设置为true就可以在这个渲染进程中调用Node.jsPDF
            preload: __dirname+'/preload.js'
        }
    });

    mainWindow.loadFile('./html/home.html'); // 加载本地文件
    // mainWindow.loadURL('https://zhuiyi.ai/'); // 加载远程文件
    
    /* 
    窗口操作 
    最大化，最小化，关闭窗口
    */
    // 窗口最大化
    ipcMain.on('windowMax',function (event, arg) {
        if(mainWindow.isMaximized()){
            mainWindow.unmaximize();
        }
        else{
            mainWindow.maximize();
        }
    });
    // 窗口最小化
    ipcMain.on('windowMin',function (event, arg) {
        if(mainWindow.isMinimized()){
            mainWindow.unminimize();
        }
        else{
            mainWindow.minimize();
        }
    });
    // 关闭窗口
    ipcMain.on('windowClose',(e)=>{
        app.quit();// 在窗口要关闭的时候触发
        // e.preventDefault(); // 避免进程意外关闭导致进程销毁
    });
    // 拖动窗口
    ipcMain.on('windowDrag',function(event,arg){
        // 鼠标会发生丢失，但效果比纯js实现要好
        x = mainWindow.getPosition()[0];
        y = mainWindow.getPosition()[1];
        mainWindow.setPosition(x+arg[0], y+arg[1]);
    });

    /* 文件操作 */
    // 写入文件
    ipcMain.on('writeFile', function(event, arg) {
        // arg是从渲染进程返回来的数据
        fs.writeFile("C:\\Users\\Administrator\\Desktop\\text.md", arg, "utf8",(err)=>{
          if(err){
            console.log("write failed!");
          }else {
            console.log("write success!");
          }
        })
    });



    // mainWindow.webContents.openDevTools({ mode: 'bottom' }); // 控制台开关

    ipcMain.on('window-close', function () {
        app.quit()
    });

    // const ipcMain = require('electron').ipcMain;
    ipcMain.on('asynchronous-message', function(event, arg) {
        console.log(arg);  // prints "ping"
        event.sender.send('asynchronous-reply', 'pong');
    });

    ipcMain.on('synchronous-message', function(event, arg) {
        console.log(arg);  // prints "ping"
        event.returnValue = 'pong';
    });


    // 所有窗口关闭
    app.on('window-all-closed', () => {
        app.quit();
    })
 
    mainWindow.on('closed',()=>{ 
       // 当窗口已经关闭的时候触发
    });

    // 定义菜单模板
    // const template = [
    //     {
    //         label: '设置',
    //         submenu: [
    //             {
    //                 label: '新建窗口',
    //                 click() {
    //                     // 点击事件
    //                     new BrowserWindow({
    //                         width: 500,
    //                         height: 500
    //                     })
    //                 }
    //             }
    //         ]
    //     },
    //     {
    //         label: '关于'
    //     }
    // ]
    // // 设置菜单
    // const menu = Menu.buildFromTemplate(template)
    // Menu.setApplicationMenu(menu)
});