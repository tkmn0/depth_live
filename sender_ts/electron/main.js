process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = true;
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const rs2 = require('node-librealsense');
const pc = new rs2.PointCloud();
const pipeline = new rs2.Pipeline();

let mainWindow = null;
app.on('ready', () => {
  // mainWindowを作成（windowの大きさや、Kioskモードにするかどうかなどもここで定義できる）
  mainWindow = new BrowserWindow({ width: 680, height: 700 });
  // Electronに表示するhtmlを絶対パスで指定（相対パスだと動かない）
  mainWindow.loadURL('file://' + __dirname + '/index.html?type=' + process.argv[2]);

  // ChromiumのDevツールを開く
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  pipeline.start();

  console.log('pipeline start');

  setInterval(() => {
    if (mainWindow != null) {
      const frameSet = pipeline.waitForFrames();
      const depthFrame = frameSet.depthFrame.data; // Uint16Array 
      console.log(depthFrame);
    }
  }, 1000 / 30);
});