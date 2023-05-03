import { useBoolean, useId } from "@fluentui/react-hooks";
import { mergeStyleSets } from "@uifabric/styling";
import {
  Callout,
  DefaultButton,
  DetailsList,
  DirectionalHint,
  FontWeights,
  getTheme,
  IColumn,
  Icon,
  IconButton,
  IIconProps,
  IPersonaProps,
  Link,
  Modal,
  Persona,
  PersonaPresence,
  PersonaSize,
  PrimaryButton,
  SelectionMode,
  Stack,
  TextField,
  TooltipHost,
} from "office-ui-fabric-react";
import React from "react";
import { useSelector } from "react-redux";
import { HopperFeature } from "../../model";
import gs from "../../styles/sspStyle.module.scss";

const classNames = mergeStyleSets({
  badgerIconImg: {
    verticalAlign: "middle",
    maxHeight: "25px",
    maxWidth: "25px",
  },
  controlWrapper: {
    display: "flex",
    flexWrap: "wrap",
  },
  exampleToggle: {
    display: "inline-block",
    marginBottom: "10px",
    marginRight: "30px",
  },
  selectionDetails: {
    marginBottom: "20px",
  },
  headerStyle: {
    fontSize: "12px !important",
    fontWeight: "bold !important",
    color: "#092d74 !important",
  },
});

const columns: IColumn[] = [
  {
    key: "column1",
    name: "",
    fieldName: "badgeClassImageUrl",
    minWidth: 25,
    maxWidth: 25,
    onRender: (item) => (
      <TooltipHost content={item.badgeClassName}>
        <a
          href={`https://badgr.com/public/assertions/${item.assertionId}`}
          target="_blank"
        >
          <img
            src={item.badgeClassImageUrl.Url}
            className={classNames.badgerIconImg}
            alt={item.badgeClassName}
            title={item.narrative}
          />
        </a>
      </TooltipHost>
    ),
  },
  {
    key: "column2",
    name: "Badge",
    headerClassName: classNames.headerStyle,
    fieldName: "badgeClassName",
    minWidth: 150,
    maxWidth: 250,
    isRowHeader: true,
    data: "string",
    isPadded: true,
    onRender: (item) => (
      <TooltipHost content={item.description}>
        <a
          href={`https://badgr.com/public/assertions/${item.assertionId}`}
          target="_blank"
        >
          {item.badgeClassName}
        </a>
      </TooltipHost>
    ),
  },
  {
    key: "column3",
    name: "Issued On",
    fieldName: "issuedOn",
    headerClassName: classNames.headerStyle,
    minWidth: 70,
    maxWidth: 90,
    data: "dateTime",
    onRender: (item) => {
      return <span>{new Date(item.issuedOn).toLocaleDateString()}</span>;
    },
    isPadded: true,
  },
  {
    key: "column4",
    name: "Accepted",
    fieldName: "acceptance",
    headerClassName: classNames.headerStyle,
    minWidth: 70,
    maxWidth: 90,
    data: "string",
    onRender: (item) => {
      return (
        <Icon
          title={item.acceptance ? "Accepted" : "Not yet accepted"}
          iconName={item.acceptance ? "BoxCheckmarkSolid" : "BoxMultiplySolid"}
          style={
            item.acceptance
              ? { color: "green", fontSize: "20px" }
              : { color: "red", fontSize: "20px" }
          }
        />
      );
    },
    isPadded: true,
  },
];

const BadgesCallout = (props) => {
  const [isCalloutVisible, { toggle: toggleIsCalloutVisible }] =
    useBoolean(false);
  const buttonId = useId("callout-button");
  const labelId = useId("callout-label");
  const descriptionId = useId("callout-description");

  return (
    <div className={gs.ph30}>
      <Link
        id={buttonId}
        onClick={toggleIsCalloutVisible}
        className={gs.fCaption_blue}
      >
        <Icon iconName="MedalSolid" className={gs.ph5} />
        {isCalloutVisible ? "Hide Badges" : "Show Badges"}
      </Link>
      {isCalloutVisible && (
        <Callout
          ariaLabelledBy={labelId}
          ariaDescribedBy={descriptionId}
          role="alertdialog"
          gapSpace={10}
          beakWidth={20}
          target={`#${buttonId}`}
          onDismiss={toggleIsCalloutVisible}
          setInitialFocus
          directionalHint={DirectionalHint.rightCenter}
        >
          <DetailsList
            items={props.userBadges}
            columns={columns}
            compact
            isHeaderVisible={true}
            selectionMode={SelectionMode.none}
          />
        </Callout>
      )}
    </div>
  );
};

