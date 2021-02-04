var config = {
    server_manifest_url_local: "http://localhost/resourcemonitor/manifest.json",
    server_manifest_url_prod: "http://194.156.99.87/manifest.json",
}

// Helper functions
var format_date = (date) => {
    return new moment(date).format("MM/DD/YYYY h:mm:ss a");
};

var format_file_size = (bytes, decimalPoint) => {
    if (bytes == 0) return '0 Bytes';

    var k = 1000;
    var dm = decimalPoint || 2;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

var parse_millisecond_to_readable_time = (duration) => {
    var portions = [];

    var ms_in_hour = 1000 * 60 * 60;
    var hours = Math.trunc(duration / ms_in_hour);
    if (hours > 0) {
        portions.push(hours + 'h');
        duration = duration - (hours * ms_in_hour);
    }

    var ms_in_minute = 1000 * 60;
    var minutes = Math.trunc(duration / ms_in_minute);
    if (minutes > 0) {
        portions.push(minutes + 'm');
        duration = duration - (minutes * ms_in_minute);
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

var show_lock_screen = () => {
    $("#lockscreen").modal("show");
}

var hide_lock_screen = () => {
    setTimeout(() => {
        $("#lockscreen").modal("hide");
    }, 1000);
}

// data
var create_server_log_list = (data, server_name, socket_server) => {
    try {
        document.querySelector(`.${server_name} .server-logs`).innerHTML = "";

        data.logs.forEach((fileName) => {
            var li = document.createElement("li");

            li.setAttribute("id", fileName.split(".")[0]);

            li.setAttribute("class", "file_name");

            li.innerHTML += fileName;

            document.querySelector(`.${server_name} .server-logs`).appendChild(li);
        });

        var li_fields = document.querySelectorAll(`.${server_name} .file_name`);

        li_fields.forEach((field) => {
            field.removeEventListener("click", () => { });

            field.addEventListener("click", () => {
                var request = { message: "get log", fileName: field.innerHTML };

                show_lock_screen();

                socket_server.send(JSON.stringify(request));
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var create_bandwidth_data = (data, server_name) => {
    try {
        var bandwidth_element = document.querySelector(`.${server_name} ul.bandwith-data`);

        var bandwidht_data = data.bandwidth.data;

        bandwidht_data = bandwidht_data[0];

        bandwidth_element.innerHTML = "";

        var arr = [
            `iface: ${bandwidht_data.iface}`,
            `ms: ${bandwidht_data.ms}`,
            `network_test_1: start: ${format_date(bandwidht_data.network_test[0].start)},
                    end: ${format_date(bandwidht_data.network_test[0].end)},
                    total: ${(bandwidht_data.network_test[0].total)},
                    url: ${bandwidht_data.network_test[0].url}`,
            `network_test_2: start: ${format_date(bandwidht_data.network_test[1].start)},
                    end: ${format_date(bandwidht_data.network_test[1].end)},
                    total: ${bandwidht_data.network_test[1].total},
                    url: ${bandwidht_data.network_test[1].url}`,
            `operstate: ${bandwidht_data.operstate}`,
            `rx_bytes: ${format_file_size(bandwidht_data.rx_bytes)}`,
            `rx_errors: ${bandwidht_data.rx_errors}`,
            `rx_dropped: ${bandwidht_data.rx_dropped}`,
            `rx_sec: ${bandwidht_data.rx_sec}`,
            `tx_bytes: ${format_file_size(bandwidht_data.tx_bytes)}`,
            `tx_dropped: ${bandwidht_data.tx_dropped}`,
            `tx_sec: ${bandwidht_data.tx_sec}`,
            `start: ${format_date(data.bandwidth.start)}`,
            `end: ${format_date(data.bandwidth.end)}`,
            `status: ${data.bandwidth.status}`,
            `time_stamp: ${format_date(data.bandwidth.time_stamp)}`,
        ];

        arr.forEach((d) => {
            var li = document.createElement("li");

            li.innerHTML += d;

            bandwidth_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }

};

var create_cpu_data = (data, server_name) => {
    try {
        var cpu_element = document.querySelector(`.${server_name} ul.cpu-data`);

        var cpu_data = data.cpu.data;

        cpu_element.innerHTML = "";

        var arr = [
            `brand: ${cpu_data.brand}`,
            `cache: ${JSON.stringify(cpu_data.cache)}`,
            `cores: ${cpu_data.cores}`,
            `family: ${cpu_data.family}`,
            `governor: ${cpu_data.governor}`,
            `manufacturer: ${cpu_data.manufacturer}`,
            `model: ${cpu_data.model}`,
            `physicalCores: ${cpu_data.physicalCores}`,
            `processors: ${cpu_data.processors}`,
            `revision: ${cpu_data.revision}`,
            `socket: ${cpu_data.socket}`,
            `speed: ${cpu_data.speed}`,
            `speedmax: ${cpu_data.speedmax}`,
            `speedmin: ${cpu_data.speedmin}`,
            `stepping: ${cpu_data.stepping}`,
            `vendor: ${cpu_data.vendor}`,
            `voltage: ${cpu_data.voltage}`,
            `status: ${data.cpu.status}`,
            `time_stamp: ${format_date(data.cpu.time_stamp)}`,
        ];

        arr.forEach((d) => {
            var li = document.createElement("li");

            li.innerHTML += d;

            cpu_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }

};

var create_disk_data = (data, server_name) => {
    try {
        var disk_element = document.querySelector(`.${server_name} .disk-data`);

        var disk_data = data.disk.data;

        disk_element.innerHTML = "";

        disk_data.forEach((d) => {
            var ul = document.createElement("ul");
            var arr = [
                `available: ${format_file_size(d.available)}`,
                `fs: ${d.fs}`,
                `mount: ${d.mount}`,
                `size: ${format_file_size(d.size)}`,
                `type: ${d.type}`,
                `use: ${format_file_size(d.use)}`,
                `used: ${format_file_size(d.used)}`,
                `status: ${data.disk.status}`,
                `time_stamp: ${format_date(data.disk.time_stamp)}`,
            ]

            arr.forEach((d) => {
                var li = document.createElement("li");

                li.innerHTML += d;

                ul.appendChild(li);

                disk_element.appendChild(ul);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var create_memory_data = (data, server_name) => {
    try {
        var memory_element = document.querySelector(`.${server_name} ul.memory-data`);

        var memory_data = data.memory.data;

        memory_element.innerHTML = "";

        var arr = [
            `active: ${format_file_size(memory_data.active)}`,
            `buffcache: ${format_file_size(memory_data.buffcache)}`,
            `buffers: ${format_file_size(memory_data.buffers)}`,
            `free: ${format_file_size(memory_data.free)}`,
            `slab: ${format_file_size(memory_data.slab)}`,
            `swapfree: ${format_file_size(memory_data.swapfree)}`,
            `swaptotal: ${format_file_size(memory_data.swaptotal)}`,
            `swapused: ${format_file_size(memory_data.swapused)}`,
            `total: ${format_file_size(memory_data.total)}`,
            `used: ${format_file_size(memory_data.used)}`, 
            `status: ${data.memory.status}`,
            `time_stamp: ${format_date(data.memory.time_stamp)}`,
        ];

        arr.forEach((d) => {
            var li = document.createElement("li");

            li.innerHTML += d;

            memory_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var create_cpu_process_data = (data, server_name) => {
    try {
        var process_element = document.querySelector(`.${server_name} .process-data`);

        var process_data = data.process.data.list;

        process_element.innerHTML = "";
        
        process_data.forEach(d => {
            var ul_element = document.createElement("ul");
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
                `started: ${format_date(d.started)}`,
                `tty: ${d.tty}`,
                `user: ${d.user}`,
            ];

            arr.forEach((d) => {
                var li = document.createElement("li");

                li.innerHTML += d;

                ul_element.appendChild(li);

                process_element.appendChild(ul_element);
            });
        });

    } catch (err) {
        console.error(err);
    }
};

var create_users_data = (data, server_name) => {
    try {
        var users_element = document.querySelector(`.${server_name} .users-data`);
        
        var users_data = data.users.data;
        
        users_element.innerHTML = "";
        
        if (users_data.length) {
            users_data.forEach(d => {
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
                    
                    users_element.appendChild(ul);
                });
            });
        } else {
            var span = document.createElement("span");
            
            span.innerText = "No users!"

            users_element.appendChild(span);
        }

        
    } catch (err) {
        console.error(err);
    }
};

var create_machine_uptime_data = (data, server_name) => {
    try {
        var uptime_element = document.querySelector(`.${server_name} ul.uptime-data`);

        uptime_element.innerHTML = "";

        var arr = [
            `machine_uptime: ${parse_millisecond_to_readable_time(data.machine_uptime)}`,
            `script_uptime: ${parse_millisecond_to_readable_time(data.script_uptime)}`,
            `time_stamp: ${format_date(data.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            uptime_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var create_graphics_card_data = (data, server_name) => {
    try {
        var graphics_element = document.querySelector(`.${server_name} ul.graphics-data`);
    
        graphics_element.innerHTML = "";

        var graphics_data = data.graphics.data;

        var arr = [
            `active: ${format_file_size(graphics_data.active)}`,
            `available: ${format_file_size(graphics_data.available)}`,
            `buffcache: ${format_file_size(graphics_data.buffcache)}`,
            `buffers: ${format_file_size(graphics_data.buffers)}`,
            `cached: ${format_file_size(graphics_data.cached)}`,
            `free: ${format_file_size(graphics_data.free)}`,
            `slab: ${format_file_size(graphics_data.slab)}`,
            `swapfree: ${format_file_size(graphics_data.swapfree)}`,
            `swaptotal: ${format_file_size(graphics_data.swaptotal)}`,
            `swapused: ${format_file_size(graphics_data.swapused)}`,
            `total: ${format_file_size(graphics_data.total)}`,
            `used: ${format_file_size(graphics_data.used)}`,
            `end: ${format_date(data.graphics.end)}`,
            `start: ${format_date(data.graphics.start)}`,
            `status: ${data.graphics.status}`,
            `time_stamp: ${format_date(data.graphics.time_stamp)}`,
        ]

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            graphics_element.appendChild(li);
        })

    } catch (err) {
        console.error(err);
    }
};

var create_base_board_data = (data, server_name) => {
    try {
        var base_board_element = document.querySelector(`.${server_name} ul.baseboard-data`);
    
        base_board_element.innerHTML = "";

        var base_board_data = data.baseboard.data;

        var arr = [
            `assetTag: ${base_board_data.assetTag}`,
            `manufacturer: ${base_board_data.manufacturer}`,
            `model: ${base_board_data.model}`,
            `serial: ${base_board_data.serial}`,
            `version: ${base_board_data.version}`,
            `end: ${format_date(data.baseboard.end)}`,
            `start: ${format_date(data.baseboard.start)}`,
            `status: ${data.baseboard.status}`,
            `time_stamp: ${format_date(data.baseboard.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            base_board_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var create_os_data = (data, server_name) => {
    try {
        var os_element = document.querySelector(`.${server_name} ul.os-data`);
    
        os_element.innerHTML = "";

        var os_data = data.os.data;

        var arr = [
            `arch: ${os_data.arch}`,
            `build: ${os_data.build}`,
            `codename: ${os_data.codename}`,
            `codepage: ${os_data.codepage}`,
            `distro: ${os_data.distro}`,
            `fqdn: ${os_data.fqdn}`,
            `hostname: ${os_data.hostname}`,
            `logofile: ${os_data.logofile}`,
            `platform: ${os_data.platform}`,
            `release: ${os_data.release}`,
            `serial: ${os_data.serial}`,
            `servicepack: ${os_data.servicepack}`,
            `end: ${format_date(data.os.end)}`,
            `start: ${format_date(data.os.start)}`,
            `status: ${data.os.status}`,
            `time_stamp: ${format_date(data.os.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            os_element.appendChild(li);
        });

    } catch (err) {
       console.error(err);
    }
};

var create_bios_data = (data, server_name) => {
    try {
        var bios_element = document.querySelector(`.${server_name} ul.bios-data`);
    
        bios_element.innerHTML = "";

        var bios_data = data.bios.data;

        var arr = [
            `releaseDate: ${format_date(bios_data.releaseDate)}`,
            `revision: ${bios_data.revision}`,
            `vendor: ${bios_data.vendor}`,
            `version: ${bios_data.version}`,
            `end: ${format_date(data.bios.end)}`,
            `start: ${format_date(data.bios.start)}`,
            `status: ${data.bios.status}`,
            `time_stamp: ${format_date(data.bios.time_stamp)}`,
        ];

        arr.forEach(d => {
            var li = document.createElement("li");

            li.innerHTML += d;

            bios_element.appendChild(li);
        });

    } catch (err) {
        console.error(err);
    }
};

var create_server_stats_list = (data, server_name) => {
    try {
        data = JSON.parse(data);

        create_bandwidth_data(data, server_name);

        create_cpu_data(data, server_name);

        create_disk_data(data, server_name);

        create_memory_data(data, server_name);

        create_cpu_process_data(data, server_name);

        create_users_data(data, server_name);

        create_machine_uptime_data(data, server_name);

        create_graphics_card_data(data, server_name);

        create_base_board_data(data, server_name);

        create_os_data(data, server_name);

        create_bios_data(data, server_name);

    } catch (err) {
        console.error(err);
    }
}

var create_server_timeline = (data, socketServer) => {
    try {
        var timeline_element = document.querySelector("#timeline");

        timeline_element.innerHTML = "";
        
        data.logs.forEach(log => {
            var option = document.createElement("option");

            option.innerText += log;

            timeline_element.add(option);
        });

        $("#timeline").off("change");

        $("#timeline").bind("change", () => {
            var request = { message: "get timeline", fileName: timeline_element.value };

            show_lock_screen();

            socketServer.send(JSON.stringify(request));
        });

    } catch (err) {
        console.error(err);
    }
};

var set_server_status = (server_name, status) => {
    var element = document.querySelector(`.${server_name} .server-status`);

    element.innerHTML = `<p style='color: ${status == "online" ? "green" : "red"};'>${status}</p>`;
};

var set_log_data_value = (data) => {
    document.querySelector(".log-data").innerHTML = data;
}

var start_server = (server) => {
    try {
        var log_timer = 0;
        var reconnect_timer = 0;
        var socket_server = new WebSocket(server.url);
        var stats_timer = 0;

        var get_logs = () => {
            var timeout = 180000;

            if (socket_server.readyState == socket_server.OPEN) {
                var request = { message: "get logs" };

                show_lock_screen();
                
                socket_server.send(JSON.stringify(request));
            }

            log_timer = setTimeout(get_logs, timeout);
        }

        var get_server_stats = () => {
            var timeout = 60000;

            if (socket_server.readyState == socket_server.OPEN) {
                var request = { message: "get stats" };

                show_lock_screen();

                socket_server.send(JSON.stringify(request));
            }

            stats_timer = setTimeout(get_server_stats, timeout);
        }

        var reconnect = () => {
            var timeout = 30000;

            reconnect_timer = setTimeout(() => {
                start_server(server);
            }, timeout);
        }
        
        var cancel_get_logs = () => {
            if (log_timer) {
                clearTimeout(log_timer);
            }
        }

        var cancel_get_server_stats = () => {
            if (stats_timer) {
                clearTimeout(stats_timer);
            }
        }

        var cancel_reconnect = () => {
            if (reconnect_timer) {
                clearTimeout(reconnect_timer);
            }
        }

        socket_server.onopen = () => {
            cancel_reconnect();

            set_server_status(server.server_name, "online");
            
            get_server_stats();

            get_logs();
        }

        socket_server.onmessage = (event) => {
            var server_response = JSON.parse(event.data);

            if (server_response) {
                if (server_response.hasOwnProperty("logs")) {
                    create_server_log_list(server_response, server.server_name, socket_server);

                    create_server_timeline(server_response, socket_server);

                    hide_lock_screen();
                }

                if (server_response.hasOwnProperty("log")) {
                    set_log_data_value(server_response.log);

                    hide_lock_screen();
                }

                if (server_response.hasOwnProperty("timeline")) {
                    create_server_stats_list(server_response.timeline, server.server_name);

                    hide_lock_screen();
                }

                if (server_response.hasOwnProperty("server_statistics")) {
                    create_server_stats_list(server_response.server_statistics, server.server_name);

                    hide_lock_screen();
                }

            }
        }

        socket_server.onerror = (event) => {
            console.error("Error: ", event);

            set_server_status(server.server_name, "offline");
        }

        socket_server.onclose = () => {
            set_server_status(server.server_name, "offline");

            cancel_get_server_stats();

            cancel_get_logs();

            reconnect();
        }

    } catch (err) {
        console.err(err);
    }
}

var start_websocket_servers = async (serverManifest) => {
    try {
        Object.values(serverManifest.servers).forEach(async (server) => {
            start_server(server);
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

            res.json().then((data) => {
                start_websocket_servers(data);
            });

        });
});