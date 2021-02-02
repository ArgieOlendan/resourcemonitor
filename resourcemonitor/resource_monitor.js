var config = {
    server_manifest_url_local: "http://localhost/resourcemonitor/manifest.json",
    server_manifest_url_prod: "http://194.156.99.87/manifest.json",
}

// Helper functions
var formatDate = (date) => {
    return new moment(date).format("MM/DD/YYYY h:mm:ss a");
};

var formatFileSize = (bytes, decimalPoint) => {
    if (bytes == 0) return '0 Bytes';

    var k = 1000;
    var dm = decimalPoint || 2;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

var parseMillisecondToReadabvarime = (duration) => {
    var portions = [];

    var msInHour = 1000 * 60 * 60;
    var hours = Math.trunc(duration / msInHour);
    if (hours > 0) {
        portions.push(hours + 'h');
        duration = duration - (hours * msInHour);
    }

    var msInMinute = 1000 * 60;
    var minutes = Math.trunc(duration / msInMinute);
    if (minutes > 0) {
        portions.push(minutes + 'm');
        duration = duration - (minutes * msInMinute);
    }

    var seconds = Math.trunc(duration / 1000);
    if (seconds > 0) {
        portions.push(seconds + 's');
    }

    return portions.join(' ');
}

var precise = (val) => {
    return Math.round(val * 100) / 100 + "%";
};


// data
var createServerLogList = (data, server_name) => {
    try {
        var jsonData = data;

        document.querySelector(`.${server_name} .server-logs`).innerHTML = "";

        jsonData.forEach((item) => {
            var li = document.createElement("li");

            li.setAttribute("id", item.file_name.split(".")[0]);

            li.setAttribute("class", "file_name");

            li.innerHTML += item.file_name;

            document.querySelector(`.${server_name} .server-logs`).appendChild(li);
        });

        var liFields = document.querySelectorAll(`.${server_name} .file_name`);

        liFields.forEach((field) => {
            var fieldValue = JSON.stringify(jsonData.filter((item) => { return item.file_name == field.innerHTML }), null, 2);

            field.addEventListener("click", () => {
                document.querySelector(".log-data").innerHTML = fieldValue;
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var createBandwidthData = (data, server_name) => {
    try {
        var bandwidthElement = document.querySelector(`.${server_name} ul.bandwith-data`);

        var bandwidthData = data.bandwidth.data;

        bandwidthData = bandwidthData[0];

        bandwidthElement.innerHTML = "";

        var arr = [
            `iface: ${bandwidthData.iface}`,
            `ms: ${bandwidthData.ms}`,
            `network_test_1: start: ${formatDate(bandwidthData.network_test[0].start)},
                    end: ${formatDate(bandwidthData.network_test[0].end)},
                    total: ${(bandwidthData.network_test[0].total)},
                    url: ${bandwidthData.network_test[0].url}`,
            `network_test_2: start: ${formatDate(bandwidthData.network_test[1].start)},
                    end: ${formatDate(bandwidthData.network_test[1].end)},
                    total: ${bandwidthData.network_test[1].total},
                    url: ${bandwidthData.network_test[1].url}`,
            `operstate: ${bandwidthData.operstate}`,
            `rx_bytes: ${formatFileSize(bandwidthData.rx_bytes)}`,
            `rx_errors: ${bandwidthData.rx_errors}`,
            `rx_dropped: ${bandwidthData.rx_dropped}`,
            `rx_sec: ${bandwidthData.rx_sec}`,
            `tx_bytes: ${formatFileSize(bandwidthData.tx_bytes)}`,
            `tx_dropped: ${bandwidthData.tx_dropped}`,
            `tx_sec: ${bandwidthData.tx_sec}`,
            `start: ${formatDate(data.bandwidth.start)}`,
            `end: ${formatDate(data.bandwidth.end)}`,
            `status: ${data.bandwidth.status}`,
            `time_stamp: ${formatDate(data.bandwidth.time_stamp)}`,
        ];

        arr.forEach((d) => {
            var li = document.createElement("li");

            li.innerHTML += d;

            bandwidthElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }

};

var createCPUData = (data, server_name) => {
    try {
        var cpuElement = document.querySelector(`.${server_name} ul.cpu-data`);

        var cpuData = data.cpu.data;

        cpuElement.innerHTML = "";

        var arr = [
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
            var li = document.createElement("li");

            li.innerHTML += d;

            cpuElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }

};

var createDiskData = (data, server_name) => {
    try {
        var diskElement = document.querySelector(`.${server_name} .disk-data`);

        var diskData = data.disk.data;

        diskElement.innerHTML = "";

        diskData.forEach((d) => {
            var ul = document.createElement("ul");
            var arr = [
                `available: ${formatFileSize(d.available)}`,
                `fs: ${d.fs}`,
                `mount: ${d.mount}`,
                `size: ${formatFileSize(d.size)}`,
                `type: ${d.type}`,
                `use: ${formatFileSize(d.use)}`,
                `used: ${formatFileSize(d.used)}`,
                `status: ${data.disk.status}`,
                `time_stamp: ${formatDate(data.disk.time_stamp)}`,
            ]

            arr.forEach((d) => {
                var li = document.createElement("li");

                li.innerHTML += d;

                ul.appendChild(li);

                diskElement.appendChild(ul);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var createMemoryData = (data, server_name) => {
    try {
        var memoryElement = document.querySelector(`.${server_name} ul.memory-data`);

        var memoryData = data.memory.data;

        memoryElement.innerHTML = "";

        var arr = [
            `active: ${formatFileSize(memoryData.active)}`,
            `buffcache: ${formatFileSize(memoryData.buffcache)}`,
            `buffers: ${formatFileSize(memoryData.buffers)}`,
            `free: ${formatFileSize(memoryData.free)}`,
            `slab: ${formatFileSize(memoryData.slab)}`,
            `swapfree: ${formatFileSize(memoryData.swapfree)}`,
            `swaptotal: ${formatFileSize(memoryData.swaptotal)}`,
            `swapused: ${formatFileSize(memoryData.swapused)}`,
            `total: ${formatFileSize(memoryData.total)}`,
            `used: ${formatFileSize(memoryData.used)}`, 
            `status: ${data.memory.status}`,
            `time_stamp: ${formatDate(data.memory.time_stamp)}`,
        ];

        arr.forEach((d) => {
            var li = document.createElement("li");

            li.innerHTML += d;

            memoryElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var createCPUProcessData = (data, server_name) => {
    try {
        var processElement = document.querySelector(`.${server_name} .process-data`);

        var processData = data.process.data.list;

        processElement.innerHTML = "";
        
        processData.forEach(d => {
            var ulElement = document.createElement("ul");
            var arr = [
                `command: ${d.command}`,
                `mem_rss: ${d.mem_rss}`,
                `mem_vsz: ${d.mem_vsz}`,
                `name: ${d.name}`,
                `nice: ${d.nice}`,
                `params: ${d.params}`,
                `parentPid: ${d.parentPid}`,
                `path: ${d.path}`,
                `pcpu: ${precise(d.pcpu)}`,
                `pcpus: ${precise(d.pcpus)}`,
                `pcpuu: ${precise(d.pcpuu)}`,
                `pid: ${d.pid}`,
                `pmem: ${precise(d.pmem)}`,
                `priority: ${d.priority}`,
                `started: ${formatDate(d.started)}`,
                `tty: ${d.tty}`,
                `user: ${d.user}`,
            ];

            arr.forEach((d) => {
                var li = document.createElement("li");

                li.innerHTML += d;

                ulElement.appendChild(li);

                processElement.appendChild(ulElement);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var createUsersData = (data, server_name) => {
    try {
        var usersElement = document.querySelector(`.${server_name} .users-data`);
        
        var usersData = data.users.data;
        
        usersElement.innerHTML = "";
        
        if (usersData.length) {
            usersData.forEach(d => {
                var ul = document.createElement("ul");
                var arr = [
                    `user: ${d.user}`,
                    `tty: ${d.tty}`,
                    `time_stamp: ${d.date + " " + d.time}`,
                    `ip: ${d.ip}`,
                    `command: ${d.command}`,
                ];
                
                arr.forEach(d => {
                    var li = document.createElement("li");
                    
                    li.innerHTML += d;
                    
                    ul.appendChild(li);
                    
                    usersElement.appendChild(ul);
                });
            });
        } else {
            var span = document.createElement("span");
            
            span.innerText = "No users!"

            usersElement.appendChild(span);
        }

        
    } catch (err) {
        console.error(err);
    }
};

var createUptimeData = (data, server_name) => {
    try {
        var uptimeElement = document.querySelector(`.${server_name} ul.uptime-data`);

        uptimeElement.innerHTML = "";

        var arr = [
            `machine_uptime: ${parseMillisecondToReadabvarime(data.machine_uptime)}`,
            `script_uptime: ${parseMillisecondToReadabvarime(data.script_uptime)}`,
            `time_stamp: ${formatDate(data.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            uptimeElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var createGraphicsData = (data, server_name) => {
    try {
        var graphicsElement = document.querySelector(`.${server_name} ul.graphics-data`);
    
        graphicsElement.innerHTML = "";

        var graphicsData = data.graphics.data;

        var arr = [
            `active: ${formatFileSize(graphicsData.active)}`,
            `available: ${formatFileSize(graphicsData.available)}`,
            `buffcache: ${formatFileSize(graphicsData.buffcache)}`,
            `buffers: ${formatFileSize(graphicsData.buffers)}`,
            `cached: ${formatFileSize(graphicsData.cached)}`,
            `free: ${formatFileSize(graphicsData.free)}`,
            `slab: ${formatFileSize(graphicsData.slab)}`,
            `swapfree: ${formatFileSize(graphicsData.swapfree)}`,
            `swaptotal: ${formatFileSize(graphicsData.swaptotal)}`,
            `swapused: ${formatFileSize(graphicsData.swapused)}`,
            `total: ${formatFileSize(graphicsData.total)}`,
            `used: ${formatFileSize(graphicsData.used)}`,
            `end: ${formatDate(data.graphics.end)}`,
            `start: ${formatDate(data.graphics.start)}`,
            `status: ${data.graphics.status}`,
            `time_stamp: ${formatDate(data.graphics.time_stamp)}`,
        ]

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            graphicsElement.appendChild(li);
        })

    } catch (err) {
        console.error(err);
    }
};

var createBaseboardData = (data, server_name) => {
    try {
        var baseBoardElement = document.querySelector(`.${server_name} ul.baseboard-data`);
    
        baseBoardElement.innerHTML = "";

        var baseBoardData = data.baseboard.data;

        var arr = [
            `assetTag: ${baseBoardData.assetTag}`,
            `manufacturer: ${baseBoardData.manufacturer}`,
            `model: ${baseBoardData.model}`,
            `serial: ${baseBoardData.serial}`,
            `version: ${baseBoardData.version}`,
            `end: ${formatDate(data.baseboard.end)}`,
            `start: ${formatDate(data.baseboard.start)}`,
            `status: ${data.baseboard.status}`,
            `time_stamp: ${formatDate(data.baseboard.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            baseBoardElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var createOSData = (data, server_name) => {
    try {
        var osElement = document.querySelector(`.${server_name} ul.os-data`);
    
        osElement.innerHTML = "";

        var osData = data.os.data;

        var arr = [
            `arch: ${osData.arch}`,
            `build: ${osData.build}`,
            `codename: ${osData.codename}`,
            `codepage: ${osData.codepage}`,
            `distro: ${osData.distro}`,
            `fqdn: ${osData.fqdn}`,
            `hostname: ${osData.hostname}`,
            `logofile: ${osData.logofile}`,
            `platform: ${osData.platform}`,
            `release: ${osData.release}`,
            `serial: ${osData.serial}`,
            `servicepack: ${osData.servicepack}`,
            `end: ${formatDate(data.os.end)}`,
            `start: ${formatDate(data.os.start)}`,
            `status: ${data.os.status}`,
            `time_stamp: ${formatDate(data.os.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            osElement.appendChild(li);
        });

    } catch (err) {
       console.error(err);
    }
};

var createBiosData = (data, server_name) => {
    try {
        var biosElement = document.querySelector(`.${server_name} ul.bios-data`);
    
        biosElement.innerHTML = "";

        var biosData = data.bios.data;

        var arr = [
            `releaseDate: ${formatDate(biosData.releaseDate)}`,
            `revision: ${biosData.revision}`,
            `vendor: ${biosData.vendor}`,
            `version: ${biosData.version}`,
            `end: ${formatDate(data.bios.end)}`,
            `start: ${formatDate(data.bios.start)}`,
            `status: ${data.bios.status}`,
            `time_stamp: ${formatDate(data.bios.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            biosElement.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var createServerStatsList = (data, server_name) => {
    try {
        createBandwidthData(data, server_name);

        createCPUData(data, server_name);

        createDiskData(data, server_name);

        createMemoryData(data, server_name);

        createCPUProcessData(data, server_name);

        createUsersData(data, server_name);

        createUptimeData(data, server_name);

        createGraphicsData(data, server_name);

        createBaseboardData(data, server_name);

        createOSData(data, server_name);

        createBiosData(data, server_name);

    } catch (err) {
        console.error(err);
    }
}

var createServerTimeline = (data, server_name) => {
    try {
        var timeLineElement = document.querySelector("#timeline");
        var logs = data;

        timeLineElement.innerHTML = "";
        
        logs.forEach(log => {
            var option = document.createElement("option");

            option.innerText += log.file_name.split(".")[0];

            timeLineElement.add(option);
        });

        // Bind change event
        timeLineElement.addEventListener("change", () => {
            var jsonData = data.filter(d => { return d.file_name === timeLineElement.value + ".json" });

            console.log(jsonData[0]);

            createServerStatsList(jsonData[0], server_name);

        });

    } catch (err) {
        console.error(err);
    }
};

var setServerStatus = (server_name, status) => {
    var element = document.querySelector(`.${server_name} .server-status`);

    element.innerHTML = `<p style='color: ${status == "online" ? "green" : "red"};'>${status}</p>`;
};

var startServer = (server) => {
    try {
        var socketServer = new WebSocket(server.url);
        var log_timer = 0;
        var stats_timer = 0;
        var reconnect_timer = 0;

        var getLogs = () => {
            var timeout = 60000;

            if (socketServer.readyState == socketServer.OPEN) {
                socketServer.send('getLogs');
            }

            log_timer = setTimeout(getLogs, timeout);
        }

        var getServerStats = () => {
            var timeout = 30000;

            if (socketServer.readyState == socketServer.OPEN) {
                socketServer.send('getServerStats');
            }

            log_timer = setTimeout(getLogs, timeout);
        }

        var cancelGetLogs = () => {
            if (log_timer) {
                clearTimeout(log_timer);
            }
        }

        var cancelGetServerStats = () => {
            if (stats_timer) {
                clearTimeout(stats_timer);
            }
        }

        var reconnect = () => {
            var timeout = 60000;

            reconnect_timer = setTimeout(() => {
                startServer(server);
            }, timeout);
        }

        socketServer.onopen = () => {
            setServerStatus(server.server_name, "online");

            getLogs();

            getServerStats();

        }

        socketServer.onmessage = (event) => {
            var jsonData = JSON.parse(event.data);


            if (jsonData) {
                if (jsonData.length > 0 && jsonData[0].hasOwnProperty("file_name")) {
                    createServerLogList(jsonData, server.server_name);

                    createServerTimeline(jsonData, server.server_name);

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

var startWebsocketServers = async (serverManifest) => {
    try {
        Object.values(serverManifest.servers).forEach(async (server) => {
            await startServer(server);
        });

    } catch (err) {
        console.error(err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await fetch(config.server_manifest_url_prod)
        .then((res) => {
            if (res.status !== 200) {
                console.log(`Looks like there was a problem. Status Code: ${res.status}`);
                return;
            }

            res.json().then(async (data) => {
                await startWebsocketServers(data);
            });
        });
});