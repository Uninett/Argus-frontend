import React, { useContext } from "react";

import { Link, useHistory, withRouter } from "react-router-dom";

import classNames from "classnames";

// MUI
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import MenuItem from "@material-ui/core/MenuItem";
import Skeleton from "@material-ui/lab/Skeleton";

// Api
import auth from "../../auth";

// Contexts/Hooks
import { AppContext } from "../../contexts";
import { loginUser, logoutUser } from "../../reducers/user";

// Components
import Menu from "../../components/menu";
import Logo from "../logo/Logo";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: theme.palette.primary.dark,
      boxSizing: "border-box",
      color: theme.palette.text.primary,
      flexGrow: 1,
      transition: "0.4s",
      zIndex: theme.zIndex.drawer + 1,
    },
    rootNetworkError: {
      backgroundColor: theme.palette.error.dark,
    },
    grow: { flexGrow: 1 },
    rightAligned: { marginRight: theme.spacing(2) },
    navWrapper: {
      width: "100%",
      display: "flex",
      minWidth: "100%",
      alignItems: "center",
      overflow: "hidden",
    },
    navItem: {
      margin: theme.spacing(0.5),
      marginRight: theme.spacing(2),
      marginLeft: theme.spacing(2),

      color: "white",
    },
    navItemSelected: {},
    navItemButton: {
      // padding: "12px",
      // color: "white",
      "&:hover": {
        color: "black",
        backgroundColor: "white",
      },
    },
    navItemButtonSelected: {
      color: "black",
      backgroundColor: "white",
      "&:hover": {
        color: "black",
        backgroundColor: "white",
      },
    },
    logoWrapper: {
      alignSelf: "flex-start",
    },
    logo: {
      height: "64px",
      width: "auto",
    },
    avatarContainer: {
      display: "flex",
      flexFlow: "column wrap",
      alignItems: "center",
      "&:hover": {
        cursor: "pointer",
      },
    },
    errorTypography: {
      alignItems: "center",
      fontWeight: "bold",
      color: "white",
    },
  }),
);

type NavbarItemPropsType = {
  to: string;
  name: string;
  isRoot?: boolean;
  className?: string;
};

const NavbarItem: React.FC<NavbarItemPropsType> = ({ to, name, isRoot, className }: NavbarItemPropsType) => {
  const style = useStyles();

  const isSelected = () => {
    return window.location.pathname === to || (isRoot && window.location.pathname === "/");
  };

  return (
    <div
      className={
        isSelected()
          ? classNames(style.navItem, style.navItemSelected, className)
          : classNames(style.navItem, className)
      }
    >
      <Button
        color="inherit"
        variant="outlined"
        size="large"
        to={to}
        component={Link}
        className={isSelected() ? classNames(style.navItemButton, style.navItemButtonSelected) : style.navItemButton}
      >
        {name}
      </Button>
    </div>
  );
};

type HeaderPropsType = {};

const Header: React.FC<HeaderPropsType> = () => {
  const style = useStyles();
  const history = useHistory();

  // profile drop-down menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const {
    state: { user, apiState },
    dispatch,
  } = useContext(AppContext);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    auth.logout(() => {
      dispatch(logoutUser());
      history.push("/login");
    });
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu anchorEl={anchorEl} id={menuId} open={isMenuOpen} onClose={handleMenuClose}>
      <MenuItem onClick={handleMenuClose} component={Link} to="/settings">
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  return (
    <div className={style.grow}>
      <AppBar className={classNames(style.root)} position="relative">
        <Toolbar className={classNames(style.navWrapper)} disableGutters>
          <Link className={classNames(style.navItem, style.logoWrapper)} to="/incidents">
            <Logo className={style.logo} />
          </Link>
          <NavbarItem to="/incidents" name="Incidents" isRoot />
          <NavbarItem to="/timeslots" name="Timeslots" />
          <NavbarItem to="/notificationprofiles" name="Profiles" />

          <div className={style.grow} />
          <div>
            <div className={classNames(style.navItem, style.navItemSelected)} onClick={handleMenuOpen}>
              {user.isAuthenticated ? (
                <div className={style.avatarContainer}>
                  <Avatar>{user.displayName[0]}</Avatar>
                  <Typography>{user.displayName}</Typography>
                </div>
              ) : (
                <div className={style.avatarContainer}>
                  <Skeleton variant="circle">
                    <Avatar>User</Avatar>
                  </Skeleton>
                  <Skeleton>
                    <Typography>User</Typography>
                  </Skeleton>
                </div>
              )}
            </div>
          </div>
        </Toolbar>
      </AppBar>
      {apiState.hasConnectionProblems && (
        <AppBar className={classNames(style.root, style.rootNetworkError)} position="relative">
          <Typography className={style.errorTypography}>Problems connecting to server...</Typography>
        </AppBar>
      )}

      {renderMenu}
    </div>
  );
};

export default withRouter(Header);
