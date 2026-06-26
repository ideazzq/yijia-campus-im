import {AuthReducerState} from "./AuthModel";
import * as actionTypes from "./AuthActionType";
import {Action} from "../CommonModel";

const initialState: AuthReducerState = {
    signin: null,
    signup: null,
    reqUser: null,
    searchUser: null,
    users: null,
    contacts: null,
    incomingFriendRequests: [],
    outgoingFriendRequests: [],
    updateUser: null,
    successMessage: null,
    errorMessage: null,
};

const authReducer = (state: AuthReducerState = initialState, action: Action): AuthReducerState => {
    switch (action.type) {
        case actionTypes.REGISTER:
            return {...state, signup: action.payload};
        case actionTypes.LOGIN_USER:
            return {...state, signin: action.payload};
        case actionTypes.REQ_USER:
            return {...state, reqUser: action.payload};
        case actionTypes.SEARCH_USER:
            return {...state, searchUser: action.payload};
        case actionTypes.GET_ALL_USERS:
            return {...state, users: action.payload};
        case actionTypes.GET_CONTACTS:
            return {...state, contacts: action.payload};
        case actionTypes.GET_INCOMING_FRIEND_REQUESTS:
            return {...state, incomingFriendRequests: action.payload};
        case actionTypes.GET_OUTGOING_FRIEND_REQUESTS:
            return {...state, outgoingFriendRequests: action.payload};
        case actionTypes.UPDATE_USER:
            return {...state, updateUser: action.payload};
        case actionTypes.AUTH_SUCCESS:
            return {...state, successMessage: action.payload, errorMessage: null};
        case actionTypes.AUTH_ERROR:
            return {...state, errorMessage: action.payload, successMessage: null};
        case actionTypes.CLEAR_AUTH_FEEDBACK:
            return {...state, successMessage: null, errorMessage: null};
        case actionTypes.LOGOUT_USER:
            return {
                ...state,
                signin: null,
                signup: null,
                reqUser: null,
                contacts: [],
                incomingFriendRequests: [],
                outgoingFriendRequests: [],
                searchUser: null,
                users: null,
            };
        default:
            return state;
    }
};

export default authReducer;
