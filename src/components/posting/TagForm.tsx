import React, { ChangeEvent, useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "~/store";
import {
  cleanTags,
  fetchTags,
  selectTags
} from "~/store/slice/Domain/tag.slice";

import { Chip, TextField } from "@material-ui/core";
import Autocomplete, {
  AutocompleteGetTagProps,
  AutocompleteRenderInputParams
} from "@material-ui/lab/Autocomplete";

import { useSnackbar } from "notistack";

import { Tag } from "~/interfaces";
import { useErrorHandle } from "~/utils/useErrorHandle";

type Props = {
  setTags: Function;
  handleValid: (isValid: boolean) => void;
};

const TagForm: React.FC<Props> = props => {
  const dispatch: AppDispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [catchUnauthorizedError] = useErrorHandle();

  // store/state
  const tags = useSelector(selectTags);

  // component/state
  const [tagNames, setTagNames] = useState<Array<string>>([]);
  const [inputValue, setInputValue] = useState("");
  const [autoCompleteValue, setAutoCompleteValue] = useState<Tag[]>([]);
  const [isValidTagCount, setIsValidTagCount] = useState(true);

  useEffect(() => {
    const tagNameList: Array<string> = tags.map(tag => tag.tagName);
    setTagNames(tagNameList);
  }, [tags]);

  useEffect(() => {
    if (autoCompleteValue.length > 10) {
      setIsValidTagCount(false);
    } else {
      setIsValidTagCount(true);
      props.setTags(autoCompleteValue);
    }

    return () => {
      dispatch(cleanTags());
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCompleteValue]);

  useEffect(() => {
    props.handleValid(isValidTagCount);
  }, [isValidTagCount, props]);

  /**
   * フォームで入力し、Enter（改行）を押下した際に発火する.
   *
   * @param e: any
   * @param newValue: newValue: Array<Tag | string>
   */
  const handleAutocompleteChange = (e: any, newValue: Array<Tag | string>) => {
    newValue.forEach((tagValue, index) => {
      // 新しく入力されたもの（string）に対して、Tagオブジェクトに変換する
      if (typeof tagValue === "string") {
        const i = tagNames.indexOf(tagValue);
        if (i === -1) {
          // 既存タグでない場合
          newValue[index] = {
            tagName: tagValue.replace("　", " ").trim()
          };
        } else {
          // 既存タグの場合
          newValue[index] = tags[i];
        }
      }
    });

    // 入力値(tagName)が空文字のものを除外する.
    let tagList = newValue as Tag[];
    tagList = tagList.filter(
      tagValue => tagValue.tagName.replace("　", " ").trim().length > 0
    );

    // set
    setAutoCompleteValue(tagList);

    // 入力値の初期化
    setInputValue("");
  };

  /**
   * 入力した値がtag化（Chip化）される前にフォームからフォーカスが外れた際に、スナックバーで警告文を出す.
   */
  const handleBlur = () => {
    inputValue &&
      enqueueSnackbar("確定されていないタグが存在します", { variant: "error" });
  };

  /**
   * フォームに値が入力された際に走る処理.
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace("　", " ").trim();
    if (value.length > 0) {
      setInputValue(value);
      dispatch(fetchTags(value)).catch(e => {
        catchUnauthorizedError(e.message);
      });
    } else {
      dispatch(cleanTags());
    }
  };

  // /**
  //  * Enter(改行)が押下された際に走る処理.
  //  */
  // const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
  //   if (e.key === "Enter") {
  //     inputValue && inputValue.length > 0 && insertTagForm();
  //     setInputValue("");
  //   }
  // };

  // /**
  //  * tagを挿入する.
  //  */
  // const insertTagForm = () => {
  //   const index = tagNames.indexOf(inputValue);
  //
  //   if (index === -1) {
  //     //入力したタグ名がtagsになければ新たに生成
  //     const tag: Tag = {
  //       tagName: inputValue
  //     };
  //     setAutoCompleteValue(preValue => [...preValue, tag]);
  //   } else {
  //     //tagsにあれば置き換える
  //     setAutoCompleteValue(preValue => [...preValue, tags[index]]);
  //   }
  // };

  /**
   * Chip化したtagを描画する.
   */
  const renderTags = (value: Tag[], getTagProps: AutocompleteGetTagProps) =>
    value.map((tag, index) => (
      <Chip
        variant={"outlined"}
        label={tag.tagName}
        size={"small"}
        {...getTagProps({ index })}
      />
    ));

  const renderInput = (params: AutocompleteRenderInputParams) => (
    <>
      {/*<Grid container justify={"flex-end"} style={{ marginTop: "5%" }}>*/}
      {/*  <Grid item>*/}
      {/*    <Button*/}
      {/*      variant="contained"*/}
      {/*      size="small"*/}
      {/*      color="primary"*/}
      {/*      disabled={!inputValue}*/}
      {/*      onClick={() => {*/}
      {/*        inputValue && insertTagForm();*/}
      {/*        setInputValue("");*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      タグを追加*/}
      {/*    </Button>*/}
      {/*  </Grid>*/}
      {/*</Grid>*/}
      <TextField
        {...params}
        variant={"outlined"}
        size={"small"}
        id={"standard-basic"}
        label={"タグを改行で追加"}
        helperText={
          autoCompleteValue.length +
          "/10 " +
          (isValidTagCount ? " " : "入力できるタグは10個までです")
        }
        error={!isValidTagCount}
        onChange={handleChange}
        // onKeyDown={handleKeyDown}
      />
    </>
  );

  return (
    <>
      <div>
        <Autocomplete
          autoComplete
          filterSelectedOptions
          freeSolo
          getOptionSelected={(op, tag) => op.tagName === tag.tagName}
          getOptionLabel={tag => tag.tagName}
          includeInputInList
          multiple
          options={tags ? tags : []}
          onBlur={handleBlur}
          onChange={handleAutocompleteChange}
          renderTags={renderTags}
          renderInput={renderInput}
          size={"small"}
          value={autoCompleteValue}
        />
      </div>
    </>
  );
};

export default TagForm;