import React, { useEffect, useMemo, useState } from "react";

import {
  TextField,
  Grid,
  Typography,
  makeStyles,
  IconButton,
  Paper
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { Search, LocationOn } from "@material-ui/icons";

import parse from "autosuggest-highlight/parse";
import throttle from "lodash/throttle";

const autocompleteService = { current: null };

interface PlaceType {
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
    main_text_matched_substrings: [
      {
        offset: number;
        length: number;
      }
    ];
  };
  place_id: string;
}

type Props = {
  handleLocationSearch: (lat: number, lng: number) => void;
};

const SearchLocationForm: React.FC<Props> = props => {
  const classes = useStyles();

  // component/state
  const [value, setValue] = useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<Array<PlaceType>>([]);

  // 定数
  enum reqType {
    PLACE_ID_REQ,
    ADDRESS_REQ
  }

  /**
   * 検索ボタンを押下すると走る処理.
   * runGeocode()を実行する.
   */
  const handleClickSearchBtn = () => {
    if (input) {
      if (input === value?.description) {
        if (value?.place_id) {
          runGeocode(reqType.PLACE_ID_REQ);
        }
      } else {
        runGeocode(reqType.ADDRESS_REQ);
      }
    }
  };

  /**
   * autocompleteで取得したplace_id、もしくは入力した内容(address)を座標に変換する.
   * 変換が成功すれば、親にevent upする.
   *
   * @param type: reqType ( enum )
   */
  const runGeocode = (type: reqType) => {
    const geocoder = new google.maps.Geocoder();

    let req: google.maps.GeocoderRequest = {};
    if (type === reqType.PLACE_ID_REQ) {
      req = { placeId: value!.place_id };
    } else if (type === reqType.ADDRESS_REQ) {
      req = { address: input };
    }
    geocoder.geocode(req, (results, status) => {
      if (status === "OK") {
        props.handleLocationSearch(
          results[0].geometry.location.lat(),
          results[0].geometry.location.lng()
        );
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    });
  };

  const fetch = useMemo(
    () =>
      throttle(
        (
          request: { input: string; componentRestrictions: { country: "jp" } },
          callback: (results?: Array<PlaceType>) => void
        ) => {
          (autocompleteService.current as any).getPlacePredictions(
            request,
            callback
          );
        },
        200
      ),
    []
  );

  useEffect(() => {
    let active = true;

    // autocompleteServiceがnull(初期値)ならばgoogle.maps.places.AutocompleteServiceに設定
    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    // 入力フォームの内容が全て消されたとき、optionsを空にする.
    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch(
      { input: inputValue, componentRestrictions: { country: "jp" } },
      (results?: Array<PlaceType>) => {
        if (active) {
          let newOptions: Array<PlaceType> = [];

          if (value) {
            newOptions = [value];
          }

          if (results) {
            newOptions = [...newOptions, ...results];
          }

          setOptions(newOptions);
        }
      }
    );

    // cleanUp関数　unmount時にはたらく
    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  useEffect(() => {
    if (!value) {
      setInput("");
    }
  }, [value]);

  return (
    <Paper variant={"outlined"} elevation={0} style={{ width: "100%" }}>
      <Grid
        container
        justify={"center"}
        alignItems={"center"}
        alignContent={"center"}
      >
        <Grid item xs={10}>
          <Autocomplete
            style={{ width: "100%", margin: "3%" }}
            getOptionLabel={option =>
              typeof option === "string" ? option : option.description
            }
            filterOptions={x => x}
            options={options}
            autoComplete
            includeInputInList
            filterSelectedOptions
            value={value}
            onChange={(_event, newValue: PlaceType | null) => {
              setOptions(newValue ? [newValue, ...options] : options);
              if (newValue) setInput(newValue.description);
              setValue(newValue);
            }}
            onInputChange={(_event, newInputValue) => {
              setInputValue(newInputValue);
            }}
            renderInput={params => {
              return (
                <TextField
                  {...params}
                  label="マップを検索する"
                  variant="outlined"
                  fullWidth
                  size={"small"}
                  inputProps={{
                    ...params.inputProps,
                    style: { fontSize: "17px" },
                    value: input
                  }}
                  onChange={e => {
                    setInput(e.target.value);
                  }}
                />
              );
            }}
            renderOption={option => {
              // ハイライト処理
              const matches =
                option.structured_formatting.main_text_matched_substrings;
              const parts = parse(
                option.structured_formatting.main_text,
                matches.map((match: { offset: number; length: number }) => [
                  match.offset,
                  match.offset + match.length
                ])
              );

              return (
                <Grid container alignItems="center">
                  <Grid item>
                    <LocationOn className={classes.icon} />
                  </Grid>
                  <Grid item xs>
                    {parts.map((part, index) => (
                      <span
                        key={index}
                        style={{
                          fontWeight: part.highlight ? 700 : 400,
                          fontSize: "13px"
                        }}
                      >
                        {part.text}
                      </span>
                    ))}
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      style={{ fontSize: "13px" }}
                    >
                      {option.structured_formatting.secondary_text}
                    </Typography>
                  </Grid>
                </Grid>
              );
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton onClick={handleClickSearchBtn}>
            <Search />
          </IconButton>
        </Grid>
      </Grid>
    </Paper>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.secondary
  }
}));

export default SearchLocationForm;