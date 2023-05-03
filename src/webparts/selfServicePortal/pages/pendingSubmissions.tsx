import { useId } from "@fluentui/react-hooks";
import { useBoolean } from "@fluentui/react-hooks/lib/useBoolean";
import { unwrapResult } from "@reduxjs/toolkit";
import { mergeStyleSets } from "@uifabric/styling";
import {
  CommandBarButton,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Dialog,
  DialogFooter,
  DialogType,
  FontWeights,
  getTheme,
  IColumn,
  IconButton,
  IIconProps,
  Link,
  Modal,
  PrimaryButton,
  SelectionMode,
  Stack,
  TextField,
} from "office-ui-fabric-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink, useHistory, useParams } from "react-router-dom";
import { SspSpinner } from "../components";
import useWebtrends from "../hooks/useWebtrends";
import { ToolStatus } from "../model";
import { updateSubmittedToolStatus } from "../store/slicers";
import { getToolVersions } from "../store/slicers/toolsSlicer";
import styles from "../styles/sspStyle.module.scss";

const setToolStatus = (status) => {};

const modalPropsStyles = { main: { maxWidth: 450 } };
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

export const PendingSubmissions: React.FC = () => {
  const { id } = useParams();
  const history = useHistory();
  const dispatch = useDispatch();
  useWebtrends();
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
  const { loading, error, isUserApprover } = useSelector((state) => state.app);
  const { myTools, pendingApprovals } = useSelector((state) => state.tool);
  const [toolsList, setToolsList] = useState([]);
  const [filteredList, setFilteredList] = useState(toolsList);
  const [approveDeclineText, setApproveDeclineText] = useState("");
  const [approverComment, setApproverComment] = useState("");
  const [selectedToolId, setSelectedToolId] = useState();
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] =
    useBoolean(false);
  const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);
  const [toolVersions, setToolVersions] = useState([]);

  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId("title");
  const cancelIcon: IIconProps = { iconName: "Cancel" };

  const enum approveDecline {
    Approve = "Approve",
    Decline = "Decline",
  }

  const modalProps = React.useMemo(
    () => ({
      styles: modalPropsStyles,
      isModeless: true,
    }),
    []
  );

  const vColumns: IColumn[] = [
    {
      key: "column1",
      name: "Version",
      fieldName: "VersionLabel",
      headerClassName: classNames.headerStyle,
      minWidth: 100,
      maxWidth: 100,
    },
    {
      key: "column2",
      name: "Created By",
      headerClassName: classNames.headerStyle,
      fieldName: "CreatedBy",
      minWidth: 250,
      isRowHeader: true,
      data: "string",
      onRender: (item) => {
        const i = item.CreatedBy.indexOf(")");
        return item.CreatedBy.slice(0, i + 1);
      },
      isPadded: true,
    },
    {
      key: "column3",
      name: "Created Date",
      fieldName: "CreatedDate",
      headerClassName: classNames.headerStyle,
      minWidth: 70,
      maxWidth: 90,
      data: "dateTime",
      onRender: (item) => {
        return <span>{new Date(item.CreatedDate).toLocaleDateString()}</span>;
      },
      isPadded: true,
    },
  ];

  useEffect(() => {
    let isCancelled = false;
    const loadVersions = async () => {
      const vResults = await dispatch(getToolVersions(selectedToolId));
      if (getToolVersions.fulfilled.match(vResults)) {
        const versions = unwrapResult(vResults);
        setToolVersions(versions);
      }
    };
    if (!isCancelled) loadVersions();
    return () => {
      isCancelled = true;
    };
  }, [selectedToolId]);

  useEffect(() => {
    let isCancelled = false;
    const loadAll = async () => {
      let allData = myTools.map((t) => {
        return {
          id: t.id,
          title: t.answerJson.Title,
          status: t.status,
          createdOn: t.createdOn,
          createdBy: t.createdBy,
          author: t.author,
          description: t.answerJson.Description,
        };
      });
      if (isUserApprover) {
        const approvals = pendingApprovals.map((t) => {
          return {
            id: t.id,
            title: t.answerJson.Title,
            status: t.status,
            createdOn: t.createdOn,
            createdBy: t.createdBy,
            author: t.author,
            description: t.answerJson.Description,
          };
        });
        allData = [...allData, ...approvals];
      }
      setToolsList(allData);
      setFilteredList(allData);
    };
    if (!isCancelled) loadAll();
    return () => {
      isCancelled = true;
    };
  }, [isUserApprover, myTools, pendingApprovals]);

  const onFilter = (ev, text): void => {
    setFilteredList(
      text
        ? toolsList.filter((i) => i.title.toLowerCase().indexOf(text) > -1)
        : toolsList
    );
  };

  const onVersionClick = (id): void => {
    showModal();
    setSelectedToolId(id);
  };

  const columns = [
    {
      key: "column1",
      name: "Title",
      fieldName: "title",
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column2",
      name: "Description",
      fieldName: "description",
      minWidth: 100,
      maxWidth: 300,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column3",
      name: "Status",
      fieldName: "status",
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column4",
      name: "Created On",
      fieldName: "createdOn",
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column5",
      name: "Tool Author/s",
      fieldName: "author",
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column6",
      name: "Created By",
      fieldName: "createdBy",
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    {
      key: "column7",
      name: "Version",
      fieldName: "version",
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      headerClassName: `${styles.fCaption_blue}`,
    },
    // },
    // {
    //   key: "column8",
    //   name: "Action",
    //   fieldName: "createdOn",
    //   minWidth: 100,
    //   maxWidth: 200,
    //   isResizable: true,
    //   headerClassName: `${styles.fCaption_blue}`,
    //   visible: isUserApprover,
    // },
  ];

  const renderItemColumn = (item, index, column: IColumn) => {
    const fieldContent = item[column.fieldName] as string;
    const itemStatus = item["status"];
    const itemId = item["id"];

    switch (column.name) {
      case "Title":
        return (
          <Link as={RouterLink} to={`/newTool/${item["id"]}`}>
            {fieldContent}
          </Link>
        );
      case "Created On":
        return <span>{new Date(fieldContent).toLocaleDateString()}</span>;
      case "Version":
        return (
          <Link onClick={() => onVersionClick(itemId)}>Version History</Link>
        );
      case "Action":
        return (
          itemStatus == ToolStatus.Submitted && (
            <Stack horizontal horizontalAlign="space-around">
              <PrimaryButton
                text="APPROVE"
                onClick={() =>
                  onAproveDeclineTool(itemId, approveDecline.Approve)
                }
                className={styles.accept}
              />
              <PrimaryButton
                text="DECLINE"
                onClick={() =>
                  onAproveDeclineTool(itemId, approveDecline.Decline)
                }
                className={styles.deny}
              />
            </Stack>
          )
        );
      default:
        return <span>{fieldContent}</span>;
    }
  };

  const onAproveDeclineTool = (id, action: approveDecline) => {
    //setSelectedToolId(id);
    //toggleHideDialog();
    //setApproveDeclineText(action);
  };

  const onApproverConfirm = () => {
    dispatch(
      updateSubmittedToolStatus({
        id: selectedToolId,
        status: approveDeclineText as ToolStatus,
        approverComment,
      })
    ).then(() => {
      setFilteredList((state) => state.filter((t) => t.id != selectedToolId));
    });

    toggleHideDialog();
  };

  const dialogContentProps = {
    type: DialogType.normal,
    title: `Are you sure you want to ${approveDeclineText.toLowerCase()} this tool?`,
  };

  if (error) throw error;
  return (
    <SspSpinner condition={!loading}>
      <Stack horizontal>
        <Stack.Item grow>
          <Link as={RouterLink} to={`/`}>
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
        </Stack.Item>
        <Stack.Item>
          <div className={styles.subHeader} style={{ margin: "0px" }}>
            Pending Submission
          </div>
        </Stack.Item>
      </Stack>
      <div className={`${styles.gradientBg} ${styles.ph40} ${styles.pv20}`}>
        <TextField
          label="Search:"
          onChange={onFilter}
          placeholder="search by tool title"
        />
        <div className={styles.pv20}>
          <DetailsList
            items={filteredList}
            columns={columns}
            onRenderItemColumn={renderItemColumn}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="select row"
          />
        </div>
        <Modal
          titleAriaId={titleId}
          isOpen={isModalOpen}
          onDismiss={hideModal}
          isModeless={true}
          containerClassName={contentStyles.container}
        >
          <div className={contentStyles.header}>
            <span id={titleId}>Tool Versions</span>
            <IconButton
              styles={iconButtonStyles}
              iconProps={cancelIcon}
              ariaLabel="Close popup modal"
              onClick={hideModal}
            />
          </div>

          <div className={contentStyles.body}>
            <DetailsList
              items={toolVersions}
              columns={vColumns}
              compact
              isHeaderVisible={true}
              selectionMode={SelectionMode.none}
            />
          </div>
        </Modal>
        <Dialog
          minWidth={500}
          hidden={hideDialog}
          onDismiss={toggleHideDialog}
          dialogContentProps={dialogContentProps}
          modalProps={modalProps}
        >
          <div>
            <TextField
              label="Comment: (Optional)"
              multiline
              rows={3}
              name="approverComment"
              onChange={(e, text) => {
                setApproverComment(text);
              }}
              value={approverComment}
            />
          </div>
          <DialogFooter>
            <PrimaryButton
              onClick={onApproverConfirm}
              text={approveDeclineText}
            />
            <DefaultButton onClick={toggleHideDialog} text="Cancel" />
          </DialogFooter>
        </Dialog>
      </div>
    </SspSpinner>
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
