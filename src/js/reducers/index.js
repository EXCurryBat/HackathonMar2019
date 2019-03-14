import { SELECT_FLOOR, SELECT_ROOM, SELECT_DESK, SELECT_MAP_FILTERS, SELECT_ROOM_LIST_TAB, SELECT_SEARCH_FILTERS, SET_INFO_DIALOG_VISIBILITY, START_NAVIGATION, NAVIGATE_COMPLETE } from '../constants/action-types';
import { KITCHENS, BATHROOMS, STAIRS, ELEVATORS, AMENITIES, ALL_FLOORS } from '../constants/filters';
import Utils from '../components/Utils';

const params = Utils.getParams();
const initialFloor = Utils.getInitialFloor(params);

const initialState = {
    selectedFloor: initialFloor,
    selectedRoom: params.selectedRoom,
    selectedDesk: params.selectedDesk,
    selectedRoomListTab: ALL_FLOORS.index,
    selectedSearchFilters: {
        seats: 0,
        avEquipment: []
    },
    navigateFrom: params.navigateFrom,
    navigateTo: params.navigateTo,
    navCompleted: (params.navigateFrom && params.navigateTo) ? false : true,
    selectedMapFilters: [ KITCHENS.key, BATHROOMS.key, STAIRS.key, ELEVATORS.key, AMENITIES.key ],
    infoDialogVisibility: false
};

const rootReducer = (state, action) => {
    if (state === undefined) {
        return initialState;
    }

    switch (action.type) {
        case SELECT_FLOOR:
            return {
                ...state,
                selectedFloor: action.floor
            };
        case SELECT_ROOM:
            return {
                ...state,
                selectedRoom: action.room,
                selectedDesk: ''
            };
        case SELECT_DESK:
            return {
                ...state,
                selectedDesk: action.desk,
                selectedRoom: ''
            };
        case SELECT_MAP_FILTERS:
            return {
                ...state,
                selectedMapFilters: action.filters
            };
        case SELECT_ROOM_LIST_TAB:
            return {
                ...state,
                selectedRoomListTab: action.tab
            };
        case SELECT_SEARCH_FILTERS:
            return {
                ...state,
                selectedSearchFilters: action.filters
            };
        case SET_INFO_DIALOG_VISIBILITY:
            return {
                ...state,
                infoDialogVisibility: action.infoDialogVisibility
            };
        case START_NAVIGATION:
            return {
                ...state,
                navigateFrom: action.from,
                navigateTo: action.to,
                navCompleted: false
            };
        case NAVIGATE_COMPLETE:
            return {
                ...state,
                navigateFrom: '',
                navigateTo: '',
                navCompleted: true
            };
        default:
            return state;
    }
};

export default rootReducer;
