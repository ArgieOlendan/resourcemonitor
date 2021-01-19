# Resource Monitor

### Task:
- [x] run task every minute
- [x] Timestamp of when it has been logged
- [x] Number of CPU cores
- [x] CPU details, frequency
- [x] RAM Usage done
- [x] Total RAM amoun
- [x] SWAP amount
- [x] SWAP available
- [x] Current BANDWITH USAGE up/down
- [x] Uptime of the machine
- [x] Disks
- [x] Partitions, available space on each
- [x] Uptime of the program itself
- [x] List of iptables rules
- [x] Ports currently running
- [x] IPs connected to the machine currently and their activity
- [x] List of users
- [x] Does the PC have INTERNET?
- [x] create a separate json file everytime script runs
- [x] Error Handling (to do: create a json file for errors)
- [x] Render json data from server
- [x] Auto reconnect when having issue with client/server


## Installation
Use npm to install dependencies

```bash
npm i
```

## Usage
- Create folder named log on same directory

- run start script if using UNIX-like environment
```bash
npm start
```

- for windows you need to run it on separate terminal
```bash
npm logger
```
```bash
npm server
```

- put resourcemonitor folder on your apache server.
    - then go to: localhost/resourcemonitor/index.html