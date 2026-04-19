import { useEffect, useState } from "react";

function currentRoute(): string {
  const hash = window.location.hash || "#/";
  return hash.startsWith("#") ? hash.slice(1) : hash;
}

export function useHashRoute(): string {
  const [route, setRoute] = useState<string>(() => currentRoute());

  useEffect(() => {
    const onChange = () => setRoute(currentRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return route;
}

export function navigate(path: string): void {
  window.location.hash = path;
}
