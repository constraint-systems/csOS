import React, { useEffect, useRef, useState } from "react";
import Application from "./Application";

const OS = () => {
  const [appList, setAppList] = useState<any[]>([]);
  const [activeApps, setActiveApps] = useState<Set<string>>(
    new Set(["https://type.constraint.systems"])
  );
  const [focused, setFocused] = useState<string | null>(null);
  const [showApps, setShowApps] = useState(false);

  useEffect(() => {
    fetch("https://constraint.systems/tools.json")
      .then((res) => res.json())
      .then((data) => {
        setAppList(data.tools);
      });
  }, []);

  const handleCanvasPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    setFocused(null);
  };

  const removeApp = (name: string) => {
    setActiveApps((activeApps) => {
      const newActiveApps = new Set(activeApps);
      newActiveApps.delete(name);
      return newActiveApps;
    });
  };

  return (
    // @ts-ignore
    <div onPointerDown={handleCanvasPointerDown} style={{ height: "100vh" }}>
      <div
        style={{
          color: "black",
          padding: "4px 1ch",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div onClick={() => setShowApps(!showApps)}>Apps</div>
        <div>CSOS{focused ? ": " + focused : ""}</div>
      </div>
      <div>
        {appList.length > 0
          ? Array.from(activeApps).map((src) => {
              const info = appList.find((app) => app.url === src);
              return (
                <Application
                  key={src}
                  name={info.title}
                  src={src}
                  focused={info.title === focused}
                  setFocused={setFocused}
                  removeApp={removeApp}
                />
              );
            })
          : null}
      </div>
      <div
        style={{
          position: "absolute",
          height: "calc(100% - 0px)",
          overflow: "auto",
          zIndex: 9,
          pointerEvents: "auto",
          maxWidth: 360,
          left: 0,
          top: 0,
          border: "solid 2px black",
        }}
      >
        {appList.map((app) => (
          <div
            key={app.title}
            style={{
              padding: "2ch",
              display: showApps ? "block" : "none",
              maxWidth: 380,
              borderBottom: "solid 1px black",
              cursor: "pointer",
              pointerEvents: "auto",
              background: activeApps.has(app.url)
                ? "rgba(200,200,200,0.9)"
                : "rgba(255,255,255,0.9)",
            }}
            onClick={() => {
              const newApps = new Set(activeApps);
              newApps.add(app.url);
              setActiveApps(newApps);
              setFocused(app.title);
            }}
          >
            <div>
              <strong>{app.title}</strong>
            </div>
            <div>{app.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OS;
