import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import { addTag } from "~/store/slice/Domain/tag.slice";
import {
  fetchPostsByTag,
  setSearchTabId,
  selectSearchSortId,
  SearchPostForm,
  setSearchValues
} from "~/store/slice/Domain/post.slice";

import { Chip, Grid, makeStyles } from "@material-ui/core";

import { useHistory, useLocation } from "react-router-dom";
import { Path } from "~/router/routes";

import { FETCH_POSTS_LIMIT } from "~/utils/globalVariables";
import { Tag } from "~/interfaces";
import { useErrorHandle } from "~/utils/useErrorHandle";
import { useSnackbar } from "notistack";
import { THEME_COLOR1 } from "~/assets/ExportCSS";

type Props = {
  tags: Array<Tag>;
};

const TagList: React.FC<Props> = props => {
  const classes = useStyles();
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const sortId = useSelector(selectSearchSortId);

  // 定数
  const FAILED_FETCH_POSTS_MESSAGE = "投稿の取得に失敗しました。";

  /**
   * タグ押下時に検索画面以外にいる場合は検索画面に遷移後にタグ検索し、
   * 検索画面にいる場合はタグ検索する関数
   * @param e マウスイベント
   * @param tag 押下したタグ
   */
  const handleTagClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    tag: Tag
  ) => {
    e.stopPropagation();
    if (location.pathname === Path.search) {
      const searchByTagForm: SearchPostForm = {
        tagId: tag.tagId,
        limit: FETCH_POSTS_LIMIT,
        offset: 0,
        sort: sortId,
        isFolloweePost: false,
        postType: ""
      };

      dispatch(
        fetchPostsByTag({ searchPostForm: searchByTagForm, isSet: true })
      ).catch(e => {
        catchUnauthorizedError(e.message);
        enqueueSnackbar(FAILED_FETCH_POSTS_MESSAGE, { variant: "error" });
      });
      dispatch(addTag(tag));
      dispatch(setSearchValues({ searchValue: tag, searchType: 2 }));
      dispatch(setSearchTabId(2));
    } else {
      history.push({
        pathname: Path.search,
        state: tag
      });
    }
  };

  /**
   * tagsにあるタグをChipコンポーネントとして返す関数
   * @returns タグの情報が入ったChipコンポーネント
   */
  const putTags = () => {
    return props.tags.map(tag => {
      return (
        <Chip
          key={tag.tagId}
          label={tag.tagName}
          color="primary"
          clickable
          className={classes.chip}
          onClick={e => handleTagClick(e, tag)}
        />
      );
    });
  };

  return (
    <div>
      <Grid container justify={"flex-start"} alignItems={"center"}>
        <Grid item className={classes.tagList}>
          {putTags()}
        </Grid>
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(() => ({
  tagList: {
    margin: "3vw",
    textAlign: "left"
  },
  chip: {
    backgroundColor: THEME_COLOR1,
    marginRight: "5px"
  }
}));

export default TagList;
