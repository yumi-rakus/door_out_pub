import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { AppDispatch } from "~/store";
import {
  setSearchSortId,
  setTimelineSortId
} from "~/store/slice/Domain/post.slice";

import { IconButton, Menu, MenuItem } from "@material-ui/core";
import {
  FormatLineSpacing as FormatLineSpacingIcon,
  Favorite as FavoriteIcon,
  Update as UpdateIcon
} from "@material-ui/icons";

type Props = {
  selectedSortId: number;
  //1は検索画面、2は投稿一覧画面
  type: 1 | 2;
};
const SortOrder: React.FC<Props> = props => {
  const dispatch: AppDispatch = useDispatch();

  // component/state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  /**
   * 並び替えMenuを開く.
   *
   * @param event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
   */
  const handleClick = (
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * 並び替えMenuを閉じる.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * postSlice.stateにsortIdを保存する.
   */
  const handleSelectSort = (sortId: 1 | 2) => {
    if (props.type === 1) {
      dispatch(setSearchSortId(sortId));
    } else {
      dispatch(setTimelineSortId(sortId));
    }
    setAnchorEl(null);
  };

  const selectedStyle: React.CSSProperties = {
    textDecoration: "underline"
  };

  const unselectedStyle: React.CSSProperties = {};
  return (
    <>
      <IconButton onClick={handleClick}>
        <FormatLineSpacingIcon />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        {/*新着順*/}
        <MenuItem
          onClick={() => {
            handleSelectSort(1);
          }}
        >
          <UpdateIcon />
          <span
            style={props.selectedSortId === 1 ? selectedStyle : unselectedStyle}
          >
            新着順
          </span>
        </MenuItem>

        {/*いいね順*/}
        <MenuItem
          onClick={() => {
            handleSelectSort(2);
          }}
        >
          <FavoriteIcon color={"error"} />
          <span
            style={props.selectedSortId === 2 ? selectedStyle : unselectedStyle}
          >
            いいね順
          </span>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SortOrder;