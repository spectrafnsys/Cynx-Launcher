import ReactDOM from "react-dom/client";
import App from "./app/core/app";
import { BrowserRouter } from "react-router-dom";
import "./styles/App.css";
import ConnectionStatusProvider from "./app/components/core/ConnectionStatus";
import RuntimeInitializer from "./app/components/core/RuntimeInitializer";
import * as Sentry from "@sentry/react";
import { ErrorBoundary } from "@sentry/react";

Sentry.init({
  dsn: "https://beb1df1de61d4d4a94e522faa54cfec8@o4509589483290624.ingest.us.sentry.io/4509589495939072",
  sendDefaultPii: true,
});

const originalConsoleError = console.error;

console.error = (...args) => {
  originalConsoleError(...args);

  const firstArg = args[0];

  if (firstArg instanceof Error) {
    Sentry.captureException(firstArg);
  } else {
    Sentry.captureMessage(
      typeof firstArg === "string" ? firstArg : JSON.stringify(firstArg)
    );
  }
};

window.addEventListener("unhandledrejection", (event) => {
  if (event.reason instanceof Error) {
    Sentry.captureException(event.reason);
  } else {
    Sentry.captureMessage(
      typeof event.reason === "string"
        ? event.reason
        : JSON.stringify(event.reason)
    );
  }
});

window.addEventListener("error", (event) => {
  if (event.error) {
    Sentry.captureException(event.error);
  } else {
    Sentry.captureMessage(event.message);
  }
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <ErrorBoundary>
    <BrowserRouter>
      <ConnectionStatusProvider>
        <RuntimeInitializer />
        <App />
      </ConnectionStatusProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
