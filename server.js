var WebSocket = require('ws');
var _fs = require('fs');

var wss_1 = new WebSocket.Server({ port: 5000 });
var path = "./logs"

var getLogs = () => {
    try {
        let logs = [];

        let files = _fs.readdirSync(path, (err, fileNames) => { return fileNames });

        files.forEach((file) => {
            let fileName = { file_name: file }

            let content = _fs.readFileSync(path + `/${file}`, "utf-8", (err, fileData) => { return fileData })

            let fileData = Object.assign({}, fileName, JSON.parse(content));

            logs.push(fileData);
        });

        return logs;

    } catch (err) {
        console.error(err);
    }
}

var getServerStatistics = () => {
    try {
        let files = _fs.readdirSync(path, (err, fileNames) => { return fileNames });

        let logfile = files.pop();

        let content = _fs.readFileSync(path + `/${logfile}`, "utf-8", (err, fileData) => { return fileData });

        return content;

    } catch (err) {
        console.error(err);
    }
}

wss_1.on("connection", (ws) => {
    ws.on("message", (message) => {
        try {
            if (message == "getLogs") {
                let logs = getLogs();

                ws.send(JSON.stringify(logs));
            }
            else if (message == "getServerStats") {
                let serverStats = getServerStatistics();
                
                ws.send(serverStats);
            } else {
                ws.send("");
            }
        } catch (err) {
            console.error(err);
        }
    });
});