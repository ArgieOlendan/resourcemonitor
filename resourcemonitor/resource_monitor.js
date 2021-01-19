let createServerLogList = (data, server_name) => {
    try {
        let jsonData = data;

        document.querySelector(`.${server_name} .server-logs`).innerHTML = "";

        jsonData.forEach((item) => {
            let li = document.createElement("li");

            li.setAttribute("id", item.file_name.split(".")[0]);

            li.setAttribute("class", "file_name");

            li.innerHTML += item.file_name;

            document.querySelector(`.${server_name} .server-logs`).appendChild(li);
        });

        let liFields = document.querySelectorAll(`.${server_name} .file_name`);

        liFields.forEach((field) => {
            let fieldValue = JSON.stringify(jsonData.filter((item) => { return item.file_name == field.innerHTML }), null, 2);

            field.addEventListener("click", () => {
                document.querySelector(".log-data").innerHTML = fieldValue;
            })
        });

    } catch (err) {
        console.error(err);
    }
};

let createServerStatsList = (data, server_name) => {
    try {
        let bandwidthElement = document.querySelector(`.${server_name} ul.bandwith-data`);
    
        
        Object.values(data.bandwidth.data).forEach((item) => {
            let data = [
                `iface: ${item.iface}`,
                `ms: ${item.ms}`,
                `network_test_1: start: ${item.network_test[0].start},
                end: ${item.network_test[0].end},
                total: ${item.network_test[0].total},
                url: ${item.network_test[0].url}`,
                `network_test_2: start: ${item.network_test[1].start},
                end: ${item.network_test[1].end},
                total: ${item.network_test[1].total},
                url: ${item.network_test[1].url}`,
                `operstate: ${item.operstate}`,
                `rx_bytes: ${item.rx_bytes}`,
                `rx_errors: ${item.rx_errors}`,
                `rx_dropped: ${item.rx_dropped}`,
                `rx_sec: ${item.rx_sec}`,
                `tx_bytes: ${item.tx_bytes}`,
                `tx_dropped: ${item.tx_dropped}`,
                `tx_sec: ${item.tx_sec}`,
            ]

            data.forEach((d) => {
                let li = document.createElement("li");

                li.innerHTML += d;

                bandwidthElement.appendChild(li);
            })
        });
        
    } catch (err) {
        console.error(err);
    }
}

let setServerStatus = (server_name, status) => {
    let element = document.querySelector(`.${server_name} .server-status`);

    element.innerHTML = `<p style='color: ${status == "online" ? "green" : "red"};'>${status}</p>`;
};

let startServer = (server) => {
    try {
        let socketServer = new WebSocket(server.url);
        let log_timer = 0;
        let stats_timer = 0;
        let reconnect_timer = 0;

        let getLogs = () => {
            let timeout = 60000;

            if (socketServer.readyState == socketServer.OPEN) {
                socketServer.send('getLogs');
            }

            log_timer = setTimeout(getLogs, timeout);
        }

        let getServerStats = () => {
            let timeout = 30000;

            if (socketServer.readyState == socketServer.OPEN) {
                socketServer.send('getServerStats');
            }

            log_timer = setTimeout(getLogs, timeout);
        }

        let cancelGetLogs = () => {
            if (log_timer) {
                clearTimeout(log_timer);
            }
        }

        let cancelGetServerStats = () => {
            if (stats_timer) {
                clearTimeout(stats_timer);
            }
        }

        let reconnect = () => {
            let timeout = 60000;

            reconnect_timer = setTimeout(() => {
                startServer(server);
            }, timeout);
        }

        socketServer.onopen = () => {
            getLogs();

            getServerStats();

            setServerStatus(server.server_name, "online");
        }

        socketServer.onmessage = (event) => {
            let jsonData = JSON.parse(event.data);

            
            if (jsonData) {
                if (jsonData.length > 0 && jsonData[0].hasOwnProperty("file_name")) {
                    createServerLogList(jsonData, server.server_name);
                } else {
                    createServerStatsList(jsonData, server.server_name);
                }
            }
        }

        socketServer.onerror = (event) => {
            console.error("Error: ", event);

            setServerStatus(server.server_name, "offline");
        }

        socketServer.onclose = () => {
            cancelGetLogs();

            cancelGetServerStats();

            setServerStatus(server.server_name, "offline");

            reconnect();
        }

    } catch (err) {
        console.err(err);
    }
}

let startWebsocketServers = (serverManifest) => {
    try {
        Object.values(serverManifest.servers).forEach((server) => {
            startServer(server);
        });
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const url = "http://localhost/resourcemonitor/manifest.json";

    await fetch(url)
        .then((res) => {
            if (res.status !== 200) {
                console.log(`Looks like there was a problem. Status Code: ${res.status}`);
                return;
            }

            res.json().then((data) => {
                startWebsocketServers(data);
            });
        });
})