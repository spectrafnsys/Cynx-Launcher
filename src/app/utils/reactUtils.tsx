;

import { useCallback } from "react";

export const useSafeSetState = () => {
  const safeSetState = useCallback(
    <T,>(
      setter: (value: T) => void,
      value: T,
      isComponentMountedRef: React.RefObject<boolean>
    ) => {
      if (isComponentMountedRef.current) {
        setter(value);
      }
    },
    []
  );

  return safeSetState;
};

export const Dick = () => {
  return <div>hi</div>;
};
