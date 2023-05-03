import {
  IconButton,
  IPersonaProps,
  ITooltipHostStyles,
  ITooltipProps,
  Link as LinkFUI,
  Rating,
  Stack,
  Text,
  TextField,
} from "office-ui-fabric-react";
import * as React from "react";
import { Link } from "react-router-dom";
import ShowMoreText from "react-show-more-text";
import { SoftwareItem, ToolStatus } from "../../model/SoftwareItem";
import gs from "../../styles/sspStyle.module.scss";
import { ContactInfo } from "../contactInfo";
import { HorizontalDivider } from "../divider/HorizontalDivider";
import styles from "./softwareItemRow.module.scss";

interface ISoftwareItemRow {
  item: SoftwareItem;
  showAttributes: boolean;
  className?: string;
  editMode?: boolean;
}

const tokens = {
  sectionStack: {
    childrenGap: 10,
  },
  headingStack: {
    childrenGap: 5,
  },
  contentStack: {
    childrenGap: 5,
  },
};

const tooltipProps: ITooltipProps = {
  onRenderContent: () => (
    <ul style={{ margin: 10, padding: 0 }}>
      <li>1. One</li>
      <li>2. Two</li>
    </ul>
  ),
};
const hostStyles: Partial<ITooltipHostStyles> = {
  root: { display: "inline-block" },
};

const _onRenderPrimaryText = (props: IPersonaProps, email) => {
  return <a href={`mailTo:${email}`}>{props.text}</a>;
};

export const SoftwareItemRow: React.FC<ISoftwareItemRow> = (props) => {
  const isApporved = props.item.status === ToolStatus.Approved;

  return (
    <div className={`${styles.softwareItemRow} ${props.className}`}>
      <Stack tokens={tokens.sectionStack}>
        <Stack tokens={tokens.headingStack}>
          <Link to={`/tool/${props.item.Id}`}>
            {props.editMode ? (
              <TextField value={props.item.title}></TextField>
            ) : (
              <Text className={styles.toolName}>{props.item.title}</Text>
            )}
          </Link>
        </Stack>
        <HorizontalDivider />
        <Stack tokens={tokens.contentStack}>
          <div className={styles.itemRow}>
            {props.editMode ? (
              <TextField
                multiline
                rows={4}
                value={props.item.description}
              ></TextField>
            ) : (
              <ShowMoreText
                className={gs.fCaption_blue}
                lines={3}
                more="See more"
                less="See less"
                expanded={false}
              >
                {props.item.description}
              </ShowMoreText>
            )}
          </div>
        </Stack>
        <HorizontalDivider />
        {isApporved && props.showAttributes && (
          <Stack tokens={tokens.contentStack}>
            <div className={styles.itemRow}>
              <div className={styles.attributes}>
                <div className={styles.moreInfo}>MORE INFO</div>
                <div className={styles.averageRatings}>
                  <Text className={styles.header}>Ratings</Text>
                </div>
                <div className={styles.creator}>
                  <Text className={styles.header}>Point of Contact</Text>
                </div>
                <div className={styles.maturity}>
                  <Text className={styles.header}>Tool Maturity Stage</Text>
                </div>
                <div className={styles.guide}>
                  <Text className={styles.header}>Guide</Text>
                </div>
                <div className={styles.testimony}>
                  <Text className={styles.header}>Reviews</Text>
                </div>
              </div>
              <div className={styles.attributes + " " + styles.attributesValue}>
                <div className={styles.moreInfo}>
                  <Link to={`/tool/${props.item.Id}`}>
                    <IconButton
                      style={{
                        backgroundColor: "#477aa8",
                        width: "120px",
                        color: "white",
                      }}
                      iconProps={{ iconName: "ChevronRight" }}
                      title="More Information"
                      ariaLabel="More Information"
                    />
                  </Link>
                </div>
                <div className={styles.averageRatings}>
                  <Rating
                    allowZeroStars
                    min={0}
                    max={5}
                    readOnly
                    rating={
                      props.item.ratingCount == 0
                        ? 0
                        : props.item.averageRatings
                    }
                  />
                  <Text
                    className={gs.fCaption_blue_small}
                  >{`${props.item.ratingCount} Ratings`}</Text>
                </div>
                <div className={styles.creator}>
                  {props.item.pocs.map((c, i) => (
                    <ContactInfo name={c.name} email={c.email} />
                  ))}
                </div>
                <div className={styles.maturity}>
                  <LinkFUI
                    href={`/sites/hopper/SitePages/MaturityModel.aspx`}
                    target="_blank"
                    underline
                  >
                    <Text
                      className={gs.fCaption_blue_small}
                      style={{ textDecoration: "underline" }}
                    >
                      {props.item.maturity}
                    </Text>
                  </LinkFUI>
                </div>
                <div className={styles.guide}>
                  {props.item.guide && (
                    <a
                      onClick={() =>
                        window.open(props.item.guide.Url, "_blank")
                      }
                      className={`${gs.textLink} ${gs.fCaption_blue_small}`}
                    >
                      {props.item.guide.Description}
                    </a>
                  )}
                </div>
                <div className={styles.testimony}>
                  <Link to={`/tool/${props.item.Id}`}>
                    <Text className={gs.fCaption_blue_small}>View</Text>{" "}
                  </Link>

                  {/* <PDFDownloadLink
                    document={<ToolPDF />}
                    fileName="somename.pdf"
                  >
                    {({ blob, url, loading, error }) =>
                      loading ? "Loading document..." : "Download now!"
                    }
                  </PDFDownloadLink> */}
                </div>
              </div>
            </div>
          </Stack>
        )}
      </Stack>
    </div>
  );
};
