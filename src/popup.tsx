import { usePopupViewModel } from "./viewmodels/usePopupViewModel"

function Popup() {
  const vm = usePopupViewModel()

  return (
    <main className="popup-root">
      <section className="header">
        <div>
          <h1>{vm.text.appName}</h1>
          <p>{vm.text.subtitle}</p>
        </div>
      </section>

      <section className="search-section">
        <input
          className="search-input"
          type="text"
          value={vm.inputValue}
          onChange={vm.handleInputChange}
          onKeyDown={vm.handleKeyDown}
          placeholder={vm.text.placeholder}
          autoFocus
        />

        <div className="button-row">
          <button className="primary-button" type="button" onClick={vm.handleSearch}>
            {vm.text.searchButton}
          </button>

          <button
            className="secondary-button"
            type="button"
            onClick={vm.handleOpenYouTube}
          >
            {vm.text.openYouTubeButton}
          </button>
        </div>
      </section>

      <p className={vm.isError ? "message error" : "message"}>{vm.message}</p>

      <section className="shortcut-row">
        <div className="shortcut-text">
          <span>{vm.text.shortcutLabel}</span>
          <strong>{vm.text.shortcutKey}</strong>
        </div>

        <button
          className={vm.isShortcutEnabled ? "toggle active" : "toggle"}
          type="button"
          role="switch"
          aria-checked={vm.isShortcutEnabled}
          aria-label={vm.text.shortcutToggleLabel}
          onClick={vm.handleToggleShortcut}
        >
          <span />
        </button>
      </section>

      <style>{`
        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 320px;
          min-height: 0;
          background: #111827;
          color: #e5e7eb;
          font-family:
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        button,
        input {
          font: inherit;
        }

        .popup-root {
          width: 320px;
          padding: 14px;
          background: #111827;
        }

        .header {
          margin-bottom: 12px;
        }

        .header h1 {
          margin: 0;
          font-size: 18px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #f9fafb;
        }

        .header p {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.45;
          color: #9ca3af;
        }

        .search-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          border: 1px solid #283244;
          border-radius: 14px;
          background: #172033;
        }

        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border: 1px solid #283244;
          border-radius: 10px;
          outline: none;
          background: #0f172a;
          color: #f9fafb;
          font-size: 13px;
        }

        .search-input::placeholder {
          color: #6b7280;
        }

        .search-input:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.18);
        }

        .button-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .primary-button,
        .secondary-button {
          height: 36px;
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition:
            background 120ms ease,
            transform 120ms ease,
            border-color 120ms ease;
        }

        .primary-button {
          background: #ef4444;
          color: #ffffff;
        }

        .primary-button:hover {
          background: #f05252;
        }

        .secondary-button {
          border: 1px solid #374151;
          background: #1f2937;
          color: #d1d5db;
        }

        .secondary-button:hover {
          background: #273449;
          border-color: #4b5563;
        }

        .primary-button:active,
        .secondary-button:active {
          transform: translateY(1px);
        }

        .message {
          min-height: 18px;
          margin: 10px 2px 8px;
          font-size: 12px;
          line-height: 1.45;
          color: #9ca3af;
        }

        .message.error {
          color: #fca5a5;
        }

        .shortcut-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid #1f2937;
        }

        .shortcut-text {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #9ca3af;
          font-size: 12px;
        }

        .shortcut-text strong {
          color: #f9fafb;
          font-size: 12px;
          font-weight: 700;
        }

        .toggle {
          position: relative;
          width: 38px;
          height: 22px;
          border: 0;
          border-radius: 999px;
          background: #4b5563;
          cursor: pointer;
          padding: 0;
          transition: background 120ms ease;
        }

        .toggle span {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #ffffff;
          transition: transform 120ms ease;
        }

        .toggle.active {
          background: #22c55e;
        }

        .toggle.active span {
          transform: translateX(16px);
        }
      `}</style>
    </main>
  )
}

export default Popup