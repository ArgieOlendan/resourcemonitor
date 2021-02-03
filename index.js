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
var getLogs = () => {
	try {
		var logs = [];

		var files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		if (files.length) {
			files.forEach((file) => {
				var value = config.cache.filter((val) => {
					return val.file_name.includes(file);
				});

				if (value.length) {
					value.forEach(val => {
						logs.push(val);
					});
					
				} else {
					var fileName = { file_name: file }

					var content = _fs.readFileSync(config.logs_path + `/${file}`, "utf-8", (err, fileData) => { return fileData });

					var fileData = Object.assign({}, fileName, JSON.parse(content));

					config.cache.push(fileData);

					logs.push(fileData);
				}
			});
		}

		return logs;

	} catch (err) {
		console.error(err);
	}
}

var getServerStatistics = () => {
	try {
		if (config.cache.length) {
			return JSON.stringify(config.cache.pop());

		} else {
			var files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
	
			var logfile = files.pop();
	
			var content;
	
			if (logfile) {
				content = _fs.readFileSync(config.logs_path + `/${logfile}`, "utf-8", (err, fileData) => { return fileData });
			}
	
			return content;
		}

	} catch (err) {
		console.error(err);
	}
}

var getTimeline = () => {
	try {
		var cache = config.cache;
		let fileNames;

		if (cache.length) {
			fileNames = cache.map(d => {
				return d.file_name;
			});
		} else {
			fileNames = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });
		}

		return { timeline: fileNames };

	} catch (err) {
		console.error(err);
	}
}

// Events
wss.on("connection", (ws) => {
	ws.on("message", (message) => {
		try {
			if (message == "getLogs") {
				var logs = getLogs();

				ws.send(JSON.stringify(logs));
			}
			else if (message == "getServerStats") {
				var serverStats = getServerStatistics();

				ws.send(serverStats);
			} 
			else if (message == "getTimeline") {
				var timeline = getTimeline();

				ws.send(JSON.stringify(timeline));
				
			} else {
				ws.send("");
			}
		} catch (err) {
			console.error(err);
		}
	});
});

// logging
// Executions
var execIpRules = async () => {
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
				message = formatStr(err.message);

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
}

var execNstat = async () => {
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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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

var baseBoard = async () => {
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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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

var machineUptime = () => {
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
				message = formatStr(err.message);

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
				message = formatStr(err.message);

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

var scriptRunTime = () => {
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
				message = formatStr(err.message);

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
var getStats = async () => {
	try {
		return {
			bandwidth: await bandwidth(),
			baseboard: await baseBoard(),
			bios: await bios(),
			cpu: await cpu(),
			disk: await disk(),
			graphics: await graphics(),
			ip_tables: await execIpRules(),
			memory: await memory(),
			net_statistics: await execNstat(),
			os: await os(),
			process: await process(),
			script_uptime: scriptRunTime(),
			time_stamp: new Date().toISOString(),
			machine_uptime: machineUptime(),
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

			var stats = await getStats();

			var exceedAllocatedMemory = Buffer.byteLength(JSON.stringify(config.cache)) > config.max_logs_size_in_bytes;

			if (exceedAllocatedMemory) {
				deleteLogFiles();
			} 
			
			createLogFile(filePath, stats);
			
			await sleep(ms);

		} catch (err) {
			console.error(err);
		}
	}
};

// Helper Functions
var deleteLogFiles = () => {
	try {
		config.cache.forEach(file => {
			_fs.unlink(_path.join(__dirname, "/logs/", file.file_name), () => { });
		});

		config.cache = [];
		
	} catch (err) {
		console.error(err);
	}
};

var createLogFile = (filePath, data) => {
	try {
		var fileData = JSON.stringify(data, null, 4);

		_fs.writeFile(filePath, fileData, () => { });

	} catch (err) {
		console.error(err);
	}
}

var formatStr = (str) => {
	return str.replace(/\\n/g, " ");
};

var sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

// Run script
run();