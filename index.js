var { exec } = require("child_process");
var _fs = require("fs");
var _path = require("path");
var _process = require("process");
var http = require("http");
var si = require("systeminformation");
var WebSocket = require('ws');
var moment = require("moment");

var config = {
	cache: [],
	port: 5000,
	network_test_URLs: [
		"http://google.com",
		"http://duckduckgo.com"
	],
	logs_path: "./logs",
	max_logs_size_in_bytes: 10000000,
};

var wss = new WebSocket.Server({ port: config.port });

// Server
var get_graphics_graph_data = () => {
	try {
		var graph_data = {
			data: [],
			labels: ["free", "used", "active"],
			swap_data: [],
			swap_labels: ["swaptotal", "swapused", "swapfree"]
		};
		var content;
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
		var result;

		logs.slice(-1).forEach(file_name => {
			content = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData});

			content = JSON.parse(content);

			graph_data.data.push(content.graphics.data.free);

			graph_data.data.push(content.graphics.data.used);

			graph_data.data.push(content.graphics.data.active);

			graph_data.swap_data.push(content.graphics.data.swaptotal);

			graph_data.swap_data.push(content.graphics.data.swapused);

			graph_data.swap_data.push(content.graphics.data.swapfree);

		});

		result = { graphics_graph: graph_data }

		result = JSON.stringify(result);

		return result;
		
	} catch (err) {
		console.error(err);
	}
};

var get_network_graph_data = () => {
	try {
		var graph_data = { labels: [] ,test_1: [] ,test_2: [] };
		var content;
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
		var result;

		logs.slice(-10).forEach(file_name => {
			content = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData});

			content = JSON.parse(content);
			
			graph_data.labels.push(moment(content.bandwidth.time_stamp).format("hh:mm:ss a"));

			graph_data.test_1.push(content.bandwidth.data[0].network_test[0].total);

			graph_data.test_2.push(content.bandwidth.data[0].network_test[1].total);

		});

		result = { network_graph: graph_data }

		result = JSON.stringify(result);

		return result;
		
	} catch (err) {
		console.error(err);
	}
};

var get_memory_graph_data = () => {
	try {
		var graph_data = {
			data: [],
			labels: ["free", "used", "active"],
			swap_data: [],
			swap_labels: ["swaptotal", "swapused", "swapfree"]
		};
		var content;
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
		var result;

		logs.slice(-1).forEach(file_name => {
			content = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData});

			content = JSON.parse(content);

			graph_data.data.push(content.memory.data.free);

			graph_data.data.push(content.memory.data.used);

			graph_data.data.push(content.memory.data.active);

			graph_data.swap_data.push(content.memory.data.swaptotal);

			graph_data.swap_data.push(content.memory.data.swapused);

			graph_data.swap_data.push(content.memory.data.swapfree);

		});

		result = { memory_graph: graph_data }

		result = JSON.stringify(result);

		return result;
		
	} catch (err) {
		console.error(err);
	}
};

var get_process_graph_data = () => {
	try {
		var graph_data = {
			labels: [],
			all: {data: []},
			running: {data: []},
			sleeping: { data: []},
		};
		var content;
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
		var result;

		logs.slice(-10).forEach(file_name => {
			content = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData});

			content = JSON.parse(content);
			
			graph_data.labels.push(moment(content.bandwidth.time_stamp).format("hh:mm:ss a"));

			graph_data.all.data.push(content.process.data.all);

			graph_data.running.data.push(content.process.data.running);

			graph_data.sleeping.data.push(content.process.data.sleeping);

		});

		result = { process_graph: graph_data }

		result = JSON.stringify(result);

		return result;
		
	} catch (err) {
		console.error(err);
	}
};

var get_log_data = (file_name, message) => {
	try {
		var cached_data = config.cache.filter(cd => {
			if (cd.log_file_id === file_name) { return cd.content }
		});
		var log;
		var result;

		if (cached_data.length) {
			log = cached_data[0].content;
		} else {
			log = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData });

			config.cache.push({ log_file_id: file_name, content: log });
		}

		switch (message) {
			case 'get_log':
				result = { log };

				break;
			case 'get_timeline':
				result = { timeline: log };

				break;

			default:
				break;
		}

		result = JSON.stringify(result);

		return result;

	} catch (err) {
		console.error(err);
	}
};

var get_logs = () => {
	try {
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		var result = { logs };

		result = JSON.stringify(result);

		return result;

	} catch (err) {
		console.error(err);
	}
};

