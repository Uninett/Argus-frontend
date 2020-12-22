import React from "react";
import MUIMenu, { MenuProps as MUIMenuProps } from "@material-ui/core/Menu";

type MenuPropsType = {
  id: string;
  open: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;

  children: React.ReactNode;
  menuProps?: MUIMenuProps;
};

export const Menu: React.FC<MenuPropsType> = ({ id, open, onClose, anchorEl, children, menuProps }: MenuPropsType) => {
  return (
    <MUIMenu
      anchorEl={open && anchorEl ? anchorEl : null}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      id={id}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      open={open}
      onClose={() => onClose()}
      getContentAnchorEl={null}
      {...(menuProps || {})}
    >
      {children}
    </MUIMenu>
  );
};

export default Menu;
