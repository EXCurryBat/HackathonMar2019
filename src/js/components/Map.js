import React, { Component } from 'react';
import '../../css/map.css';
import { connect } from 'react-redux';
import { Button } from 'semantic-ui-react';
import { completeNavigation, startNavigation, selectFloor } from '../actions/index';
import { BASE, KITCHENS, BATHROOMS, STAIRS, ELEVATORS, AMENITIES, FLOOR1, FLOOR2, FLOOR3 } from '../constants/filters';
import { SAME_FLOOR, CROSS_FLOOR } from '../constants/navigation-constants';
import Utils from './Utils';
const desks = require('../../data/desks.json')
const stairsEvevators = require('../constants/stairs-elevators-nodes.json');
const PriorityQueue = require("js-priority-queue");
const FLOOR_NODES = require("../constants/nodes.json");

// Navigation Constants
const MAP_X = 1328;
const MAP_Y = 738;
const POINT_RADIUS = 10;
const ICON_SIZE = 60;
const STROKE_COLOR = "#448AFF"; // blue

var canvas, ctx;

const mapStateToProps = (state) => {
    return {
        selectedFloor: state.selectedFloor,
        selectedRoom: state.selectedRoom,
        selectedDesk: state.selectedDesk,
        selectedMapFilters: state.selectedMapFilters,
        navigateFrom: state.navigateFrom,
        navigateTo: state.navigateTo,
        navCompleted: state.navCompleted,
        markedRooms: state.markedRooms,
    };
}

const mapDispatchToProps = (dispatch) => {
    return {
        completeNavigation: () => dispatch(completeNavigation()),
        startNavigation: (navigateFrom, navigateTo) => dispatch(startNavigation(navigateFrom, navigateTo)),
        selectFloor: floor => dispatch(selectFloor(floor))
    };
}

class ConnectedMap extends Component {
    constructor(props) {
        super(props);
        this.drawLocationMarker = this.drawLocationMarker.bind(this);
        this.getMapFilters = this.getMapFilters.bind(this);
        this.showToastMessage = this.showToastMessage.bind(this);
        this.getDeskFromName = this.getDeskFromName.bind(this);
        this.updateSize = this.updateSize.bind(this);
        this.navigate = this.navigate.bind(this);
        this.renderOnCanvas = this.renderOnCanvas.bind(this);
        this.clearNavigation = this.clearNavigation.bind(this);
        this.renderFilteredMarkers = this.renderFilteredMarkers.bind(this);
        this.naviCache = {
            type: SAME_FLOOR,
            floor: 2,
            path: [],
            start: this.props.navigateFrom,
            end: this.props.navigateTo,
            updated: false,
            rendered: true
        }
        this.mainNodes1 = [];
        this.mainNodes2 = [];
        this.mainNodes3 = [];
        this.subNodes1 = [];
        this.subNodes2 = [];
        this.subNodes3 = [];
        this.bNodesProcessed = false;
    }

    compareNodes(node1, node2) {
        return node1.id === node2.id && node1.floor === node2.floor;
    }

    getManhattanDistance(node1, node2) {
        return Math.sqrt(Math.pow(node1.x - node2.x, 2) + Math.pow(node1.y - node2.y, 2));
    }

    containNode(nodes, node) {
        let bContain = false;
        for (let i = 0; i < nodes.length; i++) {
            if (this.compareNodes(nodes[i], node)) {
                bContain = true;
            }
        }
        return bContain;
    }
    // Heuristic of nodes is an estimation of the distance from one node to another
    // We give more weight on subnodes because we prefer wood pathes (otherwise it may disturb other colleagues)
    // This heuristic is not the same as the heuristic of path. Heuristic of path is the heuristic beteen nodes + actual distance travelled from the startNode)
    computeHeuristic(node1, node2) {
        let result = this.getManhattanDistance(node1, node2);
        let bSubPath = (node1.type === "sub") || (node2.type === "sub")
        return bSubPath ? 3 * result : result; // prefer wood paths
    };

