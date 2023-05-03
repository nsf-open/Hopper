import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { useBoolean, useId } from "@uifabric/react-hooks";
import {
  DefaultButton,
  Label,
  Panel,
  PrimaryButton,
  SearchBox,
  Text,
  TextField,
} from "office-ui-fabric-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { HorizontalDivider, NavCategory, SspSpinner } from "../components";
import { SoftwareItemRow } from "../components/softwareItem/SoftwareItemRow";
import { SoftwareItem, ToolStatus } from "../model";
import { getFeaturedTool } from "../store/slicers";
import { addNewSoftwareTool } from "../store/slicers/toolsSlicer";
import styles from "../styles/sspStyle.module.scss";
import { useHistory } from "react-router-dom";
import useWebtrends from "../hooks/useWebtrends";

type TProps = {
  context: WebPartContext;
};

export const Home: React.FC<TProps> = (props) => {
  const history = useHistory();
  const { featuredTool, recentTools, frequentTools } = useSelector(
    (state) => state.tool
  );
  const searchId = useId("searchInput");
  const { loading, error, resources, articles } = useSelector(
    (state) => state.app
  );
  const { entities } = useSelector((state) => state.nav);

  const [toolName, setToolName] = useState("");
  const [creator, setCreator] = useState([]);
  const [toolDescription, setToolDescription] = useState("");
  const dispatch = useDispatch();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(
    false
  );

  useEffect(() => {
    const init = async () => {
      await dispatch(getFeaturedTool());
    };
    init();
    window.scrollTo(0, 0);
  }, []);

  const createNewTool = async (e) => {
    e.preventDefault();
    if (
      checkIfNameEmpty(toolName) +
      checkIfCreatorEmpty(creator) +
      checkIfDescriptionEmpty(toolDescription)
    )
      return;
    const newItem: SoftwareItem = {
      title: toolName,
      pocs: creator.map((c) => c.id),
      status: ToolStatus.Draft,
      description: toolDescription,
      viewCount: 0,
      links: [],
    };
    const result = await dispatch(addNewSoftwareTool(newItem));
    if (addNewSoftwareTool.fulfilled.match(result)) {
      setToolName("");
      setCreator(null);
      setToolDescription("");
      dismissPanel();
    }
  };

  const onRenderFooterContent = () => (
    <div>
      <PrimaryButton onClick={(e) => createNewTool(e)}>Start</PrimaryButton>
      {"      "}
      <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
    </div>
  );

  const onSearchClicked = (keyword) => {
    if (keyword && keyword.trim()) return history.push(`/search/${keyword}`);
  };

  const getPeoplePickerItems = (items: any[]) => {
    setCreator(items);
  };

  const checkIfNameEmpty = (value) => {
    if (!value) return "Tool Name is Required";
    return "";
  };
  const checkIfCreatorEmpty = (value) => {
    if (!value || value.length == 0) return "Creator Name is Required";
    return "";
  };
  const checkIfDescriptionEmpty = (value) => {
    if (!value) return "Description is Required";
    return "";
  };

  if (error) throw error;

  return (
    <SspSpinner condition={loading === "pending"}>
      <div className={`${styles.bg_wh} ${styles.row}`}>
        <div className={styles.cl6}>
          <div>
            <Text className={styles.siteName}>NSF</Text>
          </div>
          <div>
            <Text className={styles.siteName}>TOOLS</Text>
          </div>
          <div>
            <Text className={styles.siteName}>INCUBATOR</Text>
          </div>
        </div>
        <div className={styles.cl6}>
          <p className={styles.fCaption_blue}>
            NSF has a variety of locally innovated tools that are distributed
            among the directorates. The goal of this portal is to provide a
            platform that consolidate, organize, and classify local tools to
            reduce duplication, increase transparency and foster collaboration.
            The portal will support a Community of Practice (CoP) to leverage
            local innovators and new tools (or new ways to use existing tools)
            and is governed by the Innovation Management Group (IMG).
          </p>
          <p className={styles.fCaption_blue}>
            When tools are posted to the portal, they become visible to everyone
            at NSF and supports IMG's aim to encourage more rapid maturation and
            uptake of our local innovations. The portal is maintained by DIS,
            but the content, the solutions, come from you.
          </p>
          <p className={styles.fCaption_blue}>
            This portal name is in honor of Grace Hopper - a pioneering computer
            scientist, great mathematician and decorated Navy Admiral - a
            trailblazer in many aspects! In fact, her legacy was an inspiring
            factor in the creation of the Grace Hopper Celebration of Women
            (GHC) in Computing. To amplify the impact,{" "}
            <a
              href="https://nsf.gov/awardsearch/showAward?AWD_ID=1840724"
              target="_blank"
            >
              NSF supports the Computing Research Association’s Committee on
              Widening Participation in Computing Research (CRA-WP) GHC Research
              Scholars Program
            </a>
          </p>
        </div>
      </div>
      <div className={`${styles.row} ${styles.home}`}>
        <div className={styles.cl9Bg}>
          <div className={styles.pb20}>
            <Text className={styles.subHeader}>FEATURED</Text>
            <br />
            <Text className={styles.subCaption}>Tool of the Month</Text>
          </div>
          {featuredTool && (
            <SoftwareItemRow item={featuredTool} showAttributes={true} />
          )}
        </div>
        <div className={`${styles.cl3} ${styles.bg_deepBlue}`}>
          <Text className={styles.subHeader_gray}>ABOUT</Text>
          <HorizontalDivider className={styles.divider_gray} />
          <p className={styles.fCaption}>
            The Hopper – NSF Tools Incubator portal is a place to post and share
            locally created tools and solutions from across NSF that improve our
            day-to-day operations. IMG is interested in all sorts of useful
            solutions from simple templates or efficient workflow documentations
            to software automations and beyond.
          </p>
          <p className={styles.fCaption}>
            Use the "Suggest a Tool" button below to kick-start our Tools Intake
            Form. You can either submit something you made or nominate something
            you have seen that someone else made. The form asks a few basic
            questions to guide IMG in follow-up. If submitting your own
            creation, there are additional optional questions that can
            accelerate the initial review, intake and assess the tool against a
            Tools Maturity Stage model that the IMG developed to help
            communicate key information about the tool.
          </p>
          <PrimaryButton
            text="Suggest a Tool"
            onClick={openPanel}
            style={{ backgroundColor: "#d0dd28", color: "#3055a6" }}
          />
        </div>
      </div>
      <div className={`${styles.row} ${styles.bg_wh} ${styles.footer}`}>
        <div className={`${styles.cl2} ${styles.bg_grey} ${styles.br_white}`}>
          <Text className={styles.fHeader}>LATEST</Text>
          <p className={styles.fListItem}>Recently Added Tools</p>
        </div>
        <div className={`${styles.cl3} ${styles.bg_grey}  ${styles.br_white}`}>
          {recentTools &&
            recentTools.length > 0 &&
            recentTools.map((t) => (
              <div>
                <Link to={`/tool/${t.Id}`} className={styles.fListItem}>
                  {t.title}
                </Link>
              </div>
            ))}
        </div>
        <div
          className={`${styles.cl2} ${styles.bg_lghtGrey} ${styles.br_white}`}
        >
          <Text className={styles.fHeader}>POPULAR</Text>
          <p className={styles.fListItem}>Most Frequently Viewed Tools</p>
        </div>
        <div
          className={`${styles.cl2} ${styles.bg_lghtGrey}  ${styles.br_white}`}
        >
          {frequentTools &&
            frequentTools.length > 0 &&
            frequentTools.map((t) => (
              <div>
                <Link to={`/tool/${t.Id}`} className={styles.fListItem}>
                  {t.title}
                </Link>
              </div>
            ))}
        </div>
        <div className={`${styles.cl3} ${styles.bg_grey}`}>
          <Label htmlFor={searchId} className={styles.fHeader}>
            Search Tools
          </Label>
          <SearchBox
            id={searchId}
            placeholder="Enter Keywords"
            onSearch={(v) => onSearchClicked(v)}
            onClear={(v) => onSearchClicked("")}
            iconProps={{ iconName: "Search" }}
          />
        </div>
      </div>
      <div className={`${styles.row} ${styles.bg_wh}`}>
        <div className={styles.cl} />
      </div>

      <div className={`${styles.row}`}>
        <div className={`${styles.br_grey} ${styles.cl9}`}>
          <div>
            <Text className={styles.subHeader}>BROWSE TOOLS</Text>
          </div>
          {entities &&
            entities.map((section, index) => {
              return (
                index % 2 == 0 && (
                  <div className={styles.row}>
                    <div className={styles.cl6}>
                      <NavCategory section={entities[index]} />
                    </div>
                    <div className={styles.cl6}>
                      <NavCategory section={entities[index + 1]} />
                    </div>
                  </div>
                )
              );
            })}
        </div>
        <div className={styles.cl3}>
          <div className={styles.p20}>
            <Text className={styles.fHeader_blue}>Resources</Text>
            <HorizontalDivider
              className={styles.bg_blue}
              style={{ height: "4px" }}
            />
            {resources &&
              resources.map((res) => {
                return (
                  <>
                    <a
                      href={res.url}
                      target="_blank"
                      style={{ textDecoration: "none" }}
                    >
                      <div className={`${styles.pv5} ${styles.homeNav}`}>
                        <Text>{res.title}</Text>
                      </div>
                    </a>
                    <HorizontalDivider
                      className={styles.bg_yellow}
                      style={{ height: "1px" }}
                    />
                  </>
                );
              })}
          </div>
          {/* <div className={styles.p20}>
            <Text className={styles.fHeader_blue}>Articles</Text>
            <HorizontalDivider
              className={styles.bg_blue}
              style={{ height: "4px" }}
            />
            {articles &&
              articles.map((res) => {
                return (
                  <div className={styles.pv5}>
                    <Text>{res.description}</Text>
                  </div>
                );
              })}
          </div> */}
        </div>
      </div>

      <Panel
        isLightDismiss
        isOpen={isOpen}
        onDismiss={dismissPanel}
        headerText="Suggest a New Tool"
        closeButtonAriaLabel="Close"
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
      >
        <TextField
          label="Tool Name"
          placeholder="Enter tool name"
          required
          onGetErrorMessage={checkIfNameEmpty}
          value={toolName}
          onChange={(e, v) => setToolName(v)}
        />
        <PeoplePicker
          context={props.context}
          titleText="Creator Name"
          showtooltip={true}
          personSelectionLimit={5}
          required={true}
          ensureUser
          placeholder={"Enter creator Name"}
          onChange={getPeoplePickerItems}
          onGetErrorMessage={checkIfCreatorEmpty}
          showHiddenInUI={false}
          principalTypes={[PrincipalType.User]}
          resolveDelay={1000}
        />
        <TextField
          label="Tool Description"
          required
          multiline
          autoAdjustHeight
          onGetErrorMessage={checkIfDescriptionEmpty}
          placeholder="Enter Description"
          value={toolDescription}
          onChange={(e, v) => setToolDescription(v)}
        />
      </Panel>
    </SspSpinner>
  );
};
