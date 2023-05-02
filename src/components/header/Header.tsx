import React, { useEffect } from "react";

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
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import List from "@material-ui/core/List";
import IconButton from "@material-ui/core/IconButton";
import Skeleton from "@material-ui/lab/Skeleton";
import MenuIcon from "@material-ui/icons/Menu";

// Api
import api from "../../api";
import auth from "../../auth";

// Contexts/Hooks
import { useApiState, useUser } from "../../state/hooks";

// Components
import Menu from "../../components/menu";
import Logo from "../logo/Logo";
import AlertAppbar from "../alerts/AlertAppbar";

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
      "@media (max-width: 900px)": {
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
      },
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
    navListItemText: {
      color: "white",
    },
    navListItemSelected: {
      backgroundColor: theme.palette.primary.main,
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
  }),
);

type NavbarItemPropsType = {
  to: string;
  name: string;
  isRoot?: boolean;
  isListItem?: boolean;
  className?: string;
};

const NavbarItem: React.FC<NavbarItemPropsType> = ({
  to,
  name,
  isRoot,
  isListItem,
  className,
}: NavbarItemPropsType) => {
  const style = useStyles();

  const isSelected = () => {
    return window.location.pathname === to || (isRoot && window.location.pathname === "/");
  };

  return isListItem ? (
    <ListItem
      button
      to={to}
      component={Link}
      className={isSelected() ? classNames(style.navListItemSelected, className) : className}
    >
      <ListItemText primary={name} className={style.navListItemText} />
    </ListItem>
  ) : (
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

  const [apiState] = useApiState();
  const [user, { logout }] = useUser();

  // State storing the current viewport (mobile/desktop) and whether the dropdown navbar should be visible or not
  const [mobileView, setMobileView] = React.useState<boolean>(false);
  const [showDropdownNavbar, setShowDropdownNavbar] = React.useState<boolean>(false);

  // Switch to mobile view if screen width is less than 900px
  useEffect(() => {
    let mounted = true;

    const setResponsiveness = () => {
      if (mounted) {
        if (window.innerWidth < 900) {
          setMobileView(true);
        } else {
          setMobileView(false);
          setShowDropdownNavbar(false);
        }
      }
    };

    setResponsiveness();
    window.addEventListener("resize", () => setResponsiveness());

    return () => {
      mounted = false;
      window.removeEventListener("resize", () => setResponsiveness());
    };
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.token()]);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await api.postLogout()
    auth.logout(() => {
      logout();
      history.push("/login");
    })
  };

  const menuId = "primary-search-account-menu";
  const renderMenu = (
    <Menu anchorEl={anchorEl} id={menuId} open={isMenuOpen} onClose={handleMenuClose}>
      <MenuItem onClick={handleMenuClose} component={Link} to="/destinations">
          Destinations
      </MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const displayDesktop = () => {
    return (
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
    );
  };

  const displayMobile = () => {
    const onMenuClick = () => setShowDropdownNavbar(!showDropdownNavbar);

    return (
      <Toolbar className={classNames(style.navWrapper)} disableGutters>
        <IconButton
          {...{
            edge: "start",
            color: "inherit",
            "aria-label": "menu",
            "aria-haspopup": "true",
            onClick: onMenuClick,
          }}
          className={style.navItem}
        >
          <MenuIcon />
        </IconButton>

        <Link className={classNames(style.navItem, style.logoWrapper)} to="/incidents">
          <Logo className={style.logo} />
        </Link>
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
    );
  };

  return (
    <div className={style.grow}>
      <AppBar className={classNames(style.root)} position="relative">
        {mobileView ? displayMobile() : displayDesktop()}
      </AppBar>
      {apiState.hasConnectionProblems && (
        <AlertAppbar
          message={"Problems connecting to server... Check your connection."}
          severity={"error"}/>
      )}
      {apiState.isOngoingBulkUpdate && (
        <AlertAppbar
          message={"Performing bulk operation... Please wait."}
          severity={"warning"}/>
      )}
      {renderMenu}

      {showDropdownNavbar && (
        <AppBar className={classNames(style.root)} position="relative">
          <List>
            <NavbarItem to="/incidents" name="Incidents" isRoot isListItem />
            <NavbarItem to="/timeslots" name="Timeslots" isListItem />
            <NavbarItem to="/notificationprofiles" name="Profiles" isListItem />
          </List>
        </AppBar>
      )}
    </div>
  );
};

export default withRouter(Header);
