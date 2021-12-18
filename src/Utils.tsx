import React, { useEffect, useRef, useState } from "react";

export const usePointerDrag = () => {
  const downRef = useRef<[number, number]>([0, 0]);
  const isDraggingRef = useRef<boolean>(false);

  const dragPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    downRef.current = [e.clientX, e.clientY];
    // @ts-ignore
    e.target?.setPointerCapture(e.pointerId);
  };
  const dragPointerMove = (e: PointerEvent) => {
    if (isDraggingRef.current) {
      const down = downRef.current;
      const bounded = {
        x: Math.max(0, Math.min(e.clientX, window.innerWidth)),
        y: Math.max(0, Math.min(e.clientY, window.innerHeight)),
      };
      const dragged = [bounded.x - down[0], bounded.y - down[1]];
      return dragged;
    } else {
      return [0, 0];
    }
  };
  const dragPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    isDraggingRef.current = false;
    // @ts-ignore
    e.target?.releasePointerCapture(e.pointerId);
  };

  return { dragPointerDown, dragPointerMove, dragPointerUp };
};

export const useWindowSize = () => {
  const isClient = typeof window === "object";
  function getSize() {
    return {
      width: isClient ? window.innerWidth : undefined,
      height: isClient ? window.innerHeight : undefined,
    };
  }
  const [windowSize, setWindowSize] = useState(getSize);

  // @ts-ignore
  useEffect(() => {
    if (!isClient) {
      return false;
    }

    function handleResize() {
      setWindowSize(getSize());
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return windowSize;
};
