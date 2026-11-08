import { EventBus } from "@openfront/shared/EventBus";
import { MobileControls } from "../../src/client/hud/layers/MobileControls";
import {
  CenterCameraEvent,
  SelectAllWarshipsEvent,
  ZoomEvent,
} from "../../src/client/InputHandler";

describe("touch alternatives to game hotkeys", () => {
  let controls: MobileControls;
  let bus: EventBus;
  beforeEach(async () => {
    controls = new MobileControls();
    bus = new EventBus();
    controls.eventBus = bus;
    document.body.append(controls);
    controls.init();
    await controls.updateComplete;
  });
  afterEach(() => controls.remove());

  it("routes zoom, recenter and fleet buttons through the existing game events", () => {
    const events: unknown[] = [];
    bus.on(ZoomEvent, (e) => events.push(e));
    bus.on(CenterCameraEvent, (e) => events.push(e));
    bus.on(SelectAllWarshipsEvent, (e) => events.push(e));
    const buttons = controls.querySelectorAll<HTMLButtonElement>("nav button");
    for (let i = 0; i < 4; i++) buttons[i].click();
    expect(events[0]).toMatchObject({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      delta: -120,
    });
    expect(events[1]).toMatchObject({ delta: 150 });
    expect(events[2]).toBeInstanceOf(CenterCameraEvent);
    expect(events[3]).toBeInstanceOf(SelectAllWarshipsEvent);
  });

  it("clears its UI when leaving a match", async () => {
    const dialog = controls.querySelector("dialog")!;
    dialog.close = vi.fn();
    controls.hide();
    await controls.updateComplete;
    expect(dialog.close).toHaveBeenCalledOnce();
    expect(controls.querySelector("nav")).toBeNull();
  });
});
