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
        :root {
          color-scheme: dark;

          --bg: #111827;
          --text-main: #f9fafb;
          --text-sub: #9ca3af;

          --card-bg: #172033;
          --card-border: #283244;

          --input-bg: #0f172a;
          --input-border: #283244;
          --input-text: #f9fafb;
          --input-placeholder: #6b7280;

          --focus-border: #60a5fa;
          --focus-shadow: rgba(96, 165, 250, 0.18);

          --primary-bg: #ef4444;
          --primary-bg-hover: #f05252;
          --primary-text: #ffffff;

          --secondary-bg: #1f2937;
          --secondary-bg-hover: #273449;
          --secondary-border: #374151;
          --secondary-border-hover: #4b5563;
          --secondary-text: #d1d5db;

          --error-text: #fca5a5;

          --divider: #1f2937;
          --toggle-bg: #4b5563;
          --toggle-active-bg: #22c55e;
          --toggle-knob: #ffffff;
        }

        @media (prefers-color-scheme: light) {
          :root {
            color-scheme: light;

            --bg: #f8fafc;
            --text-main: #111827;
            --text-sub: #6b7280;

            --card-bg: #ffffff;
            --card-border: #e5e7eb;

            --input-bg: #f9fafb;
            --input-border: #d1d5db;
            --input-text: #111827;
            --input-placeholder: #9ca3af;

            --focus-border: #2563eb;
            --focus-shadow: rgba(37, 99, 235, 0.16);

            --primary-bg: #dc2626;
            --primary-bg-hover: #b91c1c;
            --primary-text: #ffffff;

            --secondary-bg: #f3f4f6;
            --secondary-bg-hover: #e5e7eb;
            --secondary-border: #d1d5db;
            --secondary-border-hover: #9ca3af;
            --secondary-text: #374151;

            --error-text: #dc2626;

            --divider: #e5e7eb;
            --toggle-bg: #d1d5db;
            --toggle-active-bg: #16a34a;
            --toggle-knob: #ffffff;
          }
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 320px;
          min-height: 0;
          background: var(--bg);
          color: var(--text-main);
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
          background: var(--bg);
          transition:
            background 140ms ease,
            color 140ms ease;
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
          color: var(--text-main);
        }

        .header p {
          margin: 4px 0 0;
          font-size: 12px;
          line-height: 1.45;
          color: var(--text-sub);
        }

        .search-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 10px;
          border: 1px solid var(--card-border);
          border-radius: 14px;
          background: var(--card-bg);
          transition:
            background 140ms ease,
            border-color 140ms ease;
        }

        .search-input {
          width: 100%;
          height: 38px;
          padding: 0 12px;
          border: 1px solid var(--input-border);
          border-radius: 10px;
          outline: none;
          background: var(--input-bg);
          color: var(--input-text);
          font-size: 13px;
          transition:
            background 140ms ease,
            color 140ms ease,
            border-color 140ms ease,
            box-shadow 140ms ease;
        }

        .search-input::placeholder {
          color: var(--input-placeholder);
        }

        .search-input:focus {
          border-color: var(--focus-border);
          box-shadow: 0 0 0 2px var(--focus-shadow);
        }

        .button-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .primary-button,
        .secondary-button {
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          transition:
            background 120ms ease,
            transform 120ms ease,
            border-color 120ms ease,
            color 120ms ease;
        }

        .primary-button {
          border: 0;
          background: var(--primary-bg);
          color: var(--primary-text);
        }

        .primary-button:hover {
          background: var(--primary-bg-hover);
        }

        .secondary-button {
          border: 1px solid var(--secondary-border);
          background: var(--secondary-bg);
          color: var(--secondary-text);
        }

        .secondary-button:hover {
          background: var(--secondary-bg-hover);
          border-color: var(--secondary-border-hover);
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
          color: var(--text-sub);
        }

        .message.error {
          color: var(--error-text);
        }

        .shortcut-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 8px;
          border-top: 1px solid var(--divider);
        }

        .shortcut-text {
          display: flex;
          align-items: center;
          gap: 7px;
          color: var(--text-sub);
          font-size: 12px;
        }

        .shortcut-text strong {
          color: var(--text-main);
          font-size: 12px;
          font-weight: 700;
        }

        .toggle {
          position: relative;
          width: 38px;
          height: 22px;
          border: 0;
          border-radius: 999px;
          background: var(--toggle-bg);
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
          background: var(--toggle-knob);
          transition: transform 120ms ease;
        }

        .toggle.active {
          background: var(--toggle-active-bg);
        }

        .toggle.active span {
          transform: translateX(16px);
        }
      `}</style>
    </main>
  )
}

export default Popup