import {MessageReducerState} from "./MessageModel";
import {Action} from "../CommonModel";
import * as actionTypes from './MessageActionType';

const initialState: MessageReducerState = {
    messages: [],
    newMessage: null,
    uploadProgress: 0,
};

const messageReducer = (state: MessageReducerState = initialState, action: Action): MessageReducerState => {
    switch (action.type) {
        case actionTypes.CREATE_NEW_MESSAGE:
            return {...state, newMessage: action.payload};
        case actionTypes.GET_ALL_MESSAGES:
            return {...state, messages: action.payload};
        case "SET_UPLOAD_PROGRESS":
            return {...state, uploadProgress: action.payload};
    }
    return state;
};

export default messageReducer;
