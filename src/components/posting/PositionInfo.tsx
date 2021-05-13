import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";

import { makeStyles, TextField, Typography, Grid } from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import LocationOnIcon from "@material-ui/icons/LocationOn";

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
}

type Props = {
  setAddress: Function;
  position: string;
};

const PositionInfo: React.FC<Props> = props => {
  const classes = positionInfoStyles();

  // component/state
  const [value, setValue] = useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState<Array<PlaceType>>([]);
  const [isValidateLocation, setIsValidateLocation] = useState(true);
  const [place] = useState<PlaceType>({
    description: `日本、${props.position}`,
    structured_formatting: {
      main_text: "",
      secondary_text: "",
      main_text_matched_substrings: [{ offset: 0, length: 1 }]
    }
  });

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string; componentRestrictions: { country: "jp" } },
          callback: (results?: PlaceType[]) => void
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

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const valueCount = event.target.value.length;
    if (valueCount === 0) {
      setIsValidateLocation(false);
    } else {
      setIsValidateLocation(true);
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    const valueCount = (event.target as HTMLInputElement).value.length;
    if (valueCount === 0) {
      setIsValidateLocation(false);
    } else {
      setIsValidateLocation(true);
    }
  };
  useEffect(() => {
    let active = true;

    if (!autocompleteService.current && (window as any).google) {
      autocompleteService.current = new (window as any).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch(
      { input: inputValue, componentRestrictions: { country: "jp" } },
      (results?: PlaceType[]) => {
        if (active) {
          let newOptions = [] as PlaceType[];

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
    return () => {
      active = false;
    };
  }, [value, inputValue, fetch]);

  useEffect(() => {
    if (value?.description !== "日本、") {
      props.setAddress(value?.description.replace(/日本、/, ""));
    }
    // eslint-disable-next-line
  }, [value]);

  useEffect(() => {
    setValue(place);
    // eslint-disable-next-line
  }, []);

  return (
    <Autocomplete
      id="google-map-demo"
      getOptionLabel={option =>
        typeof option === "string"
          ? option
          : option.description.replace(/日本、/, "")
      }
      filterOptions={x => x}
      options={options}
      autoComplete
      includeInputInList
      filterSelectedOptions
      value={value}
      onChange={(event: any, newValue: PlaceType | null) => {
        setOptions(newValue ? [newValue, ...options] : options);
        setValue(newValue);
      }}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
      }}
      renderInput={params => (
        <TextField
          {...params}
          label={"場所を追加"}
          variant={"outlined"}
          size={"small"}
          fullWidth
          className={classes.textField}
          onKeyUp={handleKeyUp}
          onChange={handleChange}
          helperText={!isValidateLocation ? "場所を入力してください" : " "}
          error={!isValidateLocation}
        />
      )}
      renderOption={option => {
        const matches =
          option.structured_formatting.main_text_matched_substrings;
        const parts = parse(
          option.structured_formatting.main_text,
          matches.map((match: any) => [
            match.offset,
            match.offset + match.length
          ])
        );

        return (
          <Grid container alignItems="center">
            <Grid item>
              <LocationOnIcon className={classes.icon} />
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
              <Typography variant="body2" color="textSecondary">
                {option.structured_formatting.secondary_text}
              </Typography>
            </Grid>
          </Grid>
        );
      }}
    />
  );
};

const positionInfoStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(2)
  },
  textField: {
    width: "100%"
  }
}));

export default PositionInfo;
