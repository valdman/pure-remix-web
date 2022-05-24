const { app, BrowserWindow } = require('electron')
const path = require('path')

const createWindow = () => {
	const win = new BrowserWindow({
	  width: 800,
	  height: 600,
	})
  
	win.loadURL('http://localhost:3000/d3')
  }
  app.whenReady().then(() => {
	createWindow()
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })