/**
 * Created by ky on 2016/05/30.
 */

module.exports = function (audioContext, audioVisData) {

    const ipcRenderer = require('electron').ipcRenderer;

    var nodeSlots = [];

    audioVisData.nodes.add({
        id: '_DESTINATION',
        label: 'destination',
        color: 'rgba(128, 128, 128, 0.75)',
        x: 0.0,
        y: -2.0,
        fixed: true
    });

    function printLog(logMessage) {
        if (window.printLog) {
            window.printLog(logMessage);
        } else {
            console.log(logMessage);
        }
    }

    function getNodeSlotID(nodeID) {
        return nodeSlots.find(function (element) {
            return (element.nodeID == nodeID);
        });
    }

    function visLabel(nodeSlot) {
        if (nodeSlot.nodeType === 'Oscillator') {
            return 'Oscillator "' + nodeSlot.nodeID + '"\n(' + nodeSlot.node.type + ' ' + nodeSlot.node.frequency.value.toFixed(2) + 'Hz ~ ' + nodeSlot.node.detune.value.toFixed(2) + ')';
        } else if (nodeSlot.nodeType === 'Gain') {
            return 'Gain "' + nodeSlot.nodeID + '"\n(' + nodeSlot.node.gain.value.toFixed(2) + ')';
        } else if (nodeSlot.nodeType === 'Delay') {
            return 'Delay "' + nodeSlot.nodeID + '"\n(' + nodeSlot.node.delayTime.value.toFixed(2) + ')';
        } else if (nodeSlot.nodeType === 'BiquadFilter') {
            return 'BiquadFilter "' + nodeSlot.nodeID + '"\n(' + nodeSlot.node.type + ', ' + nodeSlot.node.frequency.value.toFixed(2) + ', ' + nodeSlot.node.Q.value.toFixed(2) + ')';
        }
    }

    function visColor(nodeSlot) {
        if (nodeSlot.nodeType === 'Oscillator') {
            return 'rgba(255, 127, 80, 1.0)';
        } else if (nodeSlot.nodeType === 'Gain') {
            return 'rgba(255, 182, 193, 1.0)';
        } else if (nodeSlot.nodeType === 'Delay') {
            return 'rgba( 0, 191, 255, 1.0)';
        } else if (nodeSlot.nodeType === 'BiquadFilter') {
            return 'rgba(255, 255, 0, 1.0)';
        }
    }

    function addNodeSlot(nodeID, node, nodeType) {
        let nodeSlot = nodeSlots.find(function (aSlot) {
            return (aSlot.nodeID === nodeID);
        });
        if (!nodeSlot) {
            nodeSlot = {nodeID: nodeID, node: node, nodeType: nodeType};
            nodeSlots.push(nodeSlot);
        } else {
            nodeSlot.node.disconnect();
            nodeSlot.node = node;
            nodeSlot.nodeType = nodeType;
            audioVisData.nodes.remove(nodeID);
            printLog('remove node: ' + nodeID);
            let removal = [];
            audioVisData.edges.forEach(function (anEdge) {
                if (anEdge.from === nodeID) {
                    removal.push(anEdge.id);
                }
                if (anEdge.to === nodeID) {
                    let fromNodeSlot = nodeSlots.find(function (aSlot) {
                        return (aSlot.nodeID === anEdge.from);
                    });
                    removal.push(anEdge.id);
                    try {
                        fromNodeSlot.node.disconnect(nodeSlot.node);
                    } catch (e) {
                        // Ignore it when there is no connection.
                    }
                }
            });
            removal.forEach(function (id) {
                audioVisData.edges.remove(id);
                printLog('remove edge: ' + id);
            });
        }
        audioVisData.nodes.add({id: nodeID, label: visLabel(nodeSlot), color: visColor(nodeSlot)});
    }

    function removeNode(nodeID) {
        let newNodeSlots = [];
        nodeSlots.forEach(function (aSlot) {
            if (aSlot.nodeID == nodeID) {
                if (aSlot.nodeType == 'Oscillator') {
                    aSlot.node.stop();
                }
                aSlot.node.disconnect();
                let nodeID = aSlot.nodeID;
                audioVisData.nodes.remove(nodeID);
                let removal = [];
                audioVisData.edges.forEach(function (anEdge) {
                    if (anEdge.from === nodeID) {
                        removal.push(anEdge.id);
                    }
                    if (anEdge.to === nodeID) {
                        removal.push(anEdge.id);
                    }
                });
                removal.forEach(function (id) {
                    audioVisData.edges.remove(id);
                    printLog('remove edge: ' + id);
                });
                printLog('removeNode: ' + nodeID);
            } else {
                newNodeSlots.push(aSlot);
            }
        });
        nodeSlots = newNodeSlots;
    }

    function removeAllNodes() {
        nodeSlots.forEach(function (aSlot) {
            if (aSlot.nodeType == 'Oscillator') {
                aSlot.node.stop();
            }
            aSlot.node.disconnect();
            let nodeID = aSlot.nodeID;
            audioVisData.nodes.remove(nodeID);
            let removal = [];
            audioVisData.edges.forEach(function (anEdge) {
                if (anEdge.from === nodeID) {
                    removal.push(anEdge.id);
                }
                if (anEdge.to === nodeID) {
                    removal.push(anEdge.id);
                }
            });
            removal.forEach(function (id) {
                audioVisData.edges.remove(id);
            });
        });
        printLog('removeAllNodes');
    }

    function stopAllOscillators() {
        nodeSlots.forEach(function (nSlot) {
            if (nSlot.nodeType == 'Oscillator') {
                try {
                    nSlot.node.stop();
                } catch (e) {
                    // stop before start error should be ignored.
                }
            }
        });
    }

    function createOscillator(nodeID, waveType, frequency) {
        let newNode = audioContext.createOscillator();
        newNode.type = waveType || 'sine';
        newNode.frequency.value = (frequency || 440.00);
        addNodeSlot(nodeID, newNode, 'Oscillator');
        newNode.start();
        printLog('createOscillator: "' + nodeID + '" type: ' + waveType + ' frequency: ' + frequency);
    }

    function createGain(nodeID, gain) {
        let newNode = audioContext.createGain();
        newNode.gain.value = ((gain !== undefined) ? gain : 1.0);
        addNodeSlot(nodeID, newNode, 'Gain');
        printLog('createGain: "' + nodeID + '" gain: ' + gain);
    }

    function createDelay(nodeID, delayTime) {
        let newNode = audioContext.createDelay();
        newNode.delayTime.value = ((delayTime !== undefined) ? delayTime : 1.0);
        addNodeSlot(nodeID, newNode, 'Delay');
        printLog('createDelay: "' + nodeID + '" delayTime: ' + delayTime);
    }

    function createBiquadFilter(nodeID, filterType, frequency, q) {
        let newNode = audioContext.createBiquadFilter();
        newNode.type = (filterType ? filterType : 'lowpass');
        newNode.frequency.value = (frequency || 440.00);
        newNode.Q.value = (q || 440.00);
        addNodeSlot(nodeID, newNode, 'BiquadFilter');
        printLog('createBiquadFilter: "' + nodeID + '" type: ' + filterType + ' frequency: ' + frequency + ' Q: ' + q);
    }

    function connectDestination(fromNodeID) {
        let fromNodeSlot = getNodeSlotID(fromNodeID);
        if (!fromNodeSlot) {
            printLog('ERROR: Not found ' + fromNodeID);
            throw ('ERROR: Not found ' + fromNodeID);
            return;
        }
        fromNodeSlot.node.connect(audioContext.destination);
        let edgeID = fromNodeID + '->_DESTINATION';
        if (!audioVisData.edges.get(edgeID)) {
            audioVisData.edges.add({id: edgeID, from: fromNodeID, to: '_DESTINATION'});
        }
        printLog('connectDestination: ' + fromNodeID);
    }

    function disconnectDestination(fromNodeID) {
        let fromNodeSlot = getNodeSlotID(fromNodeID);
        if (!fromNodeSlot) {
            printLog('ERROR: Not found ' + fromNodeID);
            throw ('ERROR: Not found ' + fromNodeID);
            return;
        }
        fromNodeSlot.node.disconnect(audioContext.destination);
        let edgeID = fromNodeID + '->' + '_DESTINATION';
        audioVisData.edges.remove(edgeID);
        printLog('disconnectDestination: ' + fromNodeID);
    }

    function connectNode(fromID, toID) {
        let fromNodeSlot = getNodeSlotID(fromID);
        if (!fromNodeSlot) {
            printLog('ERROR: Not found ' + fromID);
            throw ('ERROR: Not found ' + fromID);
            return;
        }
        if (toID.toLowerCase() === 'destination') {
            fromNodeSlot.node.connect(audioContext.destination);
            let edgeID = fromID + '->_DESTINATION';
            if (!audioVisData.edges.get(edgeID)) {
                audioVisData.edges.add({id: edgeID, from: fromID, to: '_DESTINATION'});
                printLog('connectNode: ' + edgeID);
            }
        } else {
            let toParam = null;
            let toNodeWithParam = toID.split('.');
            let toNodeSlot = getNodeSlotID(toNodeWithParam[0]);
            if (toNodeWithParam.length > 1) {
                toParam = toNodeSlot.node[toNodeWithParam[1]];
            }
            if (!toNodeSlot) {
                printLog('ERROR: Not found ' + toID);
                throw ('ERROR: Not found ' + toID);
                return;
            }
            if (toNodeSlot.nodeType === 'Oscillator' && !toParam) {
                printLog('ERROR: Oscillator ' + nodeID + ' can not be output.');
                throw ('ERROR: Oscillator ' + nodeID + ' can not be output.');
                return;
            }
            if (toParam) {
                fromNodeSlot.node.connect(toParam);
            } else {
                fromNodeSlot.node.connect(toNodeSlot.node);
            }
            let edgeID = fromID + '->' + toID;
            if (!audioVisData.edges.get(edgeID)) {
                if (toNodeWithParam.length > 1) {
                    audioVisData.edges.add({id: edgeID, from: fromID, to: toNodeSlot.nodeID, label: toNodeWithParam[1]});
                } else {
                    audioVisData.edges.add({id: edgeID, from: fromID, to: toNodeSlot.nodeID, label: ''});
                }
                printLog('connectNode: ' + edgeID);
            }
        }
    }

    function disconnectNode(fromID, toID) {
        let fromNodeSlot = getNodeSlotID(fromID);
        if (!fromNodeSlot) {
            printLog('ERROR: Not found ' + fromID);
            throw ('ERROR: Not found ' + fromID);
            return;
        }
        if (toID.toLowerCase() === 'destination') {
            fromNodeSlot.node.disconnect(audioContext.destination);
            let edgeID = fromID + '->' + '_DESTINATION';
            audioVisData.edges.remove(edgeID);
        } else {
            let toParam = null;
            let toNodeWithParam = toID.split('.');
            let toNodeSlot = getNodeSlotID(toNodeWithParam[0]);
            if (toNodeWithParam.length > 1) {
                toParam = toNodeSlot.node[toNodeWithParam[1]];
            }
            if (!toNodeSlot) {
                printLog('ERROR: Not found ' + toID);
                throw ('ERROR: Not found ' + toID);
                return;
            }
            if (toParam) {
                fromNodeSlot.node.disconnect(toParam);
            } else {
                fromNodeSlot.node.disconnect(toNodeSlot.node);
            }
            let edgeID = fromID + '->' + toID;
            audioVisData.edges.remove(edgeID);
            printLog('disconnectNode: ' + edgeID);
        }
    }

    function setOscillatorType(nodeID, waveType) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Oscillator') {
            printLog('ERROR: ' + nodeID + ' is not an Oscillator.');
            throw ('ERROR: ' + nodeID + ' is not an Oscillator.');
            return;
        }
        aSlot.node.type = waveType;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setOscillatorFrequency(nodeID, frequency) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Oscillator') {
            printLog('ERROR: ' + nodeID + ' is not an Oscillator.');
            throw ('ERROR: ' + nodeID + ' is not an Oscillator.');
            return;
        }
        aSlot.node.frequency.value = frequency;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setOscillatorDetune(nodeID, detuneValue) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Oscillator') {
            printLog('ERROR: ' + nodeID + ' is not an Oscillator.');
            throw ('ERROR: ' + nodeID + ' is not an Oscillator.');
            return;
        }
        aSlot.node.detune.value = detuneValue;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setGainValue(nodeID, gain) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Gain') {
            printLog('ERROR: ' + nodeID + ' is not a Gain.');
            throw ('ERROR: ' + nodeID + ' is not a Gain.');
            return;
        }
        aSlot.node.gain.value = gain;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setTargetAtTime(targetID, targetValue, startTime, timeConstant) {
        let targetParam = null;
        let targetNodeWithParam = targetID.split('.');
        let targetNodeSlot = getNodeSlotID(targetNodeWithParam[0]);
        if (!targetNodeSlot) {
            printLog('ERROR: Not found: ' + targetNodeWithParam[0] + ' at setTargetAtTime');
            throw ('ERROR: Not found: ' + targetNodeWithParam[0] + ' at setTargetAtTime');
            return;
        }
        if (targetNodeWithParam.length > 1) {
            targetParam = targetNodeSlot.node[targetNodeWithParam[1]];
        } else {
            printLog('ERROR: Must assign param: ' + targetID + ' at setTargetAtTime');
            throw ('ERROR: Must assign param: ' + targetID + ' at setTargetAtTime');
            return;
        }
        if (!targetParam) {
            printLog('ERROR: Not found param: ' + targetID + ' at setTargetAtTime');
            throw ('ERROR: Not found param: ' + targetID + ' at setTargetAtTime');
            return;
        }
        targetParam.setTargetAtTime(targetValue, audioContext.currentTime + startTime, timeConstant);
        setTimeout(
            function () {
                let visNode = audioVisData.nodes.get(targetNodeSlot.nodeID);
                if (visNode) {
                    visNode.label = visLabel(targetNodeSlot);
                    audioVisData.nodes.update(visNode);
                }
            },
            (timeConstant * 4) * 1000
        );
    }

    function setDelayTime(nodeID, delayTime) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Delay') {
            printLog('ERROR: ' + nodeID + ' is not a Delay.');
            throw ('ERROR: ' + nodeID + ' is not a Delay.');
            return;
        }
        aSlot.node.delayTime.value = delayTime;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setBiquadFilterType(nodeID, filterType) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'BiquadFilter') {
            printLog('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            throw ('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            return;
        }
        aSlot.node.type = filterType;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setBiquadFilterFrequency(nodeID, frequency) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'BiquadFilter') {
            printLog('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            throw ('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            return;
        }
        aSlot.node.frequency.value = frequency;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function setBiquadFilterQ(nodeID, q) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'BiquadFilter') {
            printLog('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            throw ('ERROR: ' + nodeID + ' is not a BiquadFilter.');
            return;
        }
        aSlot.node.Q.value = q;
        let visNode = audioVisData.nodes.get(nodeID);
        if (visNode) {
            visNode.label = visLabel(aSlot);
            audioVisData.nodes.update(visNode);
        }
    }

    function getOscillatorType(nodeID) {
        let aSlot = getNodeSlotID(nodeID);
        if (!aSlot) {
            printLog('ERROR: Not found ' + nodeID);
            throw ('ERROR: Not found ' + nodeID);
            return;
        }
        if (aSlot.nodeType !== 'Oscillator') {
            printLog('ERROR: ' + nodeID + ' is not an Oscillator.');
            throw ('ERROR: ' + nodeID + ' is not an Oscillator.');
            return '';
        }
        return aSlot.node.type;
    }

    return {
        removeAllNodes: removeAllNodes,
        stopAllOscillators: stopAllOscillators,
        createOscillator: createOscillator,
        createGain: createGain,
        createDelay: createDelay,
        createBiquadFilter: createBiquadFilter,
        connectDestination: connectDestination,
        disconnectDestination: disconnectDestination,
        connectNode: connectNode,
        disconnectNode: disconnectNode,
        setOscillatorType: setOscillatorType,
        setOscillatorFrequency: setOscillatorFrequency,
        setOscillatorDetune: setOscillatorDetune,
        setGainValue: setGainValue,
        setTargetAtTime: setTargetAtTime,
        setDelayTime: setDelayTime,
        setBiquadFilterType: setBiquadFilterType,
        setBiquadFilterFrequency: setBiquadFilterFrequency,
        setBiquadFilterQ: setBiquadFilterQ,
        getOscillatorType: getOscillatorType
    }
};