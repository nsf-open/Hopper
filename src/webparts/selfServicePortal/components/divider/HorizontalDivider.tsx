import * as React from "react";
import styles from "./horizontalDivider.module.scss";

type TProps = {
  className?: string;
  style?: any;
};

export const HorizontalDivider: React.FC<TProps> = (props) => {
  return (
    <div
      className={`${styles.divider} ${props.className}`}
      style={props.style}
    />
  );
};
