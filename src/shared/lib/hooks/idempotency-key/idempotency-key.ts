import { useRef } from "react";

// one key per money attempt: same details reuse it so the server never acts twice; new details get a new key
const useIdempotencyKey = () => {
  const current = useRef<{ signature: string; key: string } | null>(null);

  const keyFor = (payload: unknown) => {
    const signature = JSON.stringify(payload);
    if (current.current?.signature !== signature) current.current = { signature, key: crypto.randomUUID() };
    return current.current.key;
  };
  const reset = () => {
    current.current = null;
  };

  return { keyFor, reset };
};

export default useIdempotencyKey;