    // Take a list of nodes and draw them on the map
    drawLines(array) {
        if (array.length !== 0) {
            ctx.beginPath();
            ctx.lineWidth = 12;
            ctx.strokeStyle = STROKE_COLOR;
            ctx.lineJoin = 'round';
            ctx.moveTo(array[0].x/MAP_X * canvas.width, array[0].y/MAP_Y * canvas.height);
            for (let i = 1; i < array.length; i++) {
                ctx.lineTo(array[i].x/MAP_X * canvas.width,array[i].y/MAP_Y * canvas.height);
            }
            ctx.stroke();
        }
    }

    // A helper function to fetch node object from nodes.json
    getNodeFromID(id, floor) {
        if (!this.bNodesProcessed) {
            for (let i=0 ; i< FLOOR_NODES.length; i++) {
                if (FLOOR_NODES[i].type === "main" && FLOOR_NODES[i].floor === 2) {
                    this.mainNodes2.push(FLOOR_NODES[i]);
                } else if (FLOOR_NODES[i].type === "main" && FLOOR_NODES[i].floor === 3) {
                    this.mainNodes3.push(FLOOR_NODES[i]);
                } else if (FLOOR_NODES[i].type === "main" && FLOOR_NODES[i].floor === 1) {
                    this.mainNodes1.push(FLOOR_NODES[i]);
                } else if (FLOOR_NODES[i].type === "sub" && FLOOR_NODES[i].floor === 2) {
                    this.subNodes2.push(FLOOR_NODES[i]);
                } else if (FLOOR_NODES[i].type === "sub" && FLOOR_NODES[i].floor === 3) {
                    this.subNodes3.push(FLOOR_NODES[i]);
                } else if (FLOOR_NODES[i].type === "sub" && FLOOR_NODES[i].floor === 1) {
                    this.subNodes1.push(FLOOR_NODES[i]);
                }
            }
            this.mainNodes1.sort(function (node1, node2) {return node1.id - node2.id;});
            this.subNodes1.sort(function (node1, node2) {return node1.id - node2.id;});
            this.mainNodes2.sort(function (node1, node2) {return node1.id - node2.id;});
            this.subNodes2.sort(function (node1, node2) {return node1.id - node2.id;});
            this.mainNodes3.sort(function (node1, node2) {return node1.id - node2.id;});
            this.subNodes3.sort(function (node1, node2) {return node1.id - node2.id;});
            this.bNodesProcessed = true;
        }
        switch (floor) {
            case FLOOR1.value: return id >= 1000 ? this.subNodes1[id-1000] : this.mainNodes1[id];
            case FLOOR2.value: return id > 1000 ? this.subNodes2[id-2000] : this.mainNodes2[id];
            case FLOOR3.value: return id > 3000 ? this.subNodes3[id-3001] : this.mainNodes3[id - 1];
            default: return null;
        }
    }
    // The core function to calculate the optimal route (it may take a few minutes to understand, but I promise it's not super hard since it's only 32 lines)
    calulateBestPathOnSameFloor(startNode, endNode) {
        // PriorityQueue is a datastructure that always returns the smallest value (in our case, it returns the path with the smallest heuristic)
        let frontier = new PriorityQueue({
            comparator: function(path1, path2) {
                return path1.h - path2.h;
            }
        });
        let initialPath = {
            nodes: [startNode],
            cost: 0,
            h: this.computeHeuristic(startNode, endNode)
        };
        // Initialize the frontier
        frontier.queue(initialPath);

        while (frontier.length !== 0) {
            let currentPath = frontier.dequeue();
            let nodes = currentPath.nodes;
            let nexts = nodes[nodes.length -1].nexts.map(node => this.getNodeFromID(node, startNode.floor));  // A list of nodes which are reachable from the current node
            if (this.containNode(nexts, endNode)) {
                nodes.push(endNode);
                return nodes;
            }
            for (let i = 0; i < nexts.length; i++) {
                if (!this.containNode(nodes, nexts[i])) {
                    let nextCost = currentPath.cost + this.computeHeuristic(nodes[nodes.length-1], nexts[i]);
                    let nextPath = {
                        nodes: nodes.concat([nexts[i]]),
                        cost: nextCost,
                        h: this.computeHeuristic(nexts[i], endNode) + nextCost
                    }
                    frontier.queue(nextPath);
                }
            }
        }
        return [];
    };

