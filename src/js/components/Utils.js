const room_list = require('../../data/rooms.json');
const desk_list = require('../../data/desks.json');

export default class Utils {
	static getRoomByName(roomName) {
        //var sRoomName = roomName.replace(/\W/g, '')
        for (let i in room_list){
        	let room = room_list[i].title.replace(/\r?\n|\r/g, ""); // remove hidden HTML characters, DO NOT REMOVE OR IT WILL CAUSE A SHIP BREAKING BUG
        	let adjustedRoomName = roomName.replace(/\r?\n|\r/g, "");
            if (room.toLowerCase() === adjustedRoomName.toLowerCase()){
                return room_list[i];
            }
        }
        return null;
    }

    static getDesk(deskCode) {
        for (let desk in desk_list) {
            if (desk_list[desk].title.toLowerCase() === deskCode.toLowerCase()) {
                return desk_list[desk];
            }
        }
        return null;
    }

	static isValidRoom(selectedRoom) {
	    for (let room in room_list) {
	        if (room_list[room].title.toLowerCase() === selectedRoom.toLowerCase()) {
	            return true;
	        }
	    }
	    return false;
	}

	static isValidDesk(selectedDesk) {
	    for (let desk in desk_list) {
	        if (desk_list[desk].title.toLowerCase() === selectedDesk.toLowerCase()) {
	            return true;
	        }
	    }
	    return false;
	}

	static isValidFloor(selectedFloor) {
	    switch (selectedFloor) {
	        case 1:
	        case 2:
	        case 3: return true;
	        default: return false;
	    }
	}

	static getParams() {
	    let params = window.location.hash;
	    if (!params || params[0] !== '#') {
	        return {
	            selectedRoom: '',
	            selectedDesk: '',
	            navigateFrom: '',
	            navigateTo: ''
	        };
	    }

	    if (params[0] === '#' && params[1]) {
	        params = params.substr(1); // remove #
	    }

	    let oURLSearchParams = new URLSearchParams(params);

	    let selectedRoom = oURLSearchParams.get('selectedRoom');
	    let selectedDesk = oURLSearchParams.get('selectedDesk');
	    let navigateFrom = oURLSearchParams.get('navigateFrom');
	    let navigateTo = oURLSearchParams.get('navigateTo');

	    if (selectedRoom && !this.isValidRoom(selectedRoom)) {
	        selectedRoom = '';
	        alert("Invalid selectedRoom URL parameter value.");
	    }

	    if (selectedDesk && !this.isValidDesk(selectedDesk)) {
	        selectedDesk = '';
	        alert("Invalid selectedDesk URL parameter value.");
	    }

	    if (navigateFrom && !this.isValidRoom(navigateFrom) && !this.isValidDesk(navigateFrom)) {
	        navigateFrom = '';
	        alert("Invalid navigateFrom URL parameter value.");
	    }

	    if (navigateTo && !this.isValidRoom(navigateTo) && !this.isValidDesk(navigateTo)) {
	        navigateTo = '';
	        alert("Invalid navigateTo URL parameter value.");
	    }

	    return {
	        selectedRoom: selectedRoom ? selectedRoom : '',
	        selectedDesk: selectedDesk ? selectedDesk : '',
	        navigateFrom: navigateFrom ? navigateFrom : '',
	        navigateTo: navigateTo ? navigateTo : ''
	    };
	}

	static getInitialFloor(oParams) {
		let cachedFloor = localStorage.getItem('floor');
		if (oParams.selectedRoom) {
			return this.getRoomByName(oParams.selectedRoom).floor;
		} else if (oParams.selectedDesk) {
			return this.getDesk(oParams.selectedDesk).floor;
		} else if (oParams.navigateFrom && oParams.navigateTo) {
			return this.getRoomByName(oParams.navigateFrom).floor || this.getDesk(oParams.navigateFrom).floor;
		} else if (cachedFloor) {
			return parseInt(cachedFloor);
		}
		return 2; // default
	}

	static setURLParam(param, value) {
        let sParams = window.location.hash;
        let oParams = new URLSearchParams(sParams.replace('#', ''));

        if (value) {
        	oParams.set(param, value);
        } else {
        	oParams.delete(param);
        }

        window.location.hash = oParams.toString();
    }
}