var get_server_statistics = () => {
	try {
		var files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		var logfile = files.pop();

		var content = _fs.readFileSync(config.logs_path + `/${logfile}`, "utf-8", (err, fileData) => { return fileData });

		var statistics = { server_statistics: content };

		statistics = JSON.stringify(statistics);

		return statistics;

	} catch (err) {
		console.error(err);
	}
};

// Events
wss.on("connection", (socket) => {
	socket.on("message", (request) => {
		try {
			request = JSON.parse(request);

			// Sever data
			if (request.message === "get_stats") {
				var statistics = get_server_statistics();

				socket.send(statistics);
			}
			
			if (request.message === "get_logs") {
				var logs = get_logs();

				socket.send(logs);
			}

			if (request.message === "get_log" && request.fileName) {
				var log = get_log_data(request.fileName, request.message);

				socket.send(log);
			}

			if (request.message === "get_timeline" && request.fileName) {
				var timeLinedata = get_log_data(request.fileName, request.message);

				socket.send(timeLinedata);
			}

			// Graphs
			if (request.message === "get_graphics_graph") {
				var graph_data = get_graphics_graph_data();

				socket.send(graph_data);
			}

			if (request.message === "get_network_graph") {
				var graph_data = get_network_graph_data();

				socket.send(graph_data);
			}

			if (request.message === "get_process_graph") {
				var graph_data = get_process_graph_data();

				socket.send(graph_data);
			}

			if (request.message === "get_memory_graph") {
				var graph_data = get_memory_graph_data();

				socket.send(graph_data);
			}

		} catch (err) {
			console.error(err);
		}
	});
});

// logging
// Executions
var exec_ip_rules = async () => {
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		exec("iptables -L", (err, stdout) => {
			if (!err) {
				console.log(stdout);

				status = true;
			} else {
				message = format_str(err.message);

				console.error(err.message);
			}

			end = new Date().toISOString();

			resolve();
		});
	});

	return status ?
		{ 
			start,
			end,
			status,
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status, 
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var exec_n_stat = async () => {
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		exec("netstat -an", (err, stdout) => {
			if (!err) {
				console.log(stdout);

				status = true;
			} else {
				message = format_str(err.message);

				console.error(err.message);
			}

			resolve();
		});
	})

	return status ? 
		{ 
			start,
			end,
			status, 
			time_stamp: new Date().toISOString() 
		} : 
		{ 
			start,
			end,
			status, 
			message, 
			time_stamp: new Date().toISOString() 
		};
};

