
import { Component, type ErrorInfo, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
} from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: "component" | "console" | "thrown";
}

class ErrorManager extends Component<Props, State> {
  private originalConsoleError: typeof console.error;
  private errorHandler: (event: ErrorEvent) => void;
  private rejectionHandler: (event: PromiseRejectionEvent) => void;
  private isHandlingError = false;
  private errorQueue: Error[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "component",
    };
    this.originalConsoleError = console.error;
    this.errorHandler = this.handleGlobalError.bind(this);
    this.rejectionHandler = this.handleUnhandledRejection.bind(this);
  }

  componentDidMount() {
    console.error = (...args: any[]) => {
      this.originalConsoleError.apply(console, args);

      const message = args
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" ");

      if (
        message.includes("Cannot update during an existing state transition") ||
        message.includes("Warning: Cannot update a component") ||
        message.includes("[ManagedWebSocket] Handler error") ||
        this.isHandlingError
      ) {
        return;
      }

      const error = new Error(message);
      error.name = "Console Error";

      this.queueError(error, "console");
    };

    window.addEventListener("error", this.errorHandler);
    window.addEventListener("unhandledrejection", this.rejectionHandler);
  }

  componentWillUnmount() {
    console.error = this.originalConsoleError;
    window.removeEventListener("error", this.errorHandler);
    window.removeEventListener("unhandledrejection", this.rejectionHandler);
  }

  queueError = (error: Error, errorType: State["errorType"]) => {
    if (this.isHandlingError) return;

    this.errorQueue.push(error);

    setTimeout(() => {
      if (this.errorQueue.length > 0 && !this.isHandlingError) {
        const firstError = this.errorQueue[0];
        this.errorQueue = [];
        this.handleQueuedError(firstError, errorType);
      }
    }, 0);
  };

  handleQueuedError = (error: Error, errorType: State["errorType"]) => {
    if (this.isHandlingError) return;

    this.isHandlingError = true;

    try {
      this.setState({
        hasError: true,
        error,
        errorInfo: null,
        errorType,
      });
    } catch (e) {
      this.originalConsoleError("ErrorManager: Failed to set error state:", e);
    } finally {
      setTimeout(() => {
        this.isHandlingError = false;
      }, 100);
    }
  };

  handleGlobalError = (event: ErrorEvent) => {
    const error = new Error(event.message);
    error.name = "Runtime Error";
    error.stack =
      event.error?.stack ||
      `at ${event.filename}:${event.lineno}:${event.colno}`;

    this.queueError(error, "thrown");
  };

  handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = new Error(`Unhandled Promise Rejection: ${event.reason}`);
    error.name = "Promise Rejection";
    error.stack = event.reason?.stack || "No stack trace available";

    this.queueError(error, "thrown");
  };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error, errorType: "component" };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.originalConsoleError(
      "ErrorManager caught an error:",
      error,
      errorInfo
    );

    if (!this.isHandlingError) {
      this.setState({
        hasError: true,
        error,
        errorInfo,
        errorType: "component",
      });
    }

    if (process.env.NODE_ENV === "development") {
      setTimeout(() => {
        const overlays = [
          document.querySelector("iframe[data-reactroot]"),
          document.querySelector("[data-react-error-overlay]"),
          document.querySelector(
            'div[style*="position: fixed"][style*="z-index"]'
          ),
          document.querySelector("div[data-react-error-overlay-root]"),
        ];
        overlays.forEach((overlay) => {
          if (overlay) {
            (overlay as HTMLElement).style.display = "none";
          }
        });
      }, 100);
    }
  }

  copyErrorToClipboard = () => {
    const { error, errorInfo } = this.state;
    const errorText = `
Error: ${error?.message || "Unknown error"}
Type: ${error?.name || "Unknown"}

Stack Trace:
${error?.stack || "No stack trace available"}

Component Stack:
${errorInfo?.componentStack || "No component stack available"}
    `.trim();

    navigator.clipboard
      .writeText(errorText)
      .then(() => this.originalConsoleError("Error copied to clipboard"))
      .catch(() =>
        this.originalConsoleError("Failed to copy error to clipboard")
      );
  };

  resetError = () => {
    this.isHandlingError = false;
    this.errorQueue = [];
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: "component",
    });
  };

  getColorClasses = (): "red" | "yellow" | "indigo" => {
    const map: Record<State["errorType"], "red" | "yellow" | "indigo"> = {
      console: "red",
      thrown: "yellow",
      component: "indigo",
    };
    return map[this.state.errorType] || "red";
  };

  getErrorTitle = () => {
    switch (this.state.errorType) {
      case "console":
        return "Console Error";
      case "thrown":
        return "Runtime Error";
      case "component":
      default:
        return "Component Error";
    }
  };

  render() {
    const squares = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      size: Math.random() * 16 + 18,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 4,
    }));

    if (this.state.hasError) {
      const { error } = this.state;
      const color = this.getColorClasses();
      const title = this.getErrorTitle();

      const bgClass =
        {
          red: "bg-red-600 hover:bg-red-700",
          yellow: "bg-yellow-600 hover:bg-yellow-700",
          indigo: "bg-indigo-600 hover:bg-indigo-700",
        }[color] || "bg-red-600 hover:bg-red-700";

      const borderClass =
        {
          red: "border-red-600 hover:border-red-700 text-red-600",
          yellow: "border-yellow-600 hover:border-yellow-700 text-yellow-600",
          indigo: "border-indigo-600 hover:border-indigo-700 text-indigo-600",
        }[color] || "border-red-600 hover:border-red-700 text-red-600";

      const textColorClass =
        {
          red: "text-red-300",
          yellow: "text-yellow-300",
          indigo: "text-indigo-300",
        }[color] || "text-red-300";

      const titleTextClass =
        {
          red: "text-red-400",
          yellow: "text-yellow-400",
          indigo: "text-indigo-400",
        }[color] || "text-red-400";

      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="w-full h-full flex items-center justify-center p-6 backdrop-blur-sm rounded-lg relative overflow-hidden"
        >
          {squares.map((square) => (
            <motion.div
              key={square.id}
              className="absolute bg-pulse-purple/15 border border-pulse-purple/25 rounded-sm"
              style={{
                width: `${square.size}px`,
                height: `${square.size}px`,
                left: `${square.left}%`,
                top: `${square.top}%`,
              }}
              animate={{
                y: [-30, 30, -30],
                x: [-15, 15, -15],
                rotate: [0, 360],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: square.duration,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: square.delay,
              }}
            />
          ))}

          <div className="text-center max-w-md z-10 relative">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.1,
                duration: 0.5,
                type: "spring",
                stiffness: 200,
              }}
              className={`w-12 h-12 ${bgClass}/20 ${borderClass} rounded-full flex items-center justify-center mx-auto mb-4 border`}
            >
              <AlertTriangle className={`w-6 h-6 ${textColorClass}`} />
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className={`${titleTextClass} font-medium mb-2`}
            >
              {title}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className={`text-sm font-mono break-words p-2 rounded-lg bg-zinc-700/20 ${textColorClass}`}
              style={{ whiteSpace: "pre-wrap" }}
            >
              {error?.message || "An unknown error occurred"}
            </motion.p>

            <div className="mt-4 flex justify-center gap-4 relative">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.copyErrorToClipboard}
                className={`px-4 py-2 border border-white/30 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer hover:bg-white/10`}
                title="Copy error details to clipboard"
              >
                Copy Error
              </motion.button>

              <div className="relative">
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45, duration: 0.3 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={this.resetError}
                  className={`${bgClass} ring-2 ring-red-400 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer relative z-10`}
                >
                  Try Again
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorManager;
