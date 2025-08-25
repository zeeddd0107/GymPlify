import { useState, useCallback } from "react";

export const useButton = (initialLoading = false) => {
  const [loading, setLoading] = useState(initialLoading);
  const [disabled, setDisabled] = useState(false);

  const withLoading = useCallback(async (fn) => {
    try {
      setLoading(true);
      setDisabled(true);
      await fn();
    } finally {
      setLoading(false);
      setDisabled(false);
    }
  }, []);

  return { loading, disabled, setLoading, setDisabled, withLoading };
};
