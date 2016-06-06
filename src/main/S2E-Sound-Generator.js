/**
 * Created by ky on 2016/05/28.
 */

module.exports = function (window) {

    const ipcMain = require('electron').ipcMain;

    var http = require('http');
    var server = http.createServer();
    var server_port = 5256;
    var server_ip = '127.0.0.1';

    var nodeDataHolder = [];

    function getNodeData(nodeID) {
        let nodeData = nodeDataHolder.find(function (element) {
            return element.nodeID === nodeID;
        });
        if (!nodeData) {
            nodeData = {nodeID: nodeID};
            nodeDataHolder.push(nodeData);
        }
        return nodeData;
    }

    ipcMain.on('getOscillatorType', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'Oscillator';
        nodeData.waveType = value;
    });

    ipcMain.on('getOscillatorFrequency', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'Oscillator';
        nodeData.frequency = value;
    });

    ipcMain.on('getOscillatorDetune', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'Oscillator';
        nodeData.detune = value;
    });

    ipcMain.on('getGain', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'Gain';
        nodeData.gain = value;
    });

    ipcMain.on('getDelayTime', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'Gain';
        nodeData.delayTime = value;
    });

    ipcMain.on('getBiquadFilterType', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'BiquadFilter';
        nodeData.filterType = value;
    });

    ipcMain.on('getBiquadFilterFrequency', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'BiquadFilter';
        nodeData.frequency = value;
    });

    ipcMain.on('getBiquadFilterQ', function (event, nodeID, value) {
        let nodeData = getNodeData(nodeID);
        nodeData.nodeType = 'BiquadFilter';
        nodeData.q = value;
    });

    server.on('request', function (req, res) {
        var content = '';
        var path = req.url.split('/');
        if (path[1] == 'crossdomain.xml') {
            content = '<cross-domain-policy>';
            content += '<allow-access-from domain="*" to-ports="' + server_port + '"/>';
            content += '</cross-domain-policy>';
        } else if (path[1] == 'reset_all') {
            window.webContents.send('removeAllNodes');
        } else if (path[1] == 'poll') {
            nodeDataHolder.forEach(function (nodeData) {
                if (nodeData.nodeType === 'Oscillator') {
                    content += 'getOscillatorType/' + nodeData.nodeID + ' ' + nodeData.waveType + '\n';
                    content += 'getOscillatorFrequency/' + nodeData.nodeID + ' ' + nodeData.frequency + '\n';
                    content += 'getOscillatorDetune/' + nodeData.nodeID + ' ' + nodeData.detune + '\n';
                } else if (nodeData.nodeType === 'Gain') {
                    content += 'getGain/' + nodeData.nodeID + ' ' + nodeData.gain + '\n';
                } else if (nodeData.nodeType === 'Delay') {
                    content += 'getDelayTime/' + nodeData.nodeID + ' ' + nodeData.delayTime + '\n';
                } else if (nodeData.nodeType === 'BiquadFilter') {
                    content += 'getBiquadFilterType/' + nodeData.nodeID + ' ' + nodeData.filterType + '\n';
                    content += 'getBiquadFilterFrequency/' + nodeData.nodeID + ' ' + nodeData.frequency + '\n';
                    content += 'getBiquadFilterQ/' + nodeData.nodeID + ' ' + nodeData.q + '\n';
                }
            })
        } else if (path[1] == 'createOscillator') {
            window.webContents.send('createOscillator', path[2], path[3], parseFloat(path[4]));
        } else if (path[1] == 'createGain') {
            window.webContents.send('createGain', path[2], parseFloat(path[3]));
        } else if (path[1] == 'createDelay') {
            window.webContents.send('createDelay', path[2], parseFloat(path[3]));
        } else if (path[1] == 'createBiquadFilter') {
            window.webContents.send('createBiquadFilter', path[2], path[3], parseFloat(path[4]), parseFloat(path[5]));
        } else if (path[1] == 'connectNode') {
            window.webContents.send('connectNode', path[2], path[3]);
        } else if (path[1] == 'disconnectNode') {
            window.webContents.send('disconnectNode', path[2], path[3]);
        } else if (path[1] == 'connectDestination') {
            window.webContents.send('connectDestination', path[2]);
        } else if (path[1] == 'disconnectDestination') {
            window.webContents.send('disconnectDestination', path[2]);
        } else if (path[1] == 'setOscillatorType') {
            window.webContents.send('setOscillatorType', path[2], path[3]);
        } else if (path[1] == 'setOscillatorFrequency') {
            window.webContents.send('setOscillatorFrequency', path[2], parseFloat(path[3]));
        } else if (path[1] == 'setOscillatorDetune') {
            window.webContents.send('setOscillatorDetune', path[2], parseFloat(path[3]));
        } else if (path[1] == 'setGainValue') {
            window.webContents.send('setGainValue', path[2], parseFloat(path[3]));
        } else if (path[1] == 'setTargetAtTime') {
            window.webContents.send('setTargetAtTime', path[2], parseFloat(path[3]), parseFloat(path[4]), parseFloat(path[5]));
        } else if (path[1] == 'setDelayTime') {
            window.webContents.send('setDelayTime', path[2], parseFloat(path[3]));
        } else if (path[1] == 'setBiquadFilterType') {
            window.webContents.send('setBiquadFilterType', path[2], path[3]);
        } else if (path[1] == 'setBiquadFilterFrequency') {
            window.webContents.send('setBiquadFilterFrequency', path[2], parseFloat(path[3]));
        } else if (path[1] == 'setBiquadFilterQ') {
            window.webContents.send('setBiquadFilterQ', path[2], parseFloat(path[3]));
        } else {
            // nothing to do
        }
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.write(content);
        res.end();
    });

    server.listen(server_port, server_ip);
};