import { EventBus } from "@openfront/shared/EventBus";
import { MobileControls } from "../../src/client/hud/layers/MobileControls";
import {
  CenterCameraEvent,
  SelectAllWarshipsEvent,
  ZoomEvent,
} from "../../src/client/InputHandler";

describe("compact touch tools", () => {
  let controls: MobileControls;
  let bus: EventBus;
  const button = (selector: string) =>
    controls.querySelector<HTMLButtonElement>(selector)!;
  beforeEach(async () => {
    controls = new MobileControls();
    bus = new EventBus();
    controls.eventBus = bus;
    document.body.append(controls);
    controls.init();
    await controls.updateComplete;
  });
  afterEach(() => controls.remove());

  it("routes camera, zoom and fleet commands through existing game events", async () => {
    const events: unknown[] = [];
    bus.on(ZoomEvent, (e) => events.push(e));
    bus.on(CenterCameraEvent, (e) => events.push(e));
    bus.on(SelectAllWarshipsEvent, (e) => events.push(e));
    button('[data-tool="home"]').click();
    button('[data-tool="zoom"]').click();
    await controls.updateComplete;
    expect(
      controls.querySelector("#mobile-zoom-tools")?.hasAttribute("hidden"),
    ).toBe(false);
    button("#mobile-zoom-tools button:last-child").click();
    button("#mobile-zoom-tools button:first-child").click();
    button('[data-tool="more"]').click();
    await controls.updateComplete;
    expect(
      controls.querySelector("#mobile-zoom-tools")?.hasAttribute("hidden"),
    ).toBe(true);
    button('[data-tool="fleet"]').click();
    await controls.updateComplete;
    expect(events[0]).toBeInstanceOf(CenterCameraEvent);
    expect(events[1]).toMatchObject({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      delta: -120,
    });
    expect(events[2]).toMatchObject({ delta: 150 });
    expect(events[3]).toBeInstanceOf(SelectAllWarshipsEvent);
    expect(
      controls.querySelector("#mobile-more-tools")?.hasAttribute("hidden"),
    ).toBe(true);
  });

  it("dismisses tools without consuming the press that starts panning", async () => {
    button('[data-tool="more"]').click();
    await controls.updateComplete;
    const down = new Event("pointerdown", { bubbles: true, cancelable: true });
    document.body.dispatchEvent(down);
    await controls.updateComplete;
    expect(
      controls.querySelector("#mobile-more-tools")?.hasAttribute("hidden"),
    ).toBe(true);
    expect(down.defaultPrevented).toBe(false);
    expect(button('[data-tool="more"]').getAttribute("aria-expanded")).toBe(
      "false",
    );
  });

  it("closes a popover with Escape and returns focus to its trigger", async () => {
    const trigger = button('[data-tool="zoom"]');
    trigger.click();
    await controls.updateComplete;
    button("#mobile-zoom-tools button").dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await controls.updateComplete;
    expect(document.activeElement).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("ignores a tool press that became a drag, even if it returns to its origin", async () => {
    const center = vi.fn();
    bus.on(CenterCameraEvent, center);
    const home = button('[data-tool="home"]');
    const pointer = (target: EventTarget, type: string, x: number) => {
      const event = new Event(type, { bubbles: true });
      Object.assign(event, {
        pointerId: 1,
        pointerType: "touch",
        clientX: x,
        clientY: 100,
      });
      target.dispatchEvent(event);
    };
    pointer(home, "pointerdown", 100);
    pointer(document, "pointermove", 140);
    pointer(document, "pointermove", 100);
    pointer(home, "pointerup", 100);
    home.click();
    expect(center).not.toHaveBeenCalled();
    pointer(home, "pointerdown", 100);
    pointer(home, "pointerup", 100);
    home.click();
    expect(center).toHaveBeenCalledOnce();
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
