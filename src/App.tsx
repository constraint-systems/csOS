import React, { useEffect, useRef, useCallback, useState } from "react";
import Application from "./Application";

const OS = () => {
  const [appList, setAppList] = useState<any[]>([]);
  const [activeApps, setActiveApps] = useState<Set<string>>(new Set());
  const [focused, setFocused] = useState<string | null>(null);
  const [showApps, setShowApps] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const addApp = useCallback(
    (appUrl: string) => {
      setActiveApps((prev) => new Set(prev).add(appUrl));
    },
    [setActiveApps]
  );

  useEffect(() => {
    fetch("https://constraint.systems/tools.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.tools.filter(
          (app: any) => app.url !== "https://csOS.constraint.systems"
        );
        setAppList(filtered);

        const toAdd = filtered.slice(0, 1).reverse();
        for (let i = 0; i < toAdd.length; i++) {
          const app = toAdd[i];
          setTimeout(() => {
            addApp(app.url);
            if (i === toAdd.length - 1) {
              setFocused(app.title);
            }
          }, i * 400 + 400);
        }
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
          position: "relative",
          color: "#fff",
          background: "#222",
          padding: "0 1ch",
          height: 32,
          lineHeight: "32px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div
          className="hover"
          style={{
            cursor: "pointer",
            height: 32,
            padding: "0 1ch",
            position: "absolute",
            left: 0,
            top: 0,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowApps(!showApps);
          }}
        >
          Apps
        </div>
        <div
          className="hover"
          style={{
            position: "absolute",
            cursor: "pointer",
            right: 0,
            top: 0,
            padding: "0 1ch",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowAbout(!showAbout);
          }}
        >
          About
        </div>
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
                  focusedName={focused}
                  setFocused={setFocused}
                  removeApp={removeApp}
                />
              );
            })
          : null}
      </div>
      {showApps ? (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
            pointerEvents: "auto",
            maxWidth: 16 * 22,
            left: 16,
            top: 48,
            outline: "solid 2px black",
            height: "calc(100% - 64px)",
            width: "100%",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "#222",
              color: "#eee",
              height: 32,
              lineHeight: "32px",
              padding: "0 1ch",
              justifyContent: "space-between",
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              zIndex: 9,
            }}
          >
            <div>Apps</div>
            <div
              className="hover"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 32,
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => setShowApps(false)}
            >
              X
            </div>
          </div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 32,
              width: "100%",
              height: "calc(100% - 32px)",
              overflowY: "auto",
            }}
          >
            {appList.map((app, i) => (
              <div
                key={app.title}
                style={{
                  padding: "16px 16px",
                  display: showApps ? "block" : "none",
                  maxWidth: 380,
                  width: "100%",
                  cursor: "pointer",
                  pointerEvents: "auto",
                  borderBottom:
                    i === appList.length - 1 ? "none" : "solid 1px black",
                  background: activeApps.has(app.url)
                    ? "rgba(210,210,210,0.9)"
                    : "rgba(255,255,255,0.9)",
                }}
                onClick={() => {
                  const newApps = new Set(activeApps);
                  newApps.add(app.url);
                  setActiveApps(newApps);
                  setFocused(app.title);
                }}
              >
                <div>{app.title}</div>
                <div style={{ color: "#666" }}>{app.description}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {showAbout ? (
        <div
          style={{
            position: "absolute",
            zIndex: 9999,
            pointerEvents: "auto",
            maxWidth: 16 * 22,
            right: 16,
            top: 48,
            outline: "solid 2px black",
            width: "100%",
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div
            style={{
              background: "#222",
              color: "#eee",
              height: 32,
              lineHeight: "32px",
              padding: "0 1ch",
              justifyContent: "space-between",
              width: "100%",
              zIndex: 9,
            }}
          >
            <div>About</div>
            <div
              className="hover"
              style={{
                position: "absolute",
                right: 0,
                top: 0,
                width: 32,
                textAlign: "center",
                cursor: "pointer",
              }}
              onClick={() => setShowAbout(false)}
            >
              X
            </div>
          </div>
          <div
            style={{
              width: "100%",
              background: "white",
              padding: "16px",
            }}
          >
            <p>
              Constraint Systems is a collection of experimental creative tools
              for manipulating images and text.
            </p>
            <p>
              csOS uses iframes to let you open multiple tools at once. By
              downloading and uploading files between them you can make your own
              creative pipeline.
            </p>
            <p>
              <a
                href="https://constraint.systems"
                target="_blank"
                rel="noreferrer"
              >
                Constraint Systems
              </a>
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default OS;
