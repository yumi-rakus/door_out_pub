import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Grid, IconButton, TextField } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { SearchRounded } from "@material-ui/icons";

import { AppDispatch } from "~/store";
import { fetchTags, selectTags, addTag } from "~/store/slice/Domain/tag.slice";
import { useErrorHandle } from "~/utils/useErrorHandle";
import { FETCH_POSTS_LIMIT, FETCH_USERS_LIMIT } from "~/utils/globalVariables";
import { Tag } from "~/interfaces";
import {
  SearchPostForm,
  fetchPostsBySpotName,
  fetchPostsByTag,
  resetSearchPostByTag,
  selectInputValues,
  selectSearchValues,
  setInputValues,
  setSearchValues,
  resetSearchPostByPlace
} from "~/store/slice/Domain/post.slice";
import {
  fetchSearchUsers,
  resetSearchUsers,
  SearchUserForm
} from "~/store/slice/Domain/user.slice";

export type Prop = {
  //検索タイプ 1:ユーザーの検索、2:タグでの検索、3:場所名での検索
  searchType: number;
  sortId: number;
  //投稿のタグを押下した際に渡されるprop
  selectedTag?: Tag;
  setIsLoading: (arg: boolean) => void;
};

const SearchPostInputForm: React.FC<Prop> = ({
  searchType,
  sortId,
  selectedTag,
  setIsLoading
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [catchUnauthorizedError] = useErrorHandle();

  const tags: Array<Tag> = useSelector(selectTags);
  const inputValues = useSelector(selectInputValues);
  const searchValues = useSelector(selectSearchValues);

  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (isFirstRender) {
      setIsFirstRender(false);
    } else {
      search();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortId]);

  useEffect(() => {
    if (selectedTag && selectedTag.tagId) {
      dispatch(addTag(selectedTag));
      dispatch(setSearchValues({ searchValue: selectedTag, searchType: 2 }));
      searchWithTagId(selectedTag.tagId);
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag]);

  const search = async () => {
    setIsLoading(true);
    if (searchType === 1) {
      if (inputValues.userInputValue) {
        const searchUserForm: SearchUserForm = {
          query: inputValues.userInputValue,
          limit: FETCH_USERS_LIMIT,
          offset: 0
        };
        dispatch(
          setSearchValues({
            searchType: 1,
            searchValue: inputValues.userInputValue
          })
        );
        await dispatch(
          fetchSearchUsers({ searchUserForm: searchUserForm, isSet: true })
        ).catch(e => catchUnauthorizedError(e.message));
      } else {
        dispatch(resetSearchUsers());
      }
    } else if (searchType === 2) {
      if (searchValues.tagSearchValue) {
        const searchByTagForm: SearchPostForm = {
          tagId: searchValues.tagSearchValue.tagId,
          limit: FETCH_POSTS_LIMIT,
          offset: 0,
          sort: sortId,
          isFolloweePost: false,
          postType: ""
        };
        await dispatch(
          fetchPostsByTag({ searchPostForm: searchByTagForm, isSet: true })
        ).catch(e => catchUnauthorizedError(e.message));
      } else {
        dispatch(resetSearchPostByTag());
      }
    } else if (searchType === 3) {
      if (inputValues.placeInputValue) {
        const searchBySpotForm: SearchPostForm = {
          spotName: inputValues.placeInputValue.split(" "),
          limit: FETCH_POSTS_LIMIT,
          offset: 0,
          sort: sortId,
          isFolloweePost: false,
          postType: ""
        };
        dispatch(
          setSearchValues({
            searchType: 3,
            searchValue: inputValues.placeInputValue
          })
        );
        await dispatch(
          fetchPostsBySpotName({
            searchPostForm: searchBySpotForm,
            isSet: true
          })
        ).catch(e => catchUnauthorizedError(e.message));
      } else {
        dispatch(resetSearchPostByPlace());
      }
    }
    setIsLoading(false);
  };

  const searchWithTagId = async (tagId: string) => {
    setIsLoading(true);
    const searchByTagForm: SearchPostForm = {
      tagId: tagId,
      limit: FETCH_POSTS_LIMIT,
      offset: 0,
      sort: sortId,
      isFolloweePost: false,
      postType: ""
    };
    await dispatch(
      fetchPostsByTag({ searchPostForm: searchByTagForm, isSet: true })
    ).catch(e => catchUnauthorizedError(e.message));
    setIsLoading(false);
  };

  const handleChangeUserPlaceForm = (value: string) => {
    if (searchType === 1) {
      dispatch(setInputValues({ inputValue: value, searchType: 1 }));
    } else {
      dispatch(setInputValues({ inputValue: value, searchType: 3 }));
    }
  };

  const handleChangeTagForm = (value: string) => {
    if (value) {
      dispatch(setSearchValues({ searchType: 2, searchValue: null }));
      dispatch(fetchTags(value)).catch(e => catchUnauthorizedError(e.message));
    } else {
      dispatch(setSearchValues({ searchType: 2, searchValue: null }));
      dispatch(resetSearchPostByTag());
    }
  };

  const handleAutocompChanged = (selectedTag: Tag | null) => {
    if (selectedTag?.tagId) {
      // dispatch(setInputValues({ inputValue: selectedTag, searchType: 2 }));
      dispatch(setSearchValues({ searchValue: selectedTag, searchType: 2 }));
      const searchByTagForm: SearchPostForm = {
        tagId: selectedTag.tagId,
        limit: FETCH_POSTS_LIMIT,
        offset: 0,
        sort: sortId,
        isFolloweePost: false,
        postType: ""
      };
      dispatch(
        fetchPostsByTag({ searchPostForm: searchByTagForm, isSet: true })
      ).catch(e => catchUnauthorizedError(e.message));
    } else {
      dispatch(setSearchValues({ searchType: 2, searchValue: null }));
      dispatch(resetSearchPostByTag());
    }
  };

  return (
    <>
      <Grid container>
        <Grid item xs={10} style={{ marginTop: "3px" }}>
          {searchType === 1 || searchType === 3 ? (
            <TextField
              style={{ width: "100%", backgroundColor: "white" }}
              placeholder={searchType === 1 ? "ユーザー検索" : "場所名で検索"}
              value={
                searchType === 1
                  ? inputValues.userInputValue
                  : inputValues.placeInputValue
              }
              type="search"
              variant="outlined"
              size="small"
              onChange={e => handleChangeUserPlaceForm(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  search();
                }
              }}
            />
          ) : (
            <Autocomplete
              size={"small"}
              value={
                searchValues.tagSearchValue?.tagId
                  ? searchValues.tagSearchValue
                  : null
              }
              options={tags}
              getOptionSelected={(option, value) =>
                option.tagId === value.tagId && option.tagName === value.tagName
              }
              getOptionLabel={option => option.tagName}
              onChange={(e, selectedTag) => handleAutocompChanged(selectedTag)}
              renderInput={params => (
                <TextField
                  {...params}
                  style={{ width: "100%", backgroundColor: "white" }}
                  placeholder="タグで検索"
                  variant="outlined"
                  onChange={e => handleChangeTagForm(e.target.value)}
                />
              )}
            />
          )}
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={search}>
            <SearchRounded />
          </IconButton>
        </Grid>
      </Grid>
    </>
  );
};

export default SearchPostInputForm;