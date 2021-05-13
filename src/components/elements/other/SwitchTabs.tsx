import React from "react";

import { Tabs, Tab, makeStyles } from "@material-ui/core";

export type TabContent = {
  label: string;
  //タブの識別番号
  value: number;
  //タブクリック時に実行する関数
  function: Function;
};

type Props = {
  tabContents: Array<TabContent>;
  selectedTabVal: number; //選択されているtabのId
};

const SwitchTabs: React.FC<Props> = props => {
  const classes = switchTabStyles();

  return (
    <Tabs
      className={classes.switchTabs}
      value={props.selectedTabVal}
      variant={"fullWidth"}
      centered={true}
      indicatorColor={"primary"}
      textColor={"primary"}
    >
      {props.tabContents.map((tabContent, index) => (
        <Tab
          label={tabContent.label}
          value={tabContent.value}
          onClick={() => tabContent.function()}
          key={index}
          className={classes.tab}
        />
      ))}
    </Tabs>
  );
};

const switchTabStyles = makeStyles(() => ({
  switchTabs: {
    width: "100%",
    zIndex: 1,
    height: "5vh",
    minHeight: "5vh",
    alignItems: "center",
    backgroundColor: "white"
  },
  tab: {
    height: "5vh",
    minHeight: "5vh"
  }
}));

export default SwitchTabs;