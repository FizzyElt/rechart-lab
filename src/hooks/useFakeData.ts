import { useState, useMemo } from "react";

export const useFakeData = <T>(gen: () => T) => {
  const [reload, setReload] = useState(0);

  const data = useMemo(() => {
    return gen();
  }, [reload]);

  const handleReload = () => setReload((p) => p + 1);

  return { data, handleReload };
};
