import { firestore } from "firebase";
import * as React from "react";
import { snapshotToData } from "./helper";
import useIsEqualRef from "./util/useIsEqualRef";
import usePagenationValue, { PagenationHook } from "./util/usePagenationValue";

const { useEffect, useMemo } = React;

const DEFAULT_LIMIT = 20;

export const usePagenation = (
  query?: firestore.Query | null,
  options?: {
    snapshotListenOptions?: firestore.SnapshotListenOptions;
    limit?: number;
  }
): PagenationHook<firestore.DocumentSnapshot> => {
  const {
    loaded,
    loadingMore,
    limit,
    error,
    setError,
    setValue,
    reest,
    value,
    after,
    loadMore,
    hasMore,
  } = usePagenationValue();

  const ref = useIsEqualRef(query, reest);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const stepLimit = options?.limit || DEFAULT_LIMIT;
    const queryLimited = ref.current.limit(limit || stepLimit);

    const snapshotOption = options?.snapshotListenOptions;
    const listener = snapshotOption
      ? queryLimited.onSnapshot(snapshotOption, setValue(stepLimit), setError)
      : queryLimited.onSnapshot(setValue(stepLimit), setError);

    return () => listener();
  }, [ref.current, after]);

  return [
    value,
    {
      loaded,
      loadingMore,
      hasMore,
      loadMore,
    },
    error,
  ];
};

export const usePagenationData = <T>(
  query?: firestore.Query | null,
  options?: {
    idField?: string;
    limit?: number;
    snapshotListenOptions?: firestore.SnapshotListenOptions;
  }
): PagenationHook<T> => {
  const idField = options ? options.idField : undefined;

  const [snapshot, fields, error] = usePagenation(query, {
    snapshotListenOptions: options?.snapshotListenOptions,
    limit: options?.limit,
  });
  const values = useMemo(
    () =>
      (snapshot
        ? snapshot.map((doc) => snapshotToData(doc, idField))
        : undefined) as T[],
    [snapshot, idField]
  );
  return [values, fields, error];
};
