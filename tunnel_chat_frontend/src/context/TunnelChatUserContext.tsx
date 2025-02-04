import { createContext, useState, FC } from "react";

type UserContextType = {
  username: string | null;
  setUsername: (user: string | null) => void;
};

type UserContextProviderProps = {
  children: React.ReactNode;
};

const TunnelChatContext = createContext<UserContextType>({
  username: null,
  setUsername: () => {},
});

export const TunnelChatUserProvider: FC<UserContextProviderProps> = ({
  children,
}) => {
  const [username, setUsername] = useState<string | null>(null);
  return (
    <TunnelChatContext.Provider value={{ username, setUsername }}>
      {children}
    </TunnelChatContext.Provider>
  );
};
