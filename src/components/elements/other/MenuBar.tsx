import React, { useState, useEffect } from "react";

import {
  Menu,
  MenuItem,
  makeStyles,
  Theme,
  Tabs,
  Tab,
  withStyles,
  createStyles,
  Badge
} from "@material-ui/core";
import {
  Notifications as NotificationsIcon,
  Map as MapIcon,
  Search as SearchIcon,
  AddCircle as AddCircleIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  Directions as DirectionsIcon
} from "@material-ui/icons";

import { useHistory, Link, useLocation } from "react-router-dom";
import { Path } from "~/router/routes";

const MenuBar: React.FC = () => {
  const classes = menuBarStyles();
  const history = useHistory();
  const location = useLocation();

  // component/state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [tabValue, setTabValue] = useState<string | boolean>(Path.map);
  const [newNoticesCount, setNewNoticesCount] = useState(0);

  useEffect(() => {
    if (localStorage.getItem("newNoticesCount")) {
      const noticeCount = Number(localStorage.getItem("newNoticesCount"));
      setNewNoticesCount(noticeCount);
    }
    // eslint-disable-next-line
  }, [localStorage.getItem("newNoticesCount")]);

  useEffect(() => {
    if (
      location.pathname === Path.postSpot ||
      location.pathname === Path.roadRecord ||
      location.pathname === Path.postRoad
    ) {
      setTabValue("add");
    } else if (
      location.pathname === Path.map ||
      location.pathname === Path.timeline ||
      location.pathname === Path.search ||
      location.pathname === Path.noticeList
    ) {
      setTabValue(location.pathname);
    } else {
      setTabValue(false);
    }
  }, [location.pathname]);

  /**
   * 投稿Menuを開く.
   *
   * @param event: React.MouseEvent<HTMLButtonElement>
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * 投稿Menuを閉じる.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.menubar}>
      <hr />
      <Tabs
        value={tabValue}
        variant={"fullWidth"}
        indicatorColor={"primary"}
        textColor={"primary"}
        aria-label={"icon tabs example"}
      >
        <Tab
          icon={<MapIcon fontSize={"large"} />}
          component={Link}
          to={Path.map}
          value={Path.map}
        />
        <Tab
          icon={<HomeIcon fontSize={"large"} />}
          component={Link}
          to={Path.timeline}
          value={Path.timeline}
        />
        <Tab
          icon={<AddCircleIcon fontSize={"large"} />}
          onClick={handleClick}
          value={"add"}
        />
        <Tab
          icon={<SearchIcon fontSize={"large"} />}
          component={Link}
          to={Path.search}
          value={Path.search}
        />
        <Tab
          icon={
            <StyledBadge badgeContent={newNoticesCount} color={"primary"}>
              <NotificationsIcon fontSize={"large"} />
            </StyledBadge>
          }
          component={Link}
          to={Path.noticeList}
          value={Path.noticeList}
        />
      </Tabs>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            setTabValue("add");
            history.push({ pathname: Path.postSpot });
            handleClose();
          }}
        >
          <LocationOnIcon color={"primary"} />
          地点投稿
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTabValue("add");
            history.push({ pathname: Path.roadRecord });
            handleClose();
          }}
        >
          <DirectionsIcon color={"primary"} />
          経路投稿
        </MenuItem>
      </Menu>
    </div>
  );
};

const menuBarStyles = makeStyles(() => ({
  menubar: {
    position: "fixed",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff"
  },
  badge: {
    top: 1
  }
}));

const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      right: -3,
      top: 10,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: "0 4px"
    }
  })
)(Badge);

export default MenuBar;