import { firestore } from "firebase";
import * as React from "react";
import { addItem, deleteItem, updateItem } from "./operation";

const { useReducer } = React;

type ReducerState = {
  hasMore: boolean;
  value: firestore.QueryDocumentSnapshot[];
  after: firestore.QueryDocumentSnapshot | null;
  lastLoaded: firestore.QueryDocumentSnapshot | null;
  loadingMore: boolean;
  limit: number;
  loaded: boolean;
  error?: Error;
};

export type PaginationValue = ReducerState & {
  loadMore: () => void;
  reest: () => void;
  setError: (error: Error) => void;
  setValue: (limit: number) => (value: firestore.QuerySnapshot) => void;
};

export type PaginationHook<T> = [
  T[],
  {
    loaded: boolean;
    hasMore: boolean;
    loadingMore: boolean;
    loadMore: () => void;
  },
  Error | undefined
];

const initialState: ReducerState = {
  hasMore: false,
  after: null,
  limit: 0,
  value: [],
  lastLoaded: null,
  loaded: false,
  loadingMore: false,
};

type LoadMoreAction = { type: "loadMore" };
type ErrorAction = { type: "error"; error: Error };
type ResetAction = { type: "reset" };
type LoadedAction = {
  type: "loaded";
  value: firestore.QuerySnapshot;
  limit: number;
};
export type ActionType =
  | LoadMoreAction
  | ErrorAction
  | ResetAction
  | LoadedAction;

function reducer(state: ReducerState, action: ActionType): ReducerState {
  switch (action.type) {
    case "loaded": {
      const value = [...state.value];
      let isAdding = false;

      action.value.docChanges().forEach((change) => {
        if (change.type === "added") {
          isAdding = true;
          addItem(change.doc, value);
        } else if (change.type === "modified") {
          updateItem(change.doc, value);
        } else if (change.type === "removed") {
          deleteItem(change.doc, value);
        }
      });

      const nextLimit = value.length + action.limit;

      const end = value.length < action.limit || nextLimit === state.limit;

      return {
        ...state,
        hasMore: isAdding ? !end : state.hasMore,
        limit: nextLimit,
        loaded: true,
        lastLoaded: action.value.docs[action.value.docs.length - 1],
        loadingMore: false,
        value,
      };
    }

    case "error":
      return {
        ...state,
        error: action.error,
        value: [],
      };

    case "reset": {
      return {
        ...initialState,
      };
    }

    case "loadMore": {
      return {
        ...state,
        loadingMore: true,
        after: state.lastLoaded,
      };
    }
  }
}

const usePaginationValue = (): PaginationValue => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadMore = () => {
    dispatch({ type: "loadMore" });
  };

  const setValue = (limit: number) => (value: firestore.QuerySnapshot) => {
    dispatch({ type: "loaded", value, limit });
  };

  const setError = (error: Error) => {
    dispatch({ type: "error", error });
  };

  const reest = () => {
    dispatch({ type: "reset" });
  };

  return {
    ...state,
    reest,
    setValue,
    loadMore,
    setError,
  };
};

export default usePaginationValue;
