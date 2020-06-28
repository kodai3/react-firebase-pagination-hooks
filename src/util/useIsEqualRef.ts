// ommited useComparatorRef
// https://github.com/CSFrequency/react-firebase-hooks/blob/master/util/refHooks.ts
import * as React from "react";

const { useEffect, useRef } = React;

type RefHook<T> = {
  current: T;
};

interface HasIsEqual<T> {
  isEqual: (value: T) => boolean;
}

const isEqual = <T extends HasIsEqual<T>>(
  v1: T | null | undefined,
  v2: T | null | undefined
): boolean => {
  const bothNull: boolean = !v1 && !v2;
  const equal: boolean = !!v1 && !!v2 && v1.isEqual(v2);
  return bothNull || equal;
};

const useIsEqualRef = <T extends HasIsEqual<T>>(
  value: T | null | undefined,
  onChange?: () => void
): RefHook<T | null | undefined> => {
  const ref = useRef(value);
  useEffect(() => {
    if (!isEqual<T>(value, ref.current)) {
      ref.current = value;
      if (onChange) {
        onChange();
      }
    }
  });
  return ref;
};

export default useIsEqualRef;
