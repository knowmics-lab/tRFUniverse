import { createContext } from "react";

type SubMenuContextType = {
    subscribe: (key: string) => () => void;
};

const SideNavSubMenuContext = createContext<SubMenuContextType | undefined>(undefined);

export default SideNavSubMenuContext;
