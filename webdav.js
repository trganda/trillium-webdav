const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { dirname } = require('path');

globalConfig = {
    baseURL: 'https://dav.jianguoyun.com/dav/',
    auth: {
        username: "your_username",
        password: "your_password"
    },
    responseType: 'text'
}

const remotebakdir = "/trilium-data";
const localdata = api.getAppInfo()['dataDirectory'];

async function exists(context, filename) {
    client = axios.create(context)
    let ret;
    await client.request({
        method: 'PROPFIND',
        url: filename,
        headers: {
            'Accept': 'text/plain',
            'Depth': '0'
        }
    }).then(function (rsp) {
        if (rsp.status != 404) {
            ret = true;
        } else {
            ret = false;
        }
    }).catch(function (err) {
        rsp = err.response
        if (rsp.status < 400) {
            ret = true;
        } else {
            ret = false;
        }
    })

    return ret;
}

async function createDirectory(context, path, recursive) {
    client = axios.create(context)

    if (recursive == true)
        createDirectoryRecursively(context, path);
    else {
        await client.request({
            method: 'MKCOL',
            url: path,
            headers: {
                'Accept': 'text/plain'
            }
        }).then(function (rsp) {
            console.log(rsp.status);
        }).catch(function (err) {
            console.log(err.response.status);
        })
    }
}

function getAllDirectories(dir) {
    paths = []
    if (!dir || dir === '/') {
        return paths;
    }
    let currentPath = dir;
    do {
        paths.push(currentPath);
        currentPath = dirname(currentPath);
    } while (currentPath && currentPath !== '/');
    return paths.reverse();
}

async function createDirectoryRecursively(context, dir) {
    let paths = getAllDirectories(dir);
    for (let path of paths) {
        await createDirectory(context, path, false);
    }
    console.log(paths);
}

async function putFileContents(context, filePath, data, overwrite) {
    let client = axios.create(context);
    let header = {}

    if (!overwrite) {
        header['If-None-Match'] = '*';
    }
    
    client.put(filePath, data, {
        headers: header
    }).then(function (rsp) {
        console.log(rsp.status)
    }).catch(function (err) {
        console.log(err.response.status)
    })
}

function dirTrval(absolutedir, relativedir) {
    fs.readdir(absolutedir, function(err, files){
        if (err) {
            console.warn(err);
        } else {
            files.forEach(function(filename) {
                let filepath = path.join(absolutedir, filename);
                // console.log(currentPath);
                fs.stat(filepath, async function(err, stats) {
                    let puturi = path.join(remotebakdir, relativedir, filename).replaceAll('\\', '/');
                    if (err) {
                        console.warn(err);
                    } else {
                        if (stats.isFile()) {
                            // Uploading the file.
                            console.log(puturi);
                            let data = fs.readFileSync(filepath);
                            putFileContents(globalConfig, puturi, data, true);
                        } else if (stats.isDirectory()) {
                            // Create directory remotely
                            if (await exists(globalConfig, puturi) === false) {
                                createDirectory(globalConfig, puturi, false);
                            }
                            dirTrval(filepath, filename);
                        }
                    }
                })
            })
        }
    })
}

async function sync() {
    // If the directory was not exists, try to create it.
    ret = await exists(globalConfig, remotebakdir);
    if (ret === false) {
        createDirectory(globalConfig, remotebakdir, false);
    }

    dirTrval(localdata, '');
}

sync();
