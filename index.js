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
	logs_path: "./logs"
};

var wss = new WebSocket.Server({ port: config.port });

// Server
var getLogs = () => {
	try {
		let logs = [];

		let files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		if (files.length) {
			files.forEach((file) => {
				let value = config.logs_cache.filter((val) => {
					return val.file_name.includes(file);
				});

				console.log(value)

				if (value.length) {
					value.forEach(val => {
						logs.push(val);
					});
					
				} else {
					let fileName = { file_name: file }

					let content = _fs.readFileSync(config.logs_path + `/${file}`, "utf-8", (err, fileData) => { return fileData })

					let fileData = Object.assign({}, fileName, JSON.parse(content));

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
		let files = _fs.readdirSync(config.logs_path, (err, fileNames) => { return fileNames });

		let logfile = files.pop();

		let content;

		if (logfile) {
			content = _fs.readFileSync(config.logs_path + `/${logfile}`, "utf-8", (err, fileData) => { return fileData });
		}

		return content;

	} catch (err) {
		console.error(err);
	}
}

wss.on("connection", (ws) => {
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


// logging
// Executions
var execIpRules = async () => {
	let status = false;
	let message;

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
	let status = false;
	let message;

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
	let status = false;
	let message;
	let bandwith_data;

	await new Promise((resolve) => {
		si.networkStats()
			.then((data) => {
				data.map((d) => {
					d.operstate = d.operstate === "up" ? "up" : "down";
					return d;
				});

				bandwith_data = data;

				if (bandwith_data && bandwith_data[0].operstate === "up") {
					let netCheckData = config.network_test_URLs.map((url) => {
						const options = {
							timeout: 3000
						}
						let timeoutFlag = false;
						let data = {};

						data.start = new Date();

						new Promise((resolve) => {
							let req = http.get(url, () => {
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
	let status = false
	let cpu_data;
	let message;

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
	let status = false;
	let message;
	let disk_data;

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
	let status = false;
	let message;
	let memory_data;

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
	let status = false;
	let message;
	let processes_data;

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
	let status = false;
	let message;
	let user_data;

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
		let stats = await get();

		return stats;

	} catch (err) {
		console.error(err);
	}
}

var run = async () => {
	while (true) {
		try {
			const ms = 60000;

			await sleep(ms);

			const now = new Date();
			var fileName = `log-${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}.json`;
			var filePath = _path.join(__dirname, "/logs/", fileName);

			var stats = await getStats();

			await createLogFile(filePath, stats);

		} catch (err) {
			console.error(err);
		}
	}
};

// Helper Functions
var createLogFile = async (filePath, data) => {
	try {
		let fileData = JSON.stringify(data, null, 4);

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