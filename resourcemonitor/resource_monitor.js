// Helper functions
let formatDate = (date) => {
    return new Date(date).toString();
}

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

let createBandwidthData = (data, server_name) => {
    try {
        let bandwidthElement = document.querySelector(`.${server_name} ul.bandwith-data`);

        let bandwidthData = data.bandwidth.data;

        bandwidthData = bandwidthData[0];

        let arr = [
            `iface: ${bandwidthData.iface}`,
            `ms: ${bandwidthData.ms}`,
            `network_test_1: start: ${formatDate(bandwidthData.network_test[0].start)},
                    end: ${formatDate(bandwidthData.network_test[0].end)},
                    total: ${bandwidthData.network_test[0].total},
                    url: ${bandwidthData.network_test[0].url}`,
            `network_test_2: start: ${formatDate(bandwidthData.network_test[1].start)},
                    end: ${formatDate(bandwidthData.network_test[1].end)},
                    total: ${bandwidthData.network_test[1].total},
                    url: ${bandwidthData.network_test[1].url}`,
            `operstate: ${bandwidthData.operstate}`,
            `rx_bytes: ${bandwidthData.rx_bytes}`,
            `rx_errors: ${bandwidthData.rx_errors}`,
            `rx_dropped: ${bandwidthData.rx_dropped}`,
            `rx_sec: ${bandwidthData.rx_sec}`,
            `tx_bytes: ${bandwidthData.tx_bytes}`,
            `tx_dropped: ${bandwidthData.tx_dropped}`,
            `tx_sec: ${bandwidthData.tx_sec}`,
            `status: ${data.bandwidth.status}`,
            `time_stamp: ${formatDate(data.bandwidth.time_stamp)}`,
        ];

        arr.forEach((d) => {
            let li = document.createElement("li");

            li.innerHTML += d;

            bandwidthElement.appendChild(li);
        });

    } catch (err) {
        console.error(err)
    }

};

let createCPUData = (data, server_name) => {
    try {
        let cpuElement = document.querySelector(`.${server_name} ul.cpu-data`);

        let cpuData = data.cpu.data;

        let arr = [
            `brand: ${cpuData.brand}`,
            `cache: ${JSON.stringify(cpuData.cache)}`,
            `cores: ${cpuData.cores}`,
            `family: ${cpuData.family}`,
            `governor: ${cpuData.governor}`,
            `manufacturer: ${cpuData.manufacturer}`,
            `model: ${cpuData.model}`,
            `physicalCores: ${cpuData.physicalCores}`,
            `processors: ${cpuData.processors}`,
            `revision: ${cpuData.revision}`,
            `socket: ${cpuData.socket}`,
            `speed: ${cpuData.speed}`,
            `speedmax: ${cpuData.speedmax}`,
            `speedmin: ${cpuData.speedmin}`,
            `stepping: ${cpuData.stepping}`,
            `vendor: ${cpuData.vendor}`,
            `voltage: ${cpuData.voltage}`,
            `status: ${data.cpu.status}`,
            `time_stamp: ${formatDate(data.cpu.time_stamp)}`,
        ];

        arr.forEach((d) => {
            let li = document.createElement("li");

            li.innerHTML += d;

            cpuElement.appendChild(li);
        });

    } catch (err) {
        console.error(err)
    }

};

let createDiskData = (data, server_name) => {
    try {
        let diskElement = document.querySelector(`.${server_name} ul.disk-data`);

        let diskData = data.disk.data;

        diskData.forEach((d) => {
            let arr = [
                `available: ${d.available}`,
                `fs: ${d.fs}`,
                `mount: ${d.mount}`,
                `size: ${d.size}`,
                `type: ${d.type}`,
                `use: ${d.use}`,
                `used: ${d.used}`,
                `status: ${data.disk.status}`,
                `time_stamp: ${formatDate(data.disk.time_stamp)}`,
            ]

            arr.forEach((d) => {
                let li = document.createElement("li");

                li.innerHTML += d;

                diskElement.appendChild(li);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

let createMemoryData = (data, server_name) => {
    try {
        let memoryElement = document.querySelector(`.${server_name} ul.memory-data`);

        let memoryData = data.memory.data;

        let arr = [
            `active: ${memoryData.active}`,
            `available: ${memoryData.available}`,
            `buffcache: ${memoryData.buffcache}`,
            `buffers: ${memoryData.buffers}`,
            `free: ${memoryData.free}`,
            `slab: ${memoryData.slab}`,
            `swapfree: ${memoryData.swapfree}`,
            `swaptotal: ${memoryData.swaptotal}`,
            `swapused: ${memoryData.swapused}`,
            `total: ${memoryData.total}`,
            `used: ${memoryData.used}`,
            `status: ${data.memory.status}`,
            `time_stamp: ${formatDate(data.memory.time_stamp)}`,
        ]

        arr.forEach((d) => {
            let li = document.createElement("li");

            li.innerHTML += d;

            memoryElement.appendChild(li);
        })


    } catch (err) {
        console.error(err);
    }
};

let createCPUProcessData = (data, server_name) => {
    try {
        let processElement = document.querySelector(`.${server_name} ul.process-data`);

        let processData = data.process.data.list;

        processData.forEach(d => {
            let arr = [
                ` `,
                `command: ${d.command}`,
                `mem_rss: ${d.mem_rss}`,
                `mem_vsz: ${d.mem_vsz}`,
                `name: ${d.name}`,
                `nice: ${d.nice}`,
                `params: ${d.params}`,
                `parentPid: ${d.parentPid}`,
                `path: ${d.path}`,
                `pcpu: ${d.pcpu}`,
                `pcpus: ${d.pcpus}`,
                `pcpuu: ${d.pcpuu}`,
                `pid: ${d.pid}`,
                `pmem: ${d.pmem}`,
                `priority: ${d.priority}`,
                `started: ${d.started}`,
                `tty: ${d.tty}`,
                `user: ${d.user}`,
            ];

            arr.forEach((d) => {
                let li = document.createElement("li");
    
                li.innerHTML += d;
    
                processElement.appendChild(li);
            })
        })

    } catch (err) {
        console.error(err);
    }
};

let createUsersData = (data, server_name) => {
    try {
        let usersElement = document.querySelector(`.${server_name} ul.memory-data`);

        let usersData = data.users.data;

        usersData.forEach(d => {
            let arr = [
                `user: ${user}`,
                `tty: ${tty}`,
                `date: ${date}`,
                `time: ${time}`,
                `ip: ${ip}`,
                `command: ${command}`,
            ];

            arr.forEach(d => {
                let li = document.createElement("li");
    
                li.innerHTML += d;
    
                usersElement.appendChild(li);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

let createServerStatsList = (data, server_name) => {
    try {
        createBandwidthData(data, server_name);

        createCPUData(data, server_name);

        createDiskData(data, server_name);

        createMemoryData(data, server_name);

        createCPUProcessData(data, server_name);

        createUsersData(data, server_name);

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