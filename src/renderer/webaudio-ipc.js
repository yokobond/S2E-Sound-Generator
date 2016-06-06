/**
 * Created by ky on 2016/05/30.
 */
module.exports = function (audioManager) {

    const ipcRenderer = require('electron').ipcRenderer;

    ipcRenderer.on('removeAllNodes', function (event) {
        try {
            audioManager.removeAllNodes();
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('createOscillator', function (event, nodeID, waveType, frequency) {
        try {
            audioManager.createOscillator(nodeID, waveType, frequency);
            ipcRenderer.send('getOscillatorType', nodeID , waveType);
            ipcRenderer.send('getOscillatorFrequency', nodeID , frequency);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('createGain', function (event, nodeID, gain) {
        try {
            audioManager.createGain(nodeID, gain);
            ipcRenderer.send('getGain', nodeID , gain);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('createDelay', function (event, nodeID, delayTime) {
        try {
            audioManager.createDelay(nodeID, delayTime);
            ipcRenderer.send('getDelayTime', nodeID , delayTime);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('createBiquadFilter', function (event, nodeID, filterType, frequency, q) {
        try {
            audioManager.createBiquadFilter(nodeID, filterType, frequency, q);
            ipcRenderer.send('getBiquadFilterType', nodeID , filterType);
            ipcRenderer.send('getBiquadFilterFrequency', nodeID , frequency);
            ipcRenderer.send('getBiquadFilterQ', nodeID , q);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('connectDestination', function (event, fromNodeID) {
        try {
            audioManager.connectDestination(fromNodeID);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('disconnectDestination', function (event, fromNodeID) {
        try {
            audioManager.disconnectDestination(fromNodeID);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('connectNode', function (event, fromNodeID, toNodeID) {
        try {
            audioManager.connectNode(fromNodeID, toNodeID);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('disconnectNode', function (event, fromNodeID, toNodeID) {
        try {
            audioManager.disconnectNode(fromNodeID, toNodeID);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setOscillatorType', function (event, nodeID, waveType) {
        try {
            audioManager.setOscillatorType(nodeID, waveType);
            ipcRenderer.send('getOscillatorType', nodeID , waveType);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setOscillatorFrequency', function (event, nodeID, frequency) {
        try {
            audioManager.setOscillatorFrequency(nodeID, frequency);
            ipcRenderer.send('getOscillatorFrequency', nodeID , frequency);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setOscillatorDetune', function (event, nodeID, detuneValue) {
        try {
            audioManager.setOscillatorDetune(nodeID, detuneValue);
            ipcRenderer.send('getOscillatorDetune', nodeID , detuneValue);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setGainValue', function (event, nodeID, gain) {
        try {
            audioManager.setGainValue(nodeID, gain);
            ipcRenderer.send('getGain', nodeID , gain);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setTargetAtTime', function (event, targetID, targetValue, startTime, timeConstant ) {
        try {
            audioManager.setTargetAtTime(targetID, targetValue, startTime, timeConstant);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setDelayTime', function (event, nodeID, delayTime) {
        try {
            audioManager.setDelayTime(nodeID, delayTime);
            ipcRenderer.send('getDelayTime', nodeID , delayTime);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setBiquadFilterType', function (event, nodeID, filterType) {
        try {
            audioManager.setBiquadFilterType(nodeID, filterType);
            ipcRenderer.send('getBiquadFilterType', nodeID , filterType);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setBiquadFilterFrequency', function (event, nodeID, frequency) {
        try {
            audioManager.setBiquadFilterFrequency(nodeID, frequency);
            ipcRenderer.send('getBiquadFilterFrequency', nodeID , frequency);
        } catch (e) {
            console.log(e);
        }
    });

    ipcRenderer.on('setBiquadFilterQ', function (event, nodeID, q) {
        try {
            audioManager.setBiquadFilterQ(nodeID, q);
            ipcRenderer.send('getBiquadFilterQ', nodeID , q);
        } catch (e) {
            console.log(e);
        }
    });

};
