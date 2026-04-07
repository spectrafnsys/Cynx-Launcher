import React, { createContext, useContext, useState, ReactNode } from "react";

interface ConnectionStatus {
  handlersSetup: boolean;
  userRequestSent: boolean;
}

interface ConnectionStatusContextType {
  status: ConnectionStatus;
  updateStatus: (status: ConnectionStatus) => void;
}

const ConnectionStatusContext = createContext<
  ConnectionStatusContextType | undefined
>(undefined);

export const ConnectionStatusProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [status, setStatus] = useState<ConnectionStatus>({
    handlersSetup: false,
    userRequestSent: false,
  });

  const updateStatus = React.useCallback((newStatus: ConnectionStatus) => {
    setStatus((prev) => {
      if (
        prev.handlersSetup === newStatus.handlersSetup &&
        prev.userRequestSent === newStatus.userRequestSent
      ) {
        return prev;
      }
      return newStatus;
    });
  }, []);

  const contextValue = React.useMemo(
    () => ({
      status,
      updateStatus,
    }),
    [status, updateStatus]
  );

  return (
    <ConnectionStatusContext.Provider value={contextValue}>
      {children}
    </ConnectionStatusContext.Provider>
  );
};

export const useConnectionStatus = () => {
  const context = useContext(ConnectionStatusContext);
  if (context === undefined) {
    throw new Error(
      "useConnectionStatus must be used within a ConnectionStatusProvider"
    );
  }
  return context;
};

export default ConnectionStatusProvider;
