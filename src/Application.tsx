import React, { useEffect, useRef, useState } from "react";
import { useWindowSize, usePointerDrag } from "./Utils";

const Application = ({
  name,
  src,
  focused,
  setFocused,
  removeApp,
}: {
  name: string;
  src: string;
  focused: boolean;
  setFocused: any;
  removeApp: any;
}) => {
  const [left, setLeft] = useState(window.innerWidth / 2 - 320);
  const [top, setTop] = useState(window.innerHeight / 2 - 240);
  const [width, setWidth] = useState(640);
  const [height, setHeight] = useState(480);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<[number, number]>([left, top]);
  const resizeRef = useRef<[number, number]>([width, height]);
  const lastPositionRef = useRef<[number, number]>([left, top]);
  const lastSizeoRef = useRef<[number, number]>([width, height]);

  const barHeight = 28;

  const screen = useWindowSize();
  const bounds = { left, top, right: left + width, bottom: top + height };
  const { dragPointerDown, dragPointerMove, dragPointerUp } = usePointerDrag();

  const refresh = () => {
    if (frameRef.current) {
      // @ts-ignore
      frameRef.current.src = src;
      setTimeout(() => {
        frameRef.current?.focus();
      }, 0);
    }
  };
  const unMaximize = () => {
    setLeft(lastPositionRef.current[0]);
    setTop(lastPositionRef.current[1]);
    setWidth(lastSizeoRef.current[0]);
    setHeight(lastSizeoRef.current[1]);
    setFocused(name);
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const maximize = () => {
    const { width, height } = screen;
    setLeft(0);
    setTop(0);
    setWidth(width!);
    setHeight(height!);
    setFocused(name);
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handleContainerPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    setFocused(name);
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    originRef.current = [left, top];
    dragPointerDown(e);
    setFocused(name);
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handlePonterMove = (e: PointerEvent) => {
    e.stopPropagation();
    const dragged = dragPointerMove(e);
    if (dragged[0] !== 0 || dragged[1] !== 0) {
      setLeft(originRef.current[0] + dragged[0]);
      setTop(originRef.current[1] + dragged[1]);
      lastPositionRef.current = [left, top];
    }
  };
  const handlePointerUp = (e: PointerEvent) => {
    e.stopPropagation();
    dragPointerUp(e);
  };

  const handleResizeDown = (e: PointerEvent) => {
    e.stopPropagation();
    resizeRef.current = [width, height];
    lastSizeoRef.current = [width, height];
    dragPointerDown(e);
  };
  const handleResizeMove = (e: PointerEvent) => {
    e.stopPropagation();
    const dragged = dragPointerMove(e);
    if (dragged[0] !== 0 || dragged[1] !== 0) {
      setWidth(resizeRef.current[0] + dragged[0]);
      setHeight(resizeRef.current[1] + dragged[1]);
      lastSizeoRef.current = [width, height];
    }
  };
  const handleResizeUp = (e: PointerEvent) => {
    e.stopPropagation();
    dragPointerUp(e);
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        top,
        left,
        outline: focused ? "solid 4px red" : "solid 2px black",
        background: "white",
        zIndex: focused ? 2 : 1,
      }}
      // @ts-ignore
      onPointerDown={handleContainerPointerDown}
    >
      <div
        style={{
          height: barHeight,
          background: "black",
          color: "white",
          lineHeight: barHeight + "px",
          paddingLeft: "1ch",
          borderBottom: "solid 1px #888",
          cursor: "move",
          display: "flex",
          justifyContent: "space-between",
        }}
        // @ts-ignore
        onPointerDown={handlePointerDown}
        // @ts-ignore
        onPointerMove={handlePonterMove}
        // @ts-ignore
        onPointerUp={handlePointerUp}
      >
        <div>{name}</div>
        <div style={{ display: "flex", textAlign: "center" }}>
          <div
            role="button"
            style={{ width: 28, cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              refresh();
            }}
          >
            r
          </div>
          <div
            role="button"
            style={{ width: 28, cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              unMaximize();
            }}
          >
            m
          </div>
          <div
            role="button"
            style={{ width: 28, cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              maximize();
            }}
          >
            M
          </div>
          <div
            role="button"
            style={{ width: 28, cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              removeApp(src);
            }}
          >
            X
          </div>
        </div>
      </div>
      <iframe
        title={name}
        ref={frameRef}
        style={{ display: "block", border: "none" }}
        src={src}
        width={width}
        height={height - barHeight}
      />
      {!focused ? (
        <div
          style={{
            position: "absolute",
            top: barHeight,
            left: 0,
            width: width,
            height: height - barHeight,
            cursor: "pointer",
          }}
        ></div>
      ) : null}

      <div
        style={{
          position: "absolute",
          bottom: -32,
          right: -32,
          width: 36,
          height: 36,
          cursor: "nw-resize",
        }}
        // @ts-ignore
        onPointerDown={handleResizeDown}
        // @ts-ignore
        onPointerMove={handleResizeMove}
        // @ts-ignore
        onPointerUp={handleResizeUp}
      ></div>
    </div>
  );
};

export default Application;
