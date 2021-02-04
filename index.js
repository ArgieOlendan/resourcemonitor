var { exec } = require("child_process");
var _fs = require("fs");
var _path = require("path");
var _process = require("process");
var http = require("http");
var si = require("systeminformation");
var WebSocket = require('ws');

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
var getLogData = (file_name, message) => {
	try {
		var log = _fs.readFileSync(config.logs_path + `/${file_name}`, "utf-8", (err, fileData) => { return fileData });

		var response;

		switch (message) {
			case 'getLog':
				response = { log };	

				break;
			case 'getTimeline':
				response = { timeline: log };

				break;

			default:
				break;
		}

		response = JSON.stringify(response);

		return response;

	} catch (err) {
		console.error(err);
	}
};

var getLogs = () => {
	try {
		var logs = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		var result = { logs };

		result = JSON.stringify(result);

		return result;

	} catch (err) {
		console.error(err);
	}
};

var getServerStatistics = () => {
	try {
		if (config.cache.length) {
			return JSON.stringify(config.cache.pop());

		} else {
			var files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
	
			var logfile = files.pop();
	
			var content;

			content = _fs.readFileSync(config.logs_path + `/${logfile}`, "utf-8", (err, fileData) => { return fileData });

			var statistics = { server_statistics: content };

			statistics = JSON.stringify(statistics);
	
			return statistics;
		}

	} catch (err) {
		console.error(err);
	}
};

// Events
wss.on("connection", (ws) => {
	ws.on("message", (request) => {
		try {
			request = JSON.parse(request);

			if (request.message === "getServerStats") {
				var statistics = getServerStatistics();

				ws.send(statistics);
			}
			
			if (request.message === "getLogs") {
				var logs = getLogs();

				ws.send(logs);
			}

			if (request.message === "getLog" && request.fileName) {
				var log = getLogData(request.fileName, request.message);

				ws.send(log);
			}

			if (request.message === "getTimeline" && request.fileName) {
				var timeLinedata = getLogData(request.fileName, request.message);

				ws.send(timeLinedata);
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

					status = true
	
					end = new Date().toISOString();
	
					resolve();
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
run();