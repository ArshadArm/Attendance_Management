import { useState, useEffect } from "react";

export default function useSync({ pollInterval = 5000, apiBase = "" }) {
  const [status, setStatus] = useState(null); // null = syncing, true = success, false = error

  useEffect(() => {
    let interval;

    async function sync() {
      try {
        const res = await fetch(`${apiBase}/sync`);
        if (res.ok) {
          setStatus(true);
        } else {
          setStatus(false);
        }
      } catch (err) {
        setStatus(false);
      }
    }

    sync();
    interval = setInterval(sync, pollInterval);

    return () => clearInterval(interval);
  }, [pollInterval, apiBase]);

  return status;
}