import { useId } from "@uifabric/react-hooks";
import {
  CommandBarButton,
  IStackProps,
  IStackStyles,
  Label,
  SearchBox,
  Stack,
  Text,
} from "office-ui-fabric-react";
import { INavStyles } from "office-ui-fabric-react/lib/Nav";
import * as React from "react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { HorizontalDivider } from "../../selfServicePortal/components";
import { listService } from "../../selfServicePortal/services";
import gs from "../../selfServicePortal/styles/sspStyle.module.scss";
import { NavSection } from "./NavSection";

const navStyles: Partial<INavStyles> = {};

const stackTokens = { childrenGap: 30 };
const iconProps = { iconName: "Calendar" };
const stackStyles: Partial<IStackStyles> = { inner: { paddingLeft: "20px" } };
const columnProps: Partial<IStackProps> = {
  tokens: { childrenGap: 15 },
  styles: { root: { width: 300 } },
};

type TProps = {
  searchHandler: any;
  keyword?: string;
};

export const LeftNav: React.FC<TProps> = (props) => {
  const [entities, setEntities] = useState([]);
  const searchId = useId("searchInput");

  useEffect(() => {
    const init = async () => {
      await listService.getLeftNavItems().then((result) => {
        setEntities(result);
      });
    };
    init();
  }, []);

  return (
    <Stack tokens={stackTokens}>
      <div className={`${gs.bg_grey} ${gs.p20}`}>
        <Label htmlFor={searchId} className={gs.fHeader}>
          Search Tools
        </Label>
        <SearchBox
          id={searchId}
          placeholder="Enter Keywords"
          onSearch={(v) => props.searchHandler(v)}
          onClear={(v) => props.searchHandler("")}
          iconProps={{ iconName: "Search" }}
          value={props.keyword}
        />
        <div className={`${gs.bg_grey} ${gs.p20}`} />
      </div>
      <div className={gs.pl20}>
        <Text className={gs.fHeader}>BROWSE</Text>
        <a href={"/sites/hopper/SitePages/toolsIncubator.aspx#/tools/all"}>
          <Text
            className={gs.textLink}
            style={{ float: "right", paddingRight: "20px" }}
          >
            View All
          </Text>
        </a>
        <HorizontalDivider />
        {entities &&
          entities.map((g) => {
            const expanded = false;
            return <NavSection section={g} expand={expanded} />;
          })}
      </div>
      <div className={gs.p20}>
        <a href="/sites/hopper">
          <CommandBarButton
            style={{
              backgroundColor: "#3055a6",
              padding: "20px",
            }}
            iconProps={{ iconName: "ChevronLeft" }}
            styles={{
              label: { fontWeight: "bolder", color: "white" },
              icon: { color: "white", fontSize: "30px" },
            }}
            text="BACK TO HOME"
            ariaLabel="BACK TO HOME"
          />
        </a>
      </div>
    </Stack>
  );
};
