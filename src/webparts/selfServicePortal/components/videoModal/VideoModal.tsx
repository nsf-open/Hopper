import { useBoolean, useId } from "@fluentui/react-hooks";
import {
  FontWeights,
  getTheme,
  IButtonStyles,
  IconButton,
  IIconProps,
  IStackProps,
  mergeStyleSets,
  Modal,
} from "office-ui-fabric-react";
import * as React from "react";

type TProps = {
  title: string;
  streamId: string;
  showModal: boolean;
  onCancel: any;
};

export const VideoModal: React.FC<TProps> = (props) => {
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(
    props.showModal
  );
  const [isDraggable, { toggle: toggleIsDraggable }] = useBoolean(false);

  // Use useId() to ensure that the IDs are unique on the page.
  // (It's also okay to use plain strings and manually ensure uniqueness.)
  const titleId = useId("title");

  return (
    <div>
      <Modal
        titleAriaId={titleId}
        isOpen={props.showModal}
        onDismiss={hideModal}
        isBlocking={false}
        containerClassName={contentStyles.container}
      >
        <div className={contentStyles.header}>
          <span id={titleId}>{props.title}</span>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={props.onCancel}
          />
        </div>
        <div className={contentStyles.body}>
          <iframe
            allowFullScreen
            width="640"
            height="360"
            src={`https://web.microsoftstream.com/embed/video/${props.streamId}?autoplay=false&showinfo=true`}
            style={{ border: "none" }}
          ></iframe>
        </div>
      </Modal>
    </div>
  );
};

const cancelIcon: IIconProps = { iconName: "Cancel" };

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
const stackProps: Partial<IStackProps> = {
  horizontal: true,
  tokens: { childrenGap: 40 },
  styles: { root: { marginBottom: 20 } },
};
const iconButtonStyles: Partial<IButtonStyles> = {
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
