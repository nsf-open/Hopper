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
import { useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import gs from "../../styles/sspStyle.module.scss";
import { HorizontalDivider } from "../divider/HorizontalDivider";
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
  const { tag } = useParams();
  const searchId = useId("searchInput");
  const { entities } = useSelector((state) => state.nav);

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
        <Link to={"/tools/all"}>
          <Text
            className={gs.textLink}
            style={{ float: "right", paddingRight: "20px" }}
          >
            View All
          </Text>
        </Link>
        <HorizontalDivider />
        {entities &&
          entities.map((g) => {
            const expanded = g.links.some((l) => l.key === tag);
            return (
              <NavSection section={g} expand={expanded} selectedTag={tag} />
            );
          })}
      </div>
      <div className={gs.p20}>
        <Link to={`/`}>
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
        </Link>
      </div>
    </Stack>
  );
};