// File Data
var bandwidth = async () => {
	var bandwith_data;
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.networkStats()
			.then((data) => {
				data.map((d) => {
					d.operstate = d.operstate === "up" ? "up" : "down";
					return d;
				});

				bandwith_data = data;

				if (bandwith_data && bandwith_data[0].operstate === "up") {
					var netCheckData = config.network_test_URLs.map((url) => {
						var options = {
							timeout: 3000
						};
						var timeoutFlag = false;
						var data = {};

						data.start = new Date();

						new Promise((resolve) => {
							var req = http.get(url, () => {
								resolve();
							});

							req.setTimeout(options.timeout, () => {
								timeoutFlag = true;

								resolve();
							})

						}).then(() => {
							data.end = new Date();

							data.total = timeoutFlag ? 'request timeout' : (data.end - data.start);

							data.url = url;

							// Convert to UTC
							data.start = data.start.toISOString();

							data.end = data.end.toISOString();
						});

						return data;
					});

					bandwith_data[0] = Object.assign({}, bandwith_data[0], { "network_test": netCheckData });
				}

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});

	})

	return status ? 
		{ 
			data: bandwith_data,
			start,
			end,
			status,
			time_stamp: new Date().toISOString() 
		} : 
		{ 
			status,
			start,
			end,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var base_board = async () => {
	var baseboard_data;
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.baseboard()
			.then((data) => {
				baseboard_data = data;

				status = true

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: baseboard_data,
			start,
			end, 
			status,
			time_stamp: new Date().toISOString() 
		} : 
		{ 
			start,
			end,
			status,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var bios = async () => {
	var bios_data;
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.bios()
			.then((data) => {
				bios_data = data;

				status = true

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: bios_data,
			start,
			end, 
			status,
			time_stamp: new Date().toISOString() 
		} : 
		{ 
			start,
			end,
			status,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var cpu = async () => {
	var cpu_data;
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.cpu()
			.then((data) => {
				cpu_data = data;

				si.cpuTemperature().then((cpu_temperature_data) => {
					cpu_data = Object.assign({}, cpu_data, { "cput_temperature": cpu_temperature_data });

					si.cpuCurrentspeed().then((cpu_speed_data) => {
						cpu_data = Object.assign({}, cpu_data, { "cpu_speed_data": cpu_speed_data });

						status = true
		
						end = new Date().toISOString();

						resolve();
					});
				});

			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: cpu_data,
			start,
			end, 
			status,
			time_stamp: new Date().toISOString() 
		} : 
		{ 
			start,
			end,
			status,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var disk = async () => {
	var disk_data;
	var end;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.fsSize()
			.then((data) => {
				data.map((d) => {
					d.available = d.size - d.used;
					return d;
				});

				disk_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ?
		{ 
			data: disk_data, 
			start, 
			end, 
			status, 
			time_stamp: new Date().toISOString()
		}
		: 
		{ 
			start, 
			end,
			status,
			message,
			time_stamp: new Date().toISOString()
		};
};

var graphics = async () => {
	var end;
	var graphics_data;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.mem()
			.then((data) => {
				graphics_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: graphics_data,
			start,
			end,
			status, 
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status, 
			message, 
			time_stamp: new Date().toISOString()
		};
};

var memory = async () => {
	var end;
	var memory_data;
	var message;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.mem()
			.then((data) => {
				memory_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: memory_data,
			start,
			end,
			status, 
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status, 
			message, 
			time_stamp: new Date().toISOString()
		};
};

var machine_uptime = () => {
	return si.time().uptime * 1000;
};

var os = async () => {
	var end;
	var message;
	var os_data;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.osInfo()
			.then((data) => {
				os_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? 
		{ 
			data: os_data,
			start,
			end,
			status,
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var process = async () => {
	var end;
	var message;
	var processes_data;
	var start = new Date().toISOString();
	var status = false;

	await new Promise((resolve) => {
		si.processes()
			.then((data) => {
				processes_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				message = format_str(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? 
		{ 
			data: processes_data,
			start,
			end,
			status,
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status,
			message, 
			time_stamp: new Date().toISOString() 
		};
};

var script_run_time = () => {
	return Math.round(_process.uptime() * 1000);
};

var users = async () => {
	var end;
	var message;
	var start = new Date();
	var status = false;
	var user_data;

	await new Promise((resolve) => {
		si.users()
			.then((data) => {
				user_data = data;

				status = true;

				end = new Date().toISOString();

				resolve();
			})
			.catch((err) => {
				showServerErrorStatus
				message = format_str(err.message);

				console.error(err.message);

				end = new Date().toISOString();

				resolve();
			});
	});

	return status ? 
		{ 
			data: user_data,
			start,
			end,
			status, 
			time_stamp: new Date().toISOString()
		} : 
		{ 
			start,
			end,
			status, 
			message, 
			time_stamp: new Date().toISOString()
		};
};

// Get all data
var get_stats = async () => {
	try {
		return {
			bandwidth: await bandwidth(),
			baseboard: await base_board(),
			bios: await bios(),
			cpu: await cpu(),
			disk: await disk(),
			graphics: await graphics(),
			ip_tables: await exec_ip_rules(),
			memory: await memory(),
			net_statistics: await exec_n_stat(),
			os: await os(),
			process: await process(),
			script_uptime: script_run_time(),
			time_stamp: new Date().toISOString(),
			machine_uptime: machine_uptime(),
			users: await users(),
		};
		
	} catch (err) {
		console.error(err);
	}
};

var run = async () => {
	while (true) {
		try {
			var ms = 60000;

			var fileName = `log-${ new Date().toISOString().replace(/[:.]/g, "-") }.json`;

			var filePath = _path.join(__dirname, "/logs/", fileName);

			var stats = await get_stats();

			var exceedAllocatedMemory = Buffer.byteLength(JSON.stringify(config.cache)) > config.max_logs_size_in_bytes;

			if (exceedAllocatedMemory) {
				delete_log_files();
			}
			
			create_log_file(filePath, stats);
			
			await sleep(ms);

		} catch (err) {
			console.error(err);
		}
	}
};

// Helper Functions
var delete_log_files = () => {
	try {
		config.cache.forEach(file => {
			_fs.unlink(_path.join(__dirname, "/logs/", file.file_name), () => { });
		});

		config.cache = [];
		
	} catch (err) {
		console.error(err);
	}
};

var create_log_file = (filePath, data) => {
	try {
		var fileData = JSON.stringify(data, null, 4);

		_fs.writeFile(filePath, fileData, () => { });

	} catch (err) {
		console.error(err);
	}
}

var format_str = (str) => {
	return str.replace(/\\n/g, " ");
};

var sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

// Run script
// run();