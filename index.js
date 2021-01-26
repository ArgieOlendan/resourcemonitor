var _fs = require("fs");
var _process = require("process");
var { exec } = require("child_process");
var http = require("http");
var _path = require("path");
var si = require("systeminformation");
var WebSocket = require('ws');

var config = {
	logs_cache: [],
	port: 5000,
	network_test_URLs: ["http://google.com",
		"http://duckduckgo.com"],
	logs_path: "./logs",
	max_logs_size: 10000000 //10mb
};

var wss = new WebSocket.Server({ port: config.port });

// Server
var getLogs = () => {
	try {
		var logs = [];

		var files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		if (files.length) {
			files.forEach((file) => {
				var value = config.logs_cache.filter((val) => {
					return val.file_name.includes(file);
				});

				if (value.length) {
					console.log(value.length);
					value.forEach(val => {
						logs.push(val);
					});
					
				} else {
					var fileName = { file_name: file }

					var content = _fs.readFileSync(config.logs_path + `/${file}`, "utf-8", (err, fileData) => { return fileData })

					var fileData = Object.assign({}, fileName, JSON.parse(content));

					config.logs_cache.push(fileData);

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
		if (config.logs_cache.length) {
			return JSON.stringify(config.logs_cache.pop());

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
	var status = false;
	var message;

	await new Promise((resolve) => {
		exec("iptables -L", (err, stdout) => {
			if (!err) {
				console.log(stdout);

				status = true
			} else {
				message = formatStr(err.message);
				console.error(err.message);
			}

			resolve();
		});
	})

	return status ? { status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
}

var execNstat = async () => {
	var status = false;
	var message;

	await new Promise((resolve) => {
		exec("netstat -an", (err, stdout) => {
			if (!err) {
				console.log(stdout);
				status = true
			} else {
				message = formatStr(err.message);
				console.error(err.message);
			}

			resolve();
		});
	})

	return status ? { status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
};

// File Data
var bandwidth = async () => {
	var status = false;
	var message;
	var bandwith_data;

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
						}
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

				status = true

				resolve();
			})
			.catch((err) => {
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});

	})

	return status ? { data: bandwith_data, status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() }
};

var cpus = async () => {
	var status = false
	var cpu_data;
	var message;

	await new Promise((resolve) => {
		si.cpu()
			.then((data) => {
				cpu_data = data;

				status = true

				resolve();
			})
			.catch((err) => {
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? { data: cpu_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
};

var disk = async () => {
	var status = false;
	var message;
	var disk_data;

	await new Promise((resolve) => {
		si.fsSize()
			.then((data) => {
				data.map((d) => {
					d.available = d.size - d.used;
					return d;
				});

				disk_data = data;

				status = true;

				resolve();
			})
			.catch((err) => {
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? { data: disk_data, status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
};

var memory = async () => {
	var status = false;
	var message;
	var memory_data;

	await new Promise((resolve) => {
		si.mem()
			.then((data) => {
				memory_data = data;

				status = true;

				resolve();
			})
			.catch((err) => {
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? { data: memory_data, status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
};

var machineUptime = () => {
	return si.time().uptime * 1000;
};

var process = async () => {
	var status = false;
	var message;
	var processes_data;

	await new Promise((resolve) => {
		si.processes()
			.then((data) => {
				processes_data = data;

				status = true;

				resolve();
			})
			.catch((err) => {
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});
	});

	return status ? { data: processes_data, status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
};

var scriptRunTime = () => {
	return Math.round(_process.uptime() * 1000);
};

var users = async () => {
	var status = false;
	var message;
	var user_data;

	await new Promise((resolve) => {
		si.users()
			.then((data) => {
				user_data = data;

				status = true;

				resolve();
			})
			.catch((err) => {
				showServerErrorStatus
				message = formatStr(err.message);

				console.error(err.message);

				resolve();
			});
	})

	return status ? { data: user_data, status, time_stamp: new Date().toISOString() } : { status, message, time_stamp: new Date().toISOString() };
};

// Get all data
var get = async () => {
	return {
		bandwidth: await bandwidth(),
		cpu: await cpus(),
		disk: await disk(),
		ip_tables: await execIpRules(),
		memory: await memory(),
		net_statistics: await execNstat(),
		process: await process(),
		script_uptime: scriptRunTime(),
		time_stamp: new Date(),
		machine_uptime: machineUptime(),
		users: await users(),
	};
};

var getStats = async () => {
	try {
		var stats = await get();

		return stats;

	} catch (err) {
		console.error(err);
	}
}

var run = async () => {
	while (true) {
		try {
			var ms = 5000;

			await sleep(ms);

			var now = new Date();

			var fileName = `log-${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}.json`;

			var filePath = _path.join(__dirname, "/logs/", fileName);

			var stats = await getStats();
			
			var exceedAllocatedMemory = Buffer.byteLength(JSON.stringify(config.logs_cache)) > config.max_logs_size;

			if (exceedAllocatedMemory) {
				deleteLogFiles();
			}

			createLogFile(filePath, stats);

		} catch (err) {
			console.error(err);
		}
	}
};

// Helper Functions
var deleteLogFiles = () => {
	try {
		// Delete the rest of existing log files
		config.logs_cache.forEach(file => {
			_fs.unlink(_path.join(__dirname, "/logs/", file.file_name), () => { });
		});
		
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
}
var sleep = (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};

// Run script
run();