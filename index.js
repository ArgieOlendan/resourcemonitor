var _fs = require("fs");
var _process = require("process");
var { exec } = require("child_process");
var si = require("systeminformation");
var path = require("path");
var http = require("http");

var URLs = ["http://google.com", "http://duckduckgo.com"];

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

	return status ? { status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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

	return status ? { status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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
					let netCheckData = URLs.map((url) => {
						const options = {
							timeout: 3000
						}
						let timeoutFlag = false;
						let data = {};

						data.start = new Date();

						new Promise((resolve) =>{
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

	return status ? { data: bandwith_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() }
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

	return status ? { data: disk_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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

	return status ? { data: memory_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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

	return status ? { data: processes_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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
			.catch((err) => {showServerErrorStatus
				message = formatStr(err.message);

				console.error(err.message);

				resolve(); 
			});
	})

	return status ? { data: user_data, status, time_stamp: new Date() } : { status, message, time_stamp: new Date() };
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
			const ms = 5000;

			await sleep(ms);

			const now = new Date();
			var fileName = `log-${now.getFullYear()}-${now.getMonth() + 1}-${now.getDay()}-${now.getHours()}-${now.getMinutes()}.json`;
			var filePath = path.join(__dirname, "/logs/", fileName);

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