"use strict";
nw.Window.open('http://localhost:5173');
let win = nw.Window.get()
win.showDevTools('',item => console.log(item))
//# sourceMappingURL=App.js.map