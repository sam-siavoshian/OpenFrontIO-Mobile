import { EventBus } from "@openfront/shared/EventBus";
import {
  DragEvent,
  InputHandler,
  TouchEvent,
  TouchGhostPlacementEvent,
  ZOOM_DELTA_DIVISOR,
  ZoomEvent,
} from "../../src/client/InputHandler";
import type { UIState } from "../../src/client/UIState";
import type { GameView } from "../../src/client/view";

function pointer(
  target: EventTarget,
  type: string,
  id: number,
  x: number,
  y: number,
) {
  const e = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(e, {
    pointerId: id,
    pointerType: "touch",
    button: 0,
    clientX: x,
    clientY: y,
    x,
    y,
  });
  target.dispatchEvent(e);
}

describe("mobile map gestures", () => {
  let canvas: HTMLElement;
  let handler: InputHandler;
  let bus: EventBus;
  let zooms: ZoomEvent[];
  let drags: DragEvent[];
  let taps: TouchEvent[];
  beforeEach(() => {
    canvas = document.createElement("div");
    document.body.append(canvas);
    bus = new EventBus();
    zooms = [];
    drags = [];
    taps = [];
    bus.on(ZoomEvent, (e) => zooms.push(e));
    bus.on(DragEvent, (e) => drags.push(e));
    bus.on(TouchEvent, (e) => taps.push(e));
    handler = new InputHandler(
      { inSpawnPhase: () => false } as GameView,
      { ghostStructure: null } as UIState,
      canvas,
      bus,
    );
    handler.initialize();
  });
  afterEach(() => {
    handler.destroy();
    canvas.remove();
  });

  it("scales the map proportionally to finger separation", () => {
    pointer(canvas, "pointerdown", 1, 100, 100);
    pointer(canvas, "pointerdown", 2, 200, 100);
    pointer(window, "pointermove", 2, 250, 100);
    expect(zooms).toHaveLength(1);
    expect(1 + zooms[0].delta / ZOOM_DELTA_DIVISOR).toBeCloseTo(100 / 150);
    expect(drags[0].deltaX).toBe(25);
  });

  it.each([1, 2])(
    "keeps panning when finger %s lifts, without an attack on release",
    (lifted) => {
      pointer(canvas, "pointerdown", 1, 100, 100);
      pointer(canvas, "pointerdown", 2, 200, 100);
      pointer(window, "pointerup", lifted, lifted === 1 ? 100 : 200, 100);
      const remaining = lifted === 1 ? 2 : 1;
      const x = remaining === 1 ? 100 : 200;
      pointer(window, "pointermove", remaining, x + 30, 110);
      expect(drags[drags.length - 1]).toMatchObject({ deltaX: 30, deltaY: 10 });
      pointer(window, "pointerup", remaining, x + 30, 110);
      expect(taps).toHaveLength(0);
      pointer(canvas, "pointerdown", 3, 50, 50);
      pointer(window, "pointerup", 3, 50, 50);
      expect(taps).toHaveLength(1);
    },
  );

  it("never confirms a build when a pinch ends without moving", () => {
    handler.uiState.ghostStructure = "City" as UIState["ghostStructure"];
    const builds: TouchGhostPlacementEvent[] = [];
    bus.on(TouchGhostPlacementEvent, (e) => builds.push(e));
    pointer(canvas, "pointerdown", 1, 100, 100);
    pointer(canvas, "pointerdown", 2, 200, 100);
    pointer(window, "pointerup", 2, 200, 100);
    pointer(window, "pointerup", 1, 100, 100);
    expect(builds).toHaveLength(0);
  });

  it("cancels without turning a system-interrupted gesture into a tap", () => {
    pointer(canvas, "pointerdown", 1, 100, 100);
    pointer(window, "pointercancel", 1, 100, 100);
    expect(taps).toHaveLength(0);
    pointer(canvas, "pointerdown", 2, 100, 100);
    pointer(window, "pointerup", 2, 100, 100);
    expect(taps).toHaveLength(1);
  });
});
