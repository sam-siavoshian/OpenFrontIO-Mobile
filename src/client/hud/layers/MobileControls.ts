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

  createRenderRoot() {
    return this;
  }

  init() {
    this.active = true;
  }

  hide() {
    this.querySelector("dialog")?.close();
    this.active = false;
  }

  private zoom(delta: number) {
    this.eventBus.emit(
      new ZoomEvent(window.innerWidth / 2, window.innerHeight / 2, delta),
    );
  }

  private showHelp() {
    this.eventBus.emit(new CloseViewEvent());
    this.querySelector("dialog")?.showModal();
  }

  render() {
    if (!this.active) return html``;
    const t = (key: string) => translateText(`mobile_controls.${key}`);
    return html`
      <nav class="mobile-map-tools" aria-label=${t("title")}>
        <button
          type="button"
          aria-label=${t("zoom_in")}
          title=${t("zoom_in")}
          @click=${() => this.zoom(-120)}
        >
          +
        </button>
        <button
          type="button"
          aria-label=${t("zoom_out")}
          title=${t("zoom_out")}
          @click=${() => this.zoom(150)}
        >
          −
        </button>
        <button
          type="button"
          aria-label=${t("recenter")}
          title=${t("recenter")}
          @click=${() => this.eventBus.emit(new CenterCameraEvent())}
        >
          ⌖
        </button>
        <button
          type="button"
          aria-label=${t("fleet")}
          title=${t("fleet")}
          @click=${() => this.eventBus.emit(new SelectAllWarshipsEvent())}
        >
          ⚑
        </button>
        <button
          type="button"
          aria-label=${t("help")}
          title=${t("help")}
          @click=${this.showHelp}
        >
          ?
        </button>
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
