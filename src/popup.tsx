import { usePopupViewModel } from "./viewmodels/usePopupViewModel"

function Popup() {
  const vm = usePopupViewModel()

  return (
    <main className="app">
      <section className="header">
        <h1>{vm.text.appName}</h1>
        <p>{vm.text.subtitle}</p>
      </section>

      <section className="searchSection">
        <input
          value={vm.inputValue}
          onChange={vm.handleInputChange}
          onKeyDown={vm.handleKeyDown}
          placeholder={vm.text.placeholder}
          spellCheck={false}
        />

        <div className="buttonColumn">
          <button type="button" className="primaryButton" onClick={vm.handleSearch}>
            {vm.text.searchButton}
          </button>

          <button type="button" className="youtubeLinkButton" onClick={vm.handleOpenYouTube}>
            {vm.text.openYouTubeButton}
          </button>
        </div>
      </section>

      <section className="infoCard">
        <p className={vm.isError ? "message error" : "message"}>{vm.message}</p>
      </section>

      <section className="footerRow">
        <div className="shortcutInfo">
          <span className="shortcutLabel">{vm.text.shortcutLabel}</span>
          <span className="shortcutText">{vm.text.shortcutKey}</span>
        </div>

        <button
          type="button"
          className={vm.isShortcutEnabled ? "toggleButton on" : "toggleButton off"}
          onClick={vm.handleToggleShortcut}
          aria-label={vm.text.shortcutToggleLabel}
        >
          <span className="toggleThumb" />
        </button>
      </section>

      <style>
        {`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #0b1020;
            color: #f8fafc;
            font-family:
              Inter,
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .app {
            width: 400px;
            min-height: 285px;
            padding: 18px 16px 16px;
            background:
              radial-gradient(circle at top left, rgba(255, 0, 80, 0.16), transparent 30%),
              linear-gradient(180deg, #141a2b 0%, #0a1020 100%);
          }

          .header {
            margin-bottom: 14px;
          }

          .header h1 {
            margin: 0;
            font-size: 21px;
            font-weight: 800;
            letter-spacing: -0.4px;
          }

          .header p {
            margin: 5px 0 0;
            color: #9ca3af;
            font-size: 12px;
            line-height: 1.4;
          }

          .searchSection {
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 18px;
            background: rgba(255, 255, 255, 0.05);
            box-shadow: 0 10px 28px rgba(0, 0, 0, 0.2);
          }

          .searchSection input {
            width: 100%;
            height: 42px;
            padding: 0 14px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 13px;
            outline: none;
            background: rgba(0, 0, 0, 0.25);
            color: #ffffff;
            font-size: 14px;
          }

          .searchSection input::placeholder {
            color: #6b7280;
          }

          .searchSection input:focus {
            border-color: rgba(239, 68, 68, 0.75);
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.14);
          }

          .buttonColumn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            margin-top: 12px;
          }

          .primaryButton {
            width: 180px;
            height: 38px;
            padding: 0 18px;
            border: none;
            border-radius: 12px;
            background: #ef4444;
            color: #ffffff;
            font-size: 14px;
            font-weight: 800;
            cursor: pointer;
            transition:
              transform 0.15s ease,
              opacity 0.15s ease,
              background 0.15s ease;
          }

          .primaryButton:hover {
            background: #dc2626;
            transform: translateY(-1px);
          }

          .primaryButton:active {
            transform: translateY(0);
            opacity: 0.9;
          }

          .youtubeLinkButton {
            height: 22px;
            padding: 0 4px;
            border: none;
            background: transparent;
            color: #9ca3af;
            font-size: 12px;
            font-weight: 600;
            text-decoration: underline;
            text-underline-offset: 3px;
            cursor: pointer;
            transition:
              color 0.15s ease,
              opacity 0.15s ease;
          }

          .youtubeLinkButton:hover {
            color: #d1d5db;
          }

          .youtubeLinkButton:active {
            opacity: 0.75;
          }

          .infoCard {
            margin-top: 12px;
            padding: 10px 12px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            background: rgba(7, 10, 20, 0.45);
          }

          .message {
            margin: 0;
            color: #cbd5e1;
            font-size: 12px;
            line-height: 1.5;
          }

          .message.error {
            color: #fca5a5;
          }

          .footerRow {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 12px;
            padding: 0 2px;
          }

          .shortcutInfo {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .shortcutLabel {
            color: #94a3b8;
            font-size: 12px;
          }

          .shortcutText {
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
          }

          .toggleButton {
            position: relative;
            width: 44px;
            height: 24px;
            border: none;
            border-radius: 999px;
            cursor: pointer;
            transition: background 0.15s ease;
            padding: 0;
          }

          .toggleButton.on {
            background: #22c55e;
          }

          .toggleButton.off {
            background: #475569;
          }

          .toggleThumb {
            position: absolute;
            top: 3px;
            left: 3px;
            width: 18px;
            height: 18px;
            border-radius: 999px;
            background: #ffffff;
            transition: transform 0.15s ease;
          }

          .toggleButton.on .toggleThumb {
            transform: translateX(20px);
          }
        `}
      </style>
    </main>
  )
}

export default Popup