    getMapFilters() {
        let selectedFilters = this.props.selectedMapFilters;
        let selectedFloor = this.props.selectedFloor;
        let kitchens_visibility = {
            'visibility': (selectedFilters.find(i => (i === KITCHENS.key)) !== undefined) ? 'visible' : 'hidden',
            'position': 'absolute',
            'zIndex': '3'
        }
        let bathrooms_visibility = {
            'visibility': (selectedFilters.find(i => (i === BATHROOMS.key)) !== undefined) ? 'visible' : 'hidden',
            'position': 'absolute',
            'zIndex': '3'
        }
        let stairs_visibility = {
            'visibility': (selectedFilters.find(i => (i === STAIRS.key)) !== undefined) ? 'visible' : 'hidden',
            'position': 'absolute',
            'zIndex': '3'
        }
        let elevators_visibility = {
            'visibility': (selectedFilters.find(i => (i === ELEVATORS.key)) !== undefined) ? 'visible' : 'hidden',
            'position': 'absolute',
            'zIndex': '3'
        }
        let base_position = {
            'position': 'absolute',
            'zIndex': '2'
        }
        let canvas_position = {
            'position': 'absolute',
            'zIndex': '5'
        };
        let amenities_visibility = {
            'visibility': ((selectedFloor === FLOOR1.value) && (selectedFilters.find(i => (i === AMENITIES.key)) !== undefined)) ? 'visible' : 'hidden',
            'position': 'absolute',
            'zIndex': '3',
            'width': '100%' // temporary fix, does not completely solve bug
        };

        return (
            <div>
                <canvas className="mapCanvas" style={canvas_position} ref="myCanvas"></canvas>
                <img className="base" style={base_position} alt="" id="base" src={require("../../images/map/" + selectedFloor + "/base_min.jpg")} />
                <img style={kitchens_visibility} alt="" id="kitchens" src={require("../../images/map/" + selectedFloor + "/kitchens_min.png")} />
                <img style={bathrooms_visibility} alt="" id="bathrooms" src={require("../../images/map/" + selectedFloor + "/bathrooms_min.png")} />
                <img style={stairs_visibility} alt="" id="stairs" src={require("../../images/map/" + selectedFloor + "/stairs_min.png")} />
                <img style={elevators_visibility} alt="" id="elevators" src={require("../../images/map/" + selectedFloor + "/elevators_min.png")} />
                <img style={amenities_visibility} alt="" id="amenities" src={require("../../images/map/1/amenities_min.png")} />
            </div>
        );
    }

    drawLocationMarker() {
        if ((this.props.selectedRoom !== '' || this.props.selectedDesk !== '') && ctx) {
            let markerImage = new Image();
            let selectedPlace = this.props.selectedRoom === '' ? this.getDeskFromName(this.props.selectedDesk) : Utils.getRoomByName(this.props.selectedRoom);
            if (this.props.selectedFloor === selectedPlace.floor) {
                markerImage.src = require('../../images/marker.png');
                markerImage.onload = () => {
                    ctx.drawImage(markerImage, selectedPlace.x/MAP_X*canvas.width- ICON_SIZE/2, selectedPlace.y/MAP_Y*canvas.height-ICON_SIZE , ICON_SIZE, ICON_SIZE);
                }
            }
        }
    }

    renderFilteredMarkers(){
        console.log(this.props.markedRooms);
        if(this.props.markedRooms !== undefined && this.props.markedRooms.length > 0){
            for (let i = 0; i < this.props.markedRooms.length ; i++){
                if(this.props.markedRooms[i] == undefined){
                    continue;
                }
                let markerImage = new Image();
                let selectedPlace = Utils.getRoomByName(this.props.markedRooms[i]);
                if (this.props.selectedFloor === selectedPlace.floor) {
                    markerImage.src = require('../../images/marker.png');
                    markerImage.onload = () => {
                        ctx.drawImage(markerImage, selectedPlace.x/MAP_X*canvas.width- ICON_SIZE/2, selectedPlace.y/MAP_Y*canvas.height-ICON_SIZE , ICON_SIZE, ICON_SIZE);
                    }
                }
            }
        }
    }

    getDeskFromName(title) {
        for (let i in desks) {
            let desk = desks[i];
            if (desk["title"].toLowerCase() === title.toLowerCase()) {
                return {
                    "title": desk["title"],
                    "x": desk["x"] / 10,
                    "y": desk["y"] / 10,
                    "floor": desk["floor"]
                };
            }
        }
        return undefined;
    }

    // This is just for testing purposes. It will draw nodes on the map. It is never called in production code.
    drawNodes(array) {
        for (let i=0; i < array.length; i++) {
            ctx.beginPath();
            ctx.fillStyle = array[i].type === "main" ? "#F57F17" : "#FFEB3B";
            ctx.arc(array[i].x/MAP_X * canvas.width, array[i].y/MAP_Y * canvas.height, POINT_RADIUS, 0, 2*Math.PI);
            ctx.fill();
            ctx.font="20px Georgia";
            ctx.fillStyle = "#000000";
            ctx.fillText(array[i].id, array[i].x/MAP_X * canvas.width, array[i].y/MAP_Y * canvas.height);
        }
    };

    // Given a point with property x and y, return the nearest path node in paths
    getNearestNode(point) {
        let iMinDistance = 10000;
        let currentNode;
        let curFloor = point.floor;
        for (let i = 0; i < FLOOR_NODES.length; i++) {
            if (FLOOR_NODES[i].floor === curFloor) {
                let iManhattanDistance = this.getManhattanDistance(point, FLOOR_NODES[i]);
                let iDistance = FLOOR_NODES[i].type === "main" ? iManhattanDistance : 1.2 * iManhattanDistance;
                if (iDistance < iMinDistance) {
                    iMinDistance = iDistance;
                    currentNode = FLOOR_NODES[i];
                }
            }
        }
        return currentNode;
    };

    //Transition is like a node object, it represents an elevator or stair. We need to count them as start/end node in the cross floor navigation
    getTransition(id, floor) {
        let curFloor = floor;
        for (let trans of stairsEvevators) {
            if (trans.floor === curFloor && trans.id === id) {
                return trans;
            }
        }
    }

    //this helper function is used when calculating crossfloor navigation.
    //It will return the optimal transition which minimize the total distance
    getOptimalTransitions(oStartPoint, oEndPoint) {
        let bestDistance = 1000000;
        let curResult = undefined;
        let curFloor = oStartPoint.floor;
        for (let trans of stairsEvevators) {
            if (trans.floor === curFloor) {
                let oEndTrans = this.getTransition(trans.id, oEndPoint.floor);
                let curDistance = this.getManhattanDistance(trans, oStartPoint) + this.getManhattanDistance(oEndTrans, oEndPoint);
                if (curDistance < bestDistance) {
                    bestDistance = curDistance;
                    curResult = {
                        start: trans,
                        end: oEndTrans
                    }
                }
            }
        }
        return curResult;
    }

    componentDidMount() {
        canvas = this.refs.myCanvas;
        ctx = canvas.getContext("2d");
        canvas.width = MAP_X*2;
        canvas.height = MAP_Y*2;
        canvas.style.width = canvas.width/2 + "px";
        canvas.style.height = canvas.height/2 + "px";
        this.renderOnCanvas();
        window.addEventListener("resize", this.updateSize);
        this.updateSize();
        this.drawLocationMarker();
        this.renderFilteredMarkers();
    }

    componentWillReceiveProps(){
        this.renderFilteredMarkers();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateSize);
    }

    //This function is the goalkeeper of navigation. Only when user input correct room name/ deskNumber will trigger the acutally calculation.
    //Otherwise we will throw thoast messages.
    navigate() {
        let startPoint = this.props.navigateFrom && this.props.navigateFrom.toLowerCase();
        let endPoint = this.props.navigateTo && this.props.navigateTo.toLowerCase();
        let bValidStartPoint = startPoint && (Utils.getRoomByName(startPoint) || Utils.getDesk(startPoint));
        let bValidEndPoint = endPoint && (Utils.getRoomByName(endPoint) || Utils.getDesk(endPoint));

        //we want to check if this.props.navCompeleted is true to avoid re-calculate the navigation path.
        //Recalculation will waste CPU time and also cause bad user experience. (Every time the calculation is completed, it will trigger toast message. It could be annoying.)
        if (!this.props.navCompleted && bValidStartPoint && bValidEndPoint && (this.naviCache.start !== startPoint || this.naviCache.end !== endPoint)) {
            this.computeNavigationPath(startPoint, endPoint);
        } else if (!startPoint && !endPoint || this.props.navCompleted) {
            return;
        } else if (!bValidEndPoint && !bValidStartPoint) {
            this.showToastMessage("Please check both start and end points!");
        } else if (!bValidStartPoint) {
            this.showToastMessage("Please check the start point!");
        } else {
            this.showToastMessage("Please check the end point!");
        }

        //This will set this.props.navCompleted to true, therefore avoid recalculation.
        this.props.completeNavigation();
    }

    computeNavigationPath(sStart, sEnd) {
        //start can be a name/deskId
        let oStartPoint = Utils.getRoomByName(sStart) || this.getDeskFromName(sStart);
        let adjustedStartPoint = {
            x: oStartPoint.x,
            y: oStartPoint.y,
            floor: oStartPoint.floor
        }
        let oStartNode = this.getNearestNode(adjustedStartPoint);
        let oEndPoint = Utils.getRoomByName(sEnd) || this.getDeskFromName(sEnd);
        let adjustedEndPoint = {
            x: oEndPoint.x,
            y: oEndPoint.y,
            floor: oEndPoint.floor,
            updated: true
        }

        // If startPoint is not in current floor, we should switch to that floor
        if (adjustedStartPoint.floor !== this.props.selectedFloor && !this.props.selectedRoom && !this.props.selectedDesk) {
            localStorage.setItem('floor', adjustedStartPoint.floor);
            this.props.selectFloor(adjustedStartPoint.floor);
        }

        Utils.setURLParam('navigateFrom', oStartPoint.title);
        Utils.setURLParam('navigateTo', oEndPoint.title);
        let oEndNode = this.getNearestNode(adjustedEndPoint);

        // Same floor navigation
        if (adjustedStartPoint.floor === adjustedEndPoint.floor) {
            //we keep a naviCache so that the navigation result will be cached
            let aPathes = [adjustedStartPoint].concat(this.calulateBestPathOnSameFloor(oStartNode, oEndNode)).concat([adjustedEndPoint]);
            this.naviCache = {
                type: SAME_FLOOR,
                floor: oStartPoint.floor,
                path: aPathes,
                start: sStart,
                end: sEnd,
                updated: true,
                rendered: false
            };
            let sStartName = oStartPoint.title;
            let sEndName = oEndPoint.title;
            //we keep a naviCache so that the navigation result will be cached
            this.showToastMessage("Starting navigation from " + sStartName + " to " + sEndName + ".");
        } else {
            /*
                In case of cross-floor navigation, we need to calculate two pathes on each floor.
                We add a Transition point as the intermediate goal
            */
            let oTransitionPoint = this.getOptimalTransitions(adjustedStartPoint, adjustedEndPoint);
            let oNodeBeforeTransition = this.getNearestNode(oTransitionPoint.start);
            let oNodeAfterTransition = this.getNearestNode(oTransitionPoint.end);
            let aFirstPath = [adjustedStartPoint].concat(this.calulateBestPathOnSameFloor(oStartNode, oNodeBeforeTransition));
            let aSecondPath = (this.calulateBestPathOnSameFloor(oNodeAfterTransition, oEndNode)).concat([adjustedEndPoint]);
            this.naviCache = {
                type: CROSS_FLOOR,
                startFloor: oStartPoint.floor,
                endFloor: oEndPoint.floor,
                firstPath: aFirstPath,
                secondPath: aSecondPath,
                start: sStart,
                end: sEnd,
                updated: true,
                rendered: false
            }
            //show a message to notify user about the second path
            let jumpToFloor =  this.props.selectedFloor === this.naviCache.startFloor ? this.naviCache.endFloor : this.naviCache.startFloor;
            this.showToastMessage("Please go to floor " + jumpToFloor + " to see the rest of the navigational path.");
        }
    }

    //A helper function to render navigation result on the map. It take advantage of naviCache so that we don't need to calculate multiple times for one navigation.
    visualizeNavigationResult(bRefresh) {
        if (this.naviCache && this.naviCache.type === SAME_FLOOR) {
            if (this.naviCache.floor === this.props.selectedFloor) {
                this.drawLines(this.naviCache.path);
            }
            this.naviCache.rendered = true;
        } else if (this.naviCache && this.naviCache.type === CROSS_FLOOR) {
            if (this.naviCache.startFloor === this.props.selectedFloor) {
                this.drawLines(this.naviCache.firstPath);
            } else if (this.naviCache.endFloor === this.props.selectedFloor) {
                this.drawLines(this.naviCache.secondPath);
            }
            this.naviCache.rendered = true;
        }
    }

    showToastMessage(msg) {
        let snackbar = this.refs.snackbar;
        if (snackbar) {
            snackbar.innerText = msg;
            snackbar.className = "show";
            setTimeout(function() { snackbar.className = snackbar.className.replace("show", ""); }, 3000);
        }
    }

    renderOnCanvas() {
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.drawLocationMarker();
            this.renderFilteredMarkers();
            this.visualizeNavigationResult(false);
        }
    }
    //This function take cares of resizing. It make sure the map size, all layers and canvas get resized properly.
    updateSize() {
        if (ctx) {
            canvas.width = window.innerWidth * 13/8;
            canvas.height = canvas.width * MAP_Y/MAP_X;
            canvas.style.width = canvas.width/2 + "px";
            canvas.style.height = canvas.height/2 + "px";
            this.renderOnCanvas();
        }

        let aLayers = [BASE.key, KITCHENS.key, BATHROOMS.key, STAIRS.key, ELEVATORS.key, AMENITIES.key];
        for (let layer of aLayers) {
            let baseImg = document.getElementById(layer);
            if (baseImg && baseImg.style) {
                baseImg.style.height = canvas.style.height;
                baseImg.style.width = canvas.style.width;
            }
        }
    }

    clearNavigation() {
        this.naviCache = {
            type: SAME_FLOOR,
            floor: 2,
            path: [],
            start: "",
            end: "",
            updated: false,
            rendered: true
        };
        this.props.startNavigation('', '');
        Utils.setURLParam('navigateFrom', '');
        Utils.setURLParam('navigateTo', '');
        this.showToastMessage("Navigation has been cleared.");
    }

    render() {
        return (
            <div className="mapContainer">
                <div id="snackbar" ref="snackbar">Some text messages..</div>
                <Button className="clearNavigationButton" onClick={this.clearNavigation}>Clear Navigation</Button>
                {this.getMapFilters()}
                {this.renderOnCanvas()}
                {this.navigate()}
                {this.drawLocationMarker()}
                {this.renderFilteredMarkers()}
            </div>
        );
    }
}

const MapModule = connect(mapStateToProps, mapDispatchToProps)(ConnectedMap);

export default MapModule;