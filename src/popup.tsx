import { usePopupViewModel } from "./viewmodels/usePopupViewModel"
import type { PlayerMode } from "./types/playerMode"

export default function Popup() {
  const vm = usePopupViewModel()
  const choices: { mode: PlayerMode; label: string }[] = [
    { mode: "pip", label: vm.text.pipModeLabel },
    { mode: "radio", label: vm.text.radioModeLabel },
    { mode: "window", label: vm.text.windowModeLabel }
  ]
  const hint = vm.mode === "pip" ? vm.text.pipHint : vm.mode === "radio" ? vm.text.radioHint : vm.text.windowHint

  return (
    <main className="popup-root">
      <header>
        <h1>{vm.text.appName}</h1>
        <p>{vm.text.subtitle}</p>
      </header>
      <section className="panel">
        <div className="label">{vm.text.modeLabel}</div>
        <div className="modes">
          {choices.map((choice) => (
            <button
              type="button"
              key={choice.mode}
              className={vm.mode === choice.mode ? "selected" : ""}
              aria-pressed={vm.mode === choice.mode}
              onClick={() => void vm.handleModeChange(choice.mode)}
            >
              {choice.label}
            </button>
          ))}
        </div>
        <p className="hint">{hint}</p>
      </section>
      {vm.mode !== "window" && (
        <button className="focus-button" onClick={vm.handleGoToVideo} disabled={vm.isBusy}>
          {vm.text.focusButton}
        </button>
      )}
      <section className="panel">
        <input
          aria-label={vm.text.placeholder}
          placeholder={vm.text.placeholder}
          value={vm.inputValue}
          onChange={vm.handleInputChange}
          onKeyDown={vm.handleKeyDown}
          autoFocus
        />
        <div className="actions">
          <button className="primary" onClick={vm.handleSearch} disabled={vm.isBusy}>{vm.text.searchButton}</button>
          <button onClick={vm.handleOpenYouTube} disabled={vm.isBusy}>{vm.text.openYouTubeButton}</button>
        </div>
      </section>
      <p className={vm.isError ? "message error" : "message"} role="status">{vm.message}</p>
      <footer>
        <span>{vm.text.shortcutLabel} <strong>{vm.text.shortcutKey}</strong></span>
        <button className={vm.isShortcutEnabled ? "switch on" : "switch"}
          role="switch" aria-checked={vm.isShortcutEnabled}
          aria-label={vm.text.shortcutToggleLabel} onClick={vm.handleToggleShortcut}>
          <span />
        </button>
      </footer>
      <style>{`
        :root {color-scheme:dark}
        * {box-sizing:border-box}
        body {padding:0;margin:0;background:#111827;color:#f9fafb;font-family:system-ui,sans-serif}
        button,input {font:inherit}
        button {cursor:pointer}
        button:disabled {opacity:.6;cursor:wait}
        .popup-root {width:345px;padding:15px}
        header h1 {font-size:19px;margin:0;font-weight:700}
        header p {margin:5px 0 14px;color:#9ca3af;font-size:12px}
        .panel {border:1px solid #334155;background:#182235;border-radius:14px;padding:11px;margin-bottom:10px}
        .label {font-size:12px;color:#94a3b8;margin-bottom:9px}
        .modes {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
        .modes button {min-height:38px;background:#243044;color:#f1f5f9;border:1px solid #475569;border-radius:9px;font-weight:600;font-size:12px}
        .modes button.selected {border-color:#ef4444;background:#ef4444;color:white}
        .hint {font-size:12px;color:#cbd5e1;line-height:1.6;margin:10px 0 1px}
        .focus-button {display:block;width:100%;padding:12px;background:#166534;color:white;border:1px solid #22c55e;border-radius:10px;font-size:13px;font-weight:700;margin-bottom:10px}
        input {width:100%;height:44px;background:#0f172a;color:white;border:1px solid #64748b;border-radius:10px;padding:0 11px;outline:none}
        input:focus {border-color:#60a5fa;box-shadow:0 0 0 2px #60a5fa33}
        .actions {display:grid;grid-template-columns:1.65fr 1fr;gap:8px;margin-top:9px}
        .actions button {height:39px;color:#f9fafb;background:#273449;border:1px solid #475569;border-radius:10px;font-size:12px;font-weight:700}
        .actions button.primary {background:#ef4444;border-color:#ef4444}
        .message {min-height:32px;margin:11px 2px;color:#cbd5e1;font-size:12px;line-height:1.45}
        .message.error {color:#fca5a5}
        footer {display:flex;justify-content:space-between;align-items:center;border-top:1px solid #334155;padding-top:12px;color:#cbd5e1;font-size:12px}
        footer strong {color:#fff}
        .switch {background:#475569;border:0;border-radius:30px;width:44px;height:26px;padding:3px;display:flex;justify-content:flex-start;align-items:center}
        .switch.on {background:#22c55e;justify-content:flex-end}
        .switch span {height:20px;width:20px;border-radius:50%;background:white}
      `}</style>
    </main>
  )
}
