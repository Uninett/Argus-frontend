import {ActionMap, makeAction, makeActionWithoutPayload} from "./common";

export type TicketStateType = {
    // The url that is associated with an incident (is persisted)
    incidentTicketUrl: string | undefined;

    // The url that user is modifying in the input field (not persisted)
    ticketUrl: string | undefined;

    // Whether user has modified the url in the input field in any way
    isChangedUrl: boolean;

    isInvalidAbsoluteUrl: boolean;

    isManuallyEditingTicket: boolean;
};

export enum TicketType {
    InitTicketState = "INIT_TICKET_STATE",
    ChangeUrl = "CHANGE_URL",
    InvalidUrl = "INVALID_URL",
    ManuallyEditTicket = "MANUALLY_EDIT_TICKET",
    ResetTicketState = "RESET_TICKET_STATE",
}

type TicketPayload = {
    [TicketType.InitTicketState]: string | undefined;
    [TicketType.ChangeUrl]: string | undefined;
    [TicketType.InvalidUrl]: undefined;
    [TicketType.ManuallyEditTicket]: undefined;
    [TicketType.ResetTicketState]: string | undefined | null;
};

export const initialTicketState: TicketStateType = {
    incidentTicketUrl: undefined,
    ticketUrl: undefined,
    isChangedUrl: false,
    isInvalidAbsoluteUrl: false,
    isManuallyEditingTicket: false,
};


export type TicketActions = ActionMap<TicketPayload>[keyof ActionMap<TicketPayload>];

export const ticketReducer = (state: TicketStateType, action: TicketActions) => {
    switch (action.type) {
        case TicketType.InitTicketState:
            return {
                ...initialTicketState,
                incidentTicketUrl: action.payload,
                ticketUrl: action.payload
            };
        case TicketType.ResetTicketState:
            if (action.payload === null) { // hard reset (on unmount)
                return { ...initialTicketState }
            } else { // soft reset (on save without any changes to the ticket url)
                return { ...state, isChangedUrl: false, isInvalidAbsoluteUrl: false, isManuallyEditingTicket: false }
            }
        case TicketType.ChangeUrl:
            return {...state, isChangedUrl: true, ticketUrl: action.payload, isManuallyEditingTicket: true};
        case TicketType.InvalidUrl:
            return {...state, isInvalidAbsoluteUrl: true}
        case TicketType.ManuallyEditTicket:
            return {...state, ticketUrl: state.incidentTicketUrl, isManuallyEditingTicket: true}
        default:
            return {...state};
    }
};

export const initTicketState = makeAction<TicketType.InitTicketState, string | undefined>(TicketType.InitTicketState);
export const changeUrl = makeAction<TicketType.ChangeUrl, string | undefined>(TicketType.ChangeUrl);
export const invalidUrl = makeActionWithoutPayload<TicketType.InvalidUrl>(TicketType.InvalidUrl);
export const manuallyEditTicket = makeActionWithoutPayload<TicketType.ManuallyEditTicket>(TicketType.ManuallyEditTicket);
export const resetTicketState = makeAction<TicketType.ResetTicketState, string | undefined | null>(TicketType.ResetTicketState);
