import * as React from "react";
import { escape } from "@microsoft/sp-lodash-subset";
import { Image, Text } from "office-ui-fabric-react";
import styles from "./HopperFooter.module.scss";

export const HopperFooter: React.FC = () => {
  return (
    <div className={styles.hopperFooter}>
      <div className={styles.container}>
        <div className={`${styles.row} ${styles.home}  ${styles.footer}`}>
          <div
            className={`${styles.cl9} ${styles.br_grey} ${styles.bl_grey15}`}
          >
            <Image
              className={styles.logoCenter}
              src="/sites/hopper/SiteAssets/images/IMG_LOGO_FINAL_SINGLE.png"
              width="525px"
            />
          </div>
          <div className={styles.cl3}>
            <div className={styles.p20}>
              <Text className={styles.fHeader_white}>Got questions?</Text>
              <br />
              <Text className={styles.fHeader_white}>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
