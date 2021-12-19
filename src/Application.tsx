import React, { useEffect, useRef, useState } from "react";
import { useWindowSize, usePointerDrag } from "./Utils";

type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  name: string;
};

const Application = ({
  name,
  src,
  focused,
  focusedName,
  setFocused,
  removeApp,
}: {
  name: string;
  src: string;
  focused: boolean;
  focusedName: string | null;
  setFocused: any;
  removeApp: any;
}) => {
  const startWidth = Math.min(840, window.innerWidth - 32);
  const startHeight = Math.min(
    Math.floor(startWidth / 1.33333),
    window.innerHeight - 24
  );

  const startLeft = window.innerWidth / 2 - startWidth / 2;
  const startTop = window.innerHeight / 2 - startHeight / 2;

  const getApplicationPositions = () => {
    const boxes: Box[] = [];
    const $applications = document.querySelectorAll(".application");
    $applications.forEach(($app) => {
      const $name = $app.getAttribute("data-name");
      if ($name !== name) {
        const box = $app.getBoundingClientRect();
        boxes.push({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          // @ts-ignore
          zIndex: $app.style.zIndex,
          name: $name ?? "",
        });
      }
    });
    return boxes;
  };

  const offsetLeftTop = (left: number, top: number) => {
    const boxes = getApplicationPositions();
    const corners = boxes.map((box) => [box.x, box.y]);
    let newLeft = left;
    let newTop = top;

    // @ts-ignore
    function tryMove() {
      let moved = false;
      for (const corner of corners) {
        if (corner[0] === newLeft && corner[1] === newTop) {
          newLeft += 16 * 1;
          newTop += 16 * 1;
          moved = true;
        }
      }
      console.log(newLeft, newTop);
      if (moved) {
        return tryMove();
      } else {
        return [newLeft, newTop];
      }
    }

    return tryMove();
  };

  // @ts-ignore
  const [offsetLeft, offsetTop] = offsetLeftTop(startLeft, startTop);

  const [left, setLeft] = useState(offsetLeft);
  const [top, setTop] = useState(offsetTop);
  const [width, setWidth] = useState(startWidth);
  const [height, setHeight] = useState(startHeight);
  const [zIndex, setZIndex] = useState(1);
  const [isMaximized, setIsMaximized] = useState(false);
  const [showSplits, setShowSplits] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const originRef = useRef<[number, number]>([left, top]);
  const resizeRef = useRef<[number, number]>([width, height]);
  const lastPositionRef = useRef<[number, number]>([left, top]);
  const lastSizeoRef = useRef<[number, number]>([width, height]);

  useEffect(() => {
    upZIndex();
  }, []);

  const barHeight = 32;

  const { dragPointerDown, dragPointerMove, dragPointerUp } = usePointerDrag();

  const upZIndex = () => {
    let maxZ = 0;
    document.querySelectorAll(".application").forEach((app: any) => {
      maxZ = Math.max(maxZ, parseInt(app.style.zIndex));
    });
    setZIndex(maxZ + 1);
  };

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
    setIsMaximized(false);
    setFocused(name);
    upZIndex();
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const maximize = () => {
    setIsMaximized(true);
    setFocused(name);
    upZIndex();
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handleContainerPointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    setFocused(name);
    upZIndex();
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handlePointerDown = (e: PointerEvent) => {
    e.stopPropagation();
    originRef.current = [left, top];
    setFocused(name);
    dragPointerDown(e);
    upZIndex();
    setTimeout(() => {
      frameRef.current?.focus();
    }, 0);
  };
  const handlePointerMove = (e: PointerEvent) => {
    e.stopPropagation();
    const dragged = dragPointerMove(e);
    if (dragged[0] !== 0 || dragged[1] !== 0) {
      const left = originRef.current[0] + dragged[0];
      const top = originRef.current[1] + dragged[1];
      setLeft(left);
      setTop(top);
      lastPositionRef.current = [left, top];
    }
  };
  const handlePointerUp = (e: PointerEvent) => {
    e.stopPropagation();
    dragPointerUp(e);
  };
  const handlePointerOver = (e: PointerEvent) => {
    e.stopPropagation();
    if (!focused) {
      const positions = getApplicationPositions();
      // check collisions
      const collisions = positions
        .filter((pos) => {
          return (
            pos.x < left + width &&
            pos.x + pos.width > left &&
            pos.y < top + height &&
            pos.y + pos.height > top
          );
        })
        .map((pos) => pos.zIndex);
      const maxZ = Math.max(...collisions);
      if (maxZ < zIndex) {
        setFocused(name);
        upZIndex();
        setTimeout(() => {
          frameRef.current?.focus();
        }, 0);
      }
    }
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

  useEffect(() => {
    const boundIt = () => {
      const padding = 48;
      if (left > window.innerWidth - padding) {
        console.log("left");
        setLeft(window.innerWidth - padding);
      }
      if (top > window.innerHeight - padding) {
        setTop(window.innerHeight - padding);
      }
      if (left + width < padding) {
        setLeft(padding - width);
      }
      if (top + height < padding) {
        setLeft(padding - height);
      }
    };
    window.addEventListener("resize", boundIt);
    return () => {
      window.removeEventListener("resize", boundIt);
    };
  }, [top, left, width, height, setTop, setLeft, setWidth, setHeight]);

  return (
    <div
      ref={containerRef}
      className="application"
      data-name={name}
      style={{
        position: "absolute",
        top: isMaximized ? 0 : top,
        left: isMaximized ? 0 : left,
        width: isMaximized ? "100%" : "auto",
        height: isMaximized ? "100%" : "auto",
        outline: focused ? "solid 2px #111" : "solid 2px #999",
        background: "white",
        zIndex: zIndex,
      }}
      // @ts-ignore
      onPointerDown={handleContainerPointerDown}
    >
      <div
        style={{
          position: "relative",
          height: barHeight,
          background: focused ? "#222" : "#999",
          color: "white",
          lineHeight: barHeight + "px",
          paddingLeft: "1ch",
          cursor: "move",
          display: "flex",
          justifyContent: "space-between",
          zIndex: 3,
        }}
        // @ts-ignore
        onPointerDown={handlePointerDown}
        // @ts-ignore
        onPointerMove={handlePointerMove}
        // @ts-ignore
        onPointerUp={handlePointerUp}
        // @ts-ignore
        onPointerOver={handlePointerOver}
      >
        <div>{name}</div>
        <div style={{ display: "flex", textAlign: "center" }}>
          <div
            role="button"
            className="hover"
            title="refresh"
            style={{ width: 32, cursor: "pointer" }}
            onPointerDown={(e) => {
              e.stopPropagation();
              refresh();
            }}
          >
            r
          </div>
          <div
            className="show-hover-parent"
            style={{
              position: "relative",
            }}
          >
            <div
              className={`show-hover-parent ${showSplits ? "show-hover" : ""}`}
              style={{
                position: "relative",
              }}
            >
              <div
                role="button"
                className="hover"
                style={{ width: 32, cursor: "pointer" }}
                title="Split"
                onPointerDown={(e) => {
                  setShowSplits(!showSplits);
                }}
              >
                {showSplits ? "◆" : "◇"}
              </div>
              <div
                className="show-hover-child"
                style={{
                  position: "absolute",
                  top: 32,
                  left: -32,
                  background: focused ? "#444" : "#999",
                }}
              >
                <div style={{ display: "flex" }}>
                  <div
                    role="button"
                    className="hover"
                    style={{ width: 48, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMaximized(false);
                      setLeft(0);
                      setTop(barHeight);
                      setWidth(window.innerWidth / 2);
                      setHeight(window.innerHeight - barHeight);
                      setShowSplits(false);
                    }}
                  >
                    ◁
                  </div>
                  <div
                    role="button"
                    className="hover"
                    style={{ width: 48, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMaximized(false);
                      setLeft(window.innerWidth / 2);
                      setTop(barHeight);
                      setWidth(window.innerWidth / 2);
                      setHeight(window.innerHeight - barHeight);
                      setShowSplits(false);
                    }}
                  >
                    ▷
                  </div>
                </div>
                <div style={{ display: "flex" }}>
                  <div
                    role="button"
                    className="hover"
                    style={{ width: 48, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMaximized(false);
                      setLeft(0);
                      setTop(barHeight);
                      setWidth(window.innerWidth);
                      setHeight((window.innerHeight - barHeight) / 2);
                      setShowSplits(false);
                    }}
                  >
                    △
                  </div>
                  <div
                    role="button"
                    className="hover"
                    style={{ width: 48, cursor: "pointer" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMaximized(false);
                      setLeft(0);
                      setTop((window.innerHeight - barHeight) / 2 + barHeight);
                      setWidth(window.innerWidth);
                      setHeight((window.innerHeight - barHeight) / 2);
                      setShowSplits(false);
                    }}
                  >
                    ▽
                  </div>
                </div>
                <div
                  role="button"
                  className="hover"
                  style={{ width: 48 * 2, cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMaximized(false);
                    const startWidth = Math.min(840, window.innerWidth - 32);
                    const startHeight = Math.min(
                      Math.floor(startWidth / 1.33333),
                      window.innerHeight - 24
                    );
                    const startLeft = window.innerWidth / 2 - startWidth / 2;
                    const startTop = window.innerHeight / 2 - startHeight / 2;
                    setLeft(startLeft);
                    setTop(startTop);
                    setWidth(startWidth);
                    setHeight(startHeight);
                  }}
                >
                  □
                </div>
              </div>
            </div>
          </div>
          <div
            role="button"
            className="hover"
            style={{ width: 32, cursor: "pointer" }}
            title="Maximize"
            onPointerDown={(e) => {
              e.stopPropagation();
              if (isMaximized) {
                unMaximize();
              } else {
                maximize();
              }
            }}
          >
            {isMaximized ? "■" : "□"}
          </div>

          <div
            role="button"
            className="hover"
            title="close"
            style={{ width: 32, cursor: "pointer" }}
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
        width={isMaximized ? "100%" : width}
        height={
          isMaximized ? window.innerHeight - barHeight : height - barHeight
        }
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
            zIndex: 2,
          }}
          // @ts-ignore
          onPointerOver={handlePointerOver}
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
