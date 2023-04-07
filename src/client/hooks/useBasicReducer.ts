import { Reducer, useReducer } from "react";

type SingleActionType<E> = { type: keyof E; payload: any };
type ActionType<E> = SingleActionType<E> | { type: "many"; payload: Partial<E> };

function reducer<E>(state: Partial<E>, action: ActionType<E>) {
    if (action.type === "many") {
        return { ...state, ...action.payload };
    }
    return { ...state, [action.type]: action.payload };
}

export default function useBasicReducer<E>(defaultState: Partial<E> = {}) {
    const [state, dispatch] = useReducer<Reducer<Partial<E>, ActionType<E>>>(reducer, defaultState);

    function dispatchNumber(action: SingleActionType<E>) {
        if (typeof action.payload === "string") {
            const { payload } = action;
            const numberWithDecimal = payload.endsWith(".");
            const numberWithDecimalAndZero = payload.includes(".") && payload.endsWith("0");
            if (payload !== "" && (payload === "0" || (!numberWithDecimal && !numberWithDecimalAndZero))) {
                return dispatch({ ...action, payload: Number(payload) });
            }
        }
        return dispatch(action);
    }

    return [state, dispatch, dispatchNumber] as [typeof state, typeof dispatch, typeof dispatchNumber];
}
