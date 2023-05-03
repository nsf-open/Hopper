import * as React from "react";
import { LeftNav } from "./LeftNav";
import styles from "../../selfServicePortal/styles/sspStyle.module.scss";
import { HashRouter } from "react-router-dom";

export const LeftNavigation: React.FC = () => {
  const searchHandler = (searchKey: string) => {
    if (searchKey && searchKey.trim())
      window.location.replace(
        `/sites/hopper/SitePages/toolsIncubator.aspx#/search/${searchKey}`
      );
  };

  return (
    <HashRouter>
      <div className={styles.selfServicePortal}>
        <div className={styles.content}>
          <div className={` ${styles.ph0} ${styles.navColumn}`}>
            <LeftNav searchHandler={searchHandler} />
          </div>
        </div>
      </div>
    </HashRouter>
  );
};
