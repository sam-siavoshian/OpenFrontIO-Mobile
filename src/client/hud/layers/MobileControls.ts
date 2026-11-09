import { EventBus } from "@openfront/shared/EventBus";
import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import {
  CenterCameraEvent,
  CloseViewEvent,
  SelectAllWarshipsEvent,
  ZoomEvent,
} from "../../InputHandler";
import { translateText } from "../../Utils";

/** Touch alternatives to camera/fleet hotkeys, including large tablets. */
@customElement("mobile-controls")
export class MobileControls extends LitElement {
  public eventBus: EventBus;
  @state() private active = false;
  private toolPress: { id: number; x: number; y: number } | null = null;
  private draggedTool = false;
  @state() private openPanel: "zoom" | "more" | null = null;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.dismissTools);
    document.addEventListener("pointermove", this.moveToolPress);
    document.addEventListener("pointerup", this.endToolPress);
    document.addEventListener("pointercancel", this.endToolPress);
    this.addEventListener("click", this.guardToolClick, true);
  }

  disconnectedCallback() {
    document.removeEventListener("pointerdown", this.dismissTools);
    document.removeEventListener("pointermove", this.moveToolPress);
    document.removeEventListener("pointerup", this.endToolPress);
    document.removeEventListener("pointercancel", this.endToolPress);
    this.removeEventListener("click", this.guardToolClick, true);
    super.disconnectedCallback();
  }

  // Let the same outside press begin a map drag; no overlay or swallowed tap.
  private dismissTools = (event: Event) => {
    this.toolPress = null;
    if (!event.composedPath().includes(this)) {
      this.openPanel = null;
      return;
    }
    const pointer = event as PointerEvent;
    if (
      !(event.target instanceof Element) ||
      !event.target.closest(".mobile-map-tools")
    )
      return;
    this.draggedTool = false;
    if (pointer.pointerType === "touch" || pointer.pointerType === "pen") {
      this.toolPress = {
        id: pointer.pointerId,
        x: pointer.clientX,
        y: pointer.clientY,
      };
    }
  };

  private moveToolPress = (event: PointerEvent) => {
    const start = this.toolPress;
    if (
      start?.id === event.pointerId &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) >= 10
    ) {
      this.draggedTool = true;
    }
  };

  private endToolPress = (event: PointerEvent) => {
    if (this.toolPress?.id !== event.pointerId) return;
    if (event.type === "pointercancel") this.draggedTool = true;
    this.toolPress = null;
  };

  private guardToolClick = (event: Event) => {
    if (
      !this.draggedTool ||
      !(event.target instanceof Element) ||
      !event.target.closest(".mobile-map-tools")
    )
      return;
    this.draggedTool = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  private toggleTools(panel: "zoom" | "more") {
    this.openPanel = this.openPanel === panel ? null : panel;
  }

  createRenderRoot() {
    return this;
  }

  init() {
    this.openPanel = null;
    this.active = true;
  }

  hide() {
    this.toolPress = null;
    this.draggedTool = false;
    this.openPanel = null;
    this.querySelector("dialog")?.close();
    this.active = false;
  }

  private zoom(delta: number) {
    this.eventBus.emit(
      new ZoomEvent(window.innerWidth / 2, window.innerHeight / 2, delta),
    );
  }

  private showHelp() {
    this.openPanel = null;
    this.eventBus.emit(new CloseViewEvent());
    this.querySelector("dialog")?.showModal();
  }

  render() {
    if (!this.active) return html``;
    const t = (key: string) => translateText(`mobile_controls.${key}`);
    return html`
      <nav
        class="mobile-map-tools"
        aria-label=${t("title")}
        @keydown=${(event: KeyboardEvent) => {
          if (event.key === "Escape" && this.openPanel !== null) {
            const trigger = this.openPanel;
            this.openPanel = null;
            event.stopPropagation();
            this.querySelector<HTMLButtonElement>(
              `[data-tool=${trigger}]`,
            )?.focus();
          } else if (event.key === " " || event.key === "Enter") {
            event.stopPropagation();
          }
        }}
        @keyup=${(event: KeyboardEvent) => {
          if (["Escape", " ", "Enter"].includes(event.key))
            event.stopPropagation();
        }}
      >
        <button
          type="button"
          data-tool="home"
          aria-label=${t("recenter")}
          title=${t("recenter")}
          @click=${() => this.eventBus.emit(new CenterCameraEvent())}
        >
          ⌖
        </button>
        <button
          type="button"
          data-tool="zoom"
          aria-label=${t("zoom_controls")}
          title=${t("zoom_controls")}
          aria-expanded=${this.openPanel === "zoom"}
          aria-controls="mobile-zoom-tools"
          @click=${() => this.toggleTools("zoom")}
        >
          ±
        </button>
        <button
          type="button"
          data-tool="more"
          aria-label=${t("more")}
          title=${t("more")}
          aria-expanded=${this.openPanel === "more"}
          aria-controls="mobile-more-tools"
          @click=${() => this.toggleTools("more")}
        >
          ⋯
        </button>
        <div
          id="mobile-zoom-tools"
          class="mobile-tool-popover mobile-zoom-tools"
          ?hidden=${this.openPanel !== "zoom"}
          role="group"
          aria-label=${t("zoom_controls")}
        >
          <button
            type="button"
            aria-label=${t("zoom_out")}
            @click=${() => this.zoom(150)}
          >
            −
          </button>
          <button
            type="button"
            aria-label=${t("zoom_in")}
            @click=${() => this.zoom(-120)}
          >
            +
          </button>
        </div>
        <div
          id="mobile-more-tools"
          class="mobile-tool-popover mobile-more-tools"
          ?hidden=${this.openPanel !== "more"}
          role="group"
          aria-label=${t("more")}
        >
          <button
            type="button"
            data-tool="fleet"
            @click=${() => {
              this.openPanel = null;
              this.eventBus.emit(new SelectAllWarshipsEvent());
            }}
          >
            <span aria-hidden="true">⚑</span>${t("fleet")}
          </button>
          <button type="button" data-tool="help" @click=${this.showHelp}>
            <span aria-hidden="true">?</span>${t("help")}
          </button>
        </div>
      </nav>
      <dialog
        class="mobile-play-guide"
        aria-labelledby="mobile-guide-title"
        @keydown=${(e: KeyboardEvent) => e.stopPropagation()}
        @keyup=${(e: KeyboardEvent) => e.stopPropagation()}
        @click=${(e: MouseEvent) => {
          if (e.target === e.currentTarget)
            this.querySelector("dialog")?.close();
        }}
      >
        <div class="mobile-guide-content">
          <header>
            <div>
              <p class="mobile-guide-eyebrow">${t("eyebrow")}</p>
              <h2 id="mobile-guide-title">${t("help")}</h2>
            </div>
            <form method="dialog">
              <button aria-label=${t("close")}>×</button>
            </form>
          </header>
          <ol>
            ${["spawn", "move", "attack", "build", "diplomacy", "ships"].map(
              (step, i) =>
                html`<li>
                  <span class="mobile-guide-number">${i + 1}</span>
                  <div>
                    <h3>${t(`${step}_title`)}</h3>
                    <p>${t(step)}</p>
                  </div>
                </li>`,
            )}
          </ol>
          <form method="dialog">
            <button class="mobile-guide-play">${t("play")}</button>
          </form>
        </div>
      </dialog>
    `;
  }
}
