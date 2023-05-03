import { WebPartContext } from "@microsoft/sp-webpart-base";
import { Image, Text } from "office-ui-fabric-react";
import * as React from "react";
import { Provider, useDispatch } from "react-redux";
import {
  HashRouter,
  Redirect,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import { ToolStatus } from "../model";
import {
  EditToolDetail,
  Home3,
  NewTool,
  PageNotFound,
  PendingSubmissions,
  Resources,
  SearchResults,
  TeamsIntegration,
  ToolDetail,
  ToolsList,
} from "../pages";
import store from "../store";
import {
  getAllUserBadges,
  getFrequentlyViewedTools,
  getHomePageArticles,
  getHomePageResources,
  getLeftNavigationItems,
  getMySubmittedTools,
  getPendingApprovalTools,
  getRecentlyAddedTools,
  getToolTags,
  isUserInApprroverGroup,
  loadHopperFeatures,
} from "../store/slicers";
import styles from "../styles/sspStyle.module.scss";
import ErrorBoundary from "./ErrorBoundary";

type TProps = {
  Context: WebPartContext;
  Graph: any;
};

const App: React.FC<TProps> = (props) => {
  const myRef = React.useRef(null);
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  dispatch(isUserInApprroverGroup());
  dispatch(getToolTags());
  dispatch(getRecentlyAddedTools());
  dispatch(getFrequentlyViewedTools());
  dispatch(getHomePageArticles());
  dispatch(loadHopperFeatures());
  dispatch(getHomePageResources());
  dispatch(getLeftNavigationItems());
  dispatch(getAllUserBadges());
  dispatch(getMySubmittedTools(ToolStatus.Pending));
  dispatch(getPendingApprovalTools());
  //useWebtrends();
  React.useEffect(() => {
    return () => {
      window.scrollTo(0, 100);
    };
  }, [pathname]);

  return (
    <div ref={myRef} className={styles.selfServicePortal}>
      <div className={styles.container}>
        <Switch>
          <Route
            exact
            path="/"
            render={(prop) => <Home3 context={props.Context} {...prop} />}
          />
          <Route
            exact
            path="/submissions/:status"
            component={PendingSubmissions}
          />
          <Route
            exact
            path="/teams"
            render={(prop) => (
              <TeamsIntegration context={props.Context} {...prop} />
            )}
          />
          <Route exact path="/resources/:id" component={Resources} />
          <Route exact path="/tool/:id" component={ToolDetail} />
          <Route
            exact
            path="/editTool/:id"
            render={(prop) => (
              <EditToolDetail context={props.Context} {...prop} />
            )}
          />
          <Route exact path="/search/:keyword" component={SearchResults} />
          <Route
            exact
            path="/newTool/:id?"
            render={(prop) => (
              <NewTool context={props.Context} graph={props.Graph} {...prop} />
            )}
          />
          <Route
            exact
            path={[
              "/role/:tag/:sortOrder?",
              "/proposal/:tag/:sortOrder?",
              "/toolMaturity/:tag/:sortOrder?",
              "/technologyPlatform/:tag/:sortOrder?",
              "/data/:tag/:sortOrder?",
              "/tools/:status/:sortOrder?",
            ]}
            component={ToolsList}
          />
          {/* <Route
            exact
            path="/submission/:id"
            render={(prop) => (
              <NewToolSubmission context={props.Context} {...prop} />
            )}
          /> */}
          <Route path="/404" component={PageNotFound} />
          <Redirect exact to="/404" />
        </Switch>
        <div className={`${styles.row} ${styles.home}  ${styles.footer}`}>
          <div
            className={`${styles.cl9} ${styles.br_grey} ${styles.bl_grey15}`}
          >
            <Image
              alt="IMG Logo"
              className={styles.logoCenter}
              src="../SiteAssets/images/IMG_LOGO_FINAL_SINGLE.png"
              width="525px"
            />
            {/* <div className={`${styles.cl4} ${styles.p20}`}>
              <Text className={styles.fHeader_blue}>
                For more information and support
              </Text>
            </div>
            <div className={`${styles.cl8} ${styles.p20}`}>
              <div>
                <Text>Office of Information Resource Management</Text>
              </div>
              <div>
                <Text>Division of Information Systems</Text>
              </div>
              <div>
                <Text>Support Email Address</Text>
              </div>
            </div> */}
          </div>
          <div className={styles.cl3}>
            <div className={styles.p20}>
              <Text className={styles.fHeader_white}>Got questions?</Text>
              <br />
              <Text className={styles.fHeader_white}>
                Contact <a href="mailto:IMG@NSF.GOV">IMG@NSF.GOV</a>
              </Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SspApp: React.FC<TProps> = (props) => (
  <ErrorBoundary>
    <Provider store={store}>
      <HashRouter>
        <App Context={props.Context} Graph={props.Graph} />
      </HashRouter>
    </Provider>
  </ErrorBoundary>
);
