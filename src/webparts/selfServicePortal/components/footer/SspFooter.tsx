import { Text } from "office-ui-fabric-react";
import * as React from "react";
import styles from "./footer.module.scss";
import { FontSizes } from "@fluentui/theme";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPendingSubmissions } from "../../store/slicers/toolsSlicer";
import { SoftwareItem } from "../../model";

interface IFooter {}

export const SspFooter: React.FC<IFooter> = () => {
  const { pendingTools } = useSelector((state) => state.tool);

  return (
    <div className={styles.footer}>
      <div className={styles.row}>
        <div className={styles.column2 + " " + styles.firstSection}>
          <Text className={styles.fHeader}>LATEST</Text>
          <p className={styles.fCaption}>Recently Uploaded by Contributors</p>
        </div>
        <div className={styles.column2 + " " + styles.firstSection}>
          {pendingTools &&
            pendingTools.length > 0 &&
            pendingTools.map((t) => <Text>{t.title}</Text>)}
        </div>
        <div className={styles.column2 + " " + styles.secondSection}>
          <Text className={styles.fHeader}>POPULAR</Text>
          <p className={styles.fCaption}>Most frequently used tools</p>
        </div>
        <div className={styles.column3 + " " + styles.secondSection}>
          <Text style={{ fontSize: FontSizes.size20 }}>Compliance Checker</Text>
        </div>
        <div className={styles.column3 + " " + styles.firstSection}>
          <Text style={{ fontSize: FontSizes.size20 }}>Search Tools</Text>
        </div>
      </div>
    </div>
  );
};
