import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import { logout } from "~/store/slice/App/auth.slice";

import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { Edit, MeetingRoom, Settings } from "@material-ui/icons";

import { useHistory } from "react-router-dom";
import { Path } from "~/router/routes";

const Setting: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const history = useHistory();

  // component/state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /**
   * menuを閉じる.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <IconButton
        onClick={event => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <Settings />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem
          onClick={() => {
            history.push({ pathname: Path.editProfile });
            handleClose();
          }}
        >
          <Edit color={"disabled"} />
          &nbsp;プロフィール編集
        </MenuItem>
        <MenuItem
          onClick={() => {
            dispatch(logout());
            handleClose();
            history.push({ pathname: Path.login });
          }}
        >
          <MeetingRoom color={"disabled"} />
          &nbsp;ログアウト
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Setting;