const _onRenderPrimaryText = (props: IPersonaProps, email) => {
  return <a href={`mailTo:${email}`}>{props.text}</a>;
};

type TProps = {
  name: string;
  email: string;
  showEditIcon?: boolean;
  bio?: string;
  setBio?: any;
  deleteUser?: any;
};

export const ContactInfo: React.FC<TProps> = (props) => {
  const { allBadges, features } = useSelector((state) => state.app);
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const badgrFeature: HopperFeature = features.filter(
    (f) => f.title === "Badgr"
  )[0];
  const userBadges = allBadges
    ? allBadges.filter(
        (c) => c.recipientEmail.toLowerCase() === props.email.toLowerCase()
      )
    : [];

  const labelId: string = useId("dialogLabel");
  const modalPropsStyles = { main: { minWidth: "340px" } };

  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] =
    useBoolean(false);
  const titleId = useId("title");
  const cancelIcon: IIconProps = { iconName: "Cancel" };
  const uniqueUserBadges = [
    ...new Map(
      userBadges.map((item) => [item["badgeClassName"], item])
    ).values(),
  ];

  const showBadges =
    badgrFeature.turnedOn && userBadges && userBadges.length > 0;

  return (
    <Stack className={gs.pv5} horizontal>
      <Stack.Item>
        {props.showEditIcon && (
          <Icon
            iconName="EditContact"
            style={{ fontSize: 25, cursor: "pointer", paddingRight: "5px" }}
            onClick={showModal}
          ></Icon>
        )}
      </Stack.Item>
      <Stack.Item>
        <Persona
          className={gs.wrapAnchor}
          imageUrl={`https://outlook.office365.com/owa/service.svc/s/GetPersonaPhoto?email=${props.email}`}
          size={PersonaSize.size24}
          presence={PersonaPresence.none}
          text={props.name}
          onRenderPrimaryText={(p) => _onRenderPrimaryText(p, props.email)}
          styles={{
            primaryText: {
              fontSize: "12px",
              fontWeight: "bold",
              color: "#3055a6",
              overflowWrap: "break-word",
              wordBreak: "break-all",
              overflow: "auto",
            },
            textContent: {
              overflowWrap: "break-word",
              wordBreak: "break-all",
            },
          }}
        />
        {showBadges && <BadgesCallout userBadges={uniqueUserBadges} />}
      </Stack.Item>

      <Modal
        titleAriaId={titleId}
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={true}
      >
        <div className={contentStyles.header}>
          <span id={titleId}>{props.name}</span>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideModal}
          />
        </div>
        <div className={contentStyles.body}>
          <TextField
            multiline
            rows={8}
            value={props.bio}
            styles={{ root: { minWidth: "500px" } }}
            onChange={(e, v) => (props.bio = v)}
          ></TextField>
          <div style={{ paddingTop: "10px" }}>
            <Stack horizontal horizontalAlign="space-between">
              <PrimaryButton
                onClick={() => {
                  props.setBio(props.email, props.bio);
                  hideModal();
                }}
                text="Update Contact"
              />
              <PrimaryButton
                style={{ backgroundColor: "red" }}
                onClick={() => {
                  props.deleteUser(props.email);
                  hideModal();
                }}
                text="Delete Contact"
              />
              <DefaultButton onClick={hideModal} text="Cancel" />
            </Stack>
          </div>
        </div>
      </Modal>
    </Stack>
  );
};

const theme = getTheme();
const contentStyles = mergeStyleSets({
  container: {
    display: "flex",
    flexFlow: "column nowrap",
    alignItems: "stretch",
  },
  header: [
    // eslint-disable-next-line deprecation/deprecation
    theme.fonts.xLargePlus,
    {
      flex: "1 1 auto",
      borderTop: `4px solid ${theme.palette.themePrimary}`,
      color: theme.palette.neutralPrimary,
      display: "flex",
      alignItems: "center",
      fontWeight: FontWeights.semibold,
      padding: "12px 12px 14px 24px",
    },
  ],
  body: {
    flex: "4 4 auto",
    padding: "0 24px 24px 24px",
    overflowY: "hidden",
    selectors: {
      p: { margin: "14px 0" },
      "p:first-child": { marginTop: 0 },
      "p:last-child": { marginBottom: 0 },
    },
  },
});
const toggleStyles = { root: { marginBottom: "20px" } };
const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: "auto",
    marginTop: "4px",
    marginRight: "2px",
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};
