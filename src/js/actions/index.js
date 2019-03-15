import { SELECT_ROOM, SELECT_DESK, SELECT_FLOOR, SELECT_VIEW, SELECT_MAP_FILTERS, SELECT_ROOM_LIST_TAB, SELECT_SEARCH_FILTERS, SET_INFO_DIALOG_VISIBILITY, START_NAVIGATION, NAVIGATE_COMPLETE, MARKED_ROOMS } from '../constants/action-types.js'

export const selectRoom = (room) => ({
    type: SELECT_ROOM,
    room: room
});

export const selectDesk = (desk) => ({
    type: SELECT_DESK,
    desk: desk
});

export const markedRooms = (rooms) => ({
    type: MARKED_ROOMS,
    rooms: rooms
})

export const selectFloor = (floor) => ({
    type: SELECT_FLOOR,
    floor: floor
});

export const selectView = (view) => ({
    type: SELECT_VIEW,
    view: view
});

export const selectMapFilters = (filters) => ({
    type: SELECT_MAP_FILTERS,
    filters: filters
});

export const selectRoomListTab = (tab) => ({
    type: SELECT_ROOM_LIST_TAB,
    tab: tab
});

export const selectSearchFilters = (filters) => ({
    type: SELECT_SEARCH_FILTERS,
    filters: filters
});

export const setInfoDialogVisibility = (visible) => ({
	type: SET_INFO_DIALOG_VISIBILITY,
	infoDialogVisibility: visible
});

export const startNavigation = (from, to) => ({
    type: START_NAVIGATION,
    from,
    to,
});

export const completeNavigation = () => ({
    type: NAVIGATE_COMPLETE
});