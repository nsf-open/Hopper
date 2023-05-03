import {
  Dropdown,
  IconButton,
  IDropdownOption,
  Stack,
  Text,
} from "office-ui-fabric-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { LeftNav, SoftwareItemRow, SspSpinner } from "../components";
import useWebtrends from "../hooks/useWebtrends";
import { SoftwareItem, ToolStatus } from "../model";
import { getSoftwareToolsList } from "../store/slicers";
import styles from "../styles/sspStyle.module.scss";

const tokens = {
  sectionStack: {
    childrenGap: 15,
  },
  headingStack: {
    childrenGap: 5,
  },
  contentStack: {
    childrenGap: 5,
  },
};

const searchTools = (keyword, tools) => {
  return tools.filter((t: SoftwareItem) => {
    if (t.title.toLowerCase().indexOf(keyword.toLowerCase()) >= 0) return t;
  });
};
const options: IDropdownOption[] = [
  { key: "", text: "Sort By", selected: true, disabled: true },
  { key: "titleAsc", text: "Title: Asc" },
  { key: "titleDesc", text: "Title: Desc" },
];

export const ToolsList = () => {
  const { tag, status, sortOrder } = useParams();
  const pageSize = 10;
  const location = useLocation();
  const history = useHistory();
  useWebtrends();
  const { loading, error } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState(tools);
  const [searchCleared, setSearchCleared] = useState(true);
  const [toolsLoaded, setToolsLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pages = filteredTools ? Math.floor(filteredTools.length / pageSize) : 0;
  const numberofPages =
    filteredTools && filteredTools.length % pageSize == 0 ? pages : pages + 1;

  useEffect(() => {
    const loadAll = async () => {
      const getTools = dispatch(getSoftwareToolsList(ToolStatus.Approved));
      getTools
        .then((data) => {
          let allData = data.payload;
          if (!sortOrder) {
            allData = [...allData].sort(function (a, b) {
              var nameA = a.title.trim().toUpperCase(); // ignore upper and lowercase
              var nameB = b.title.trim().toUpperCase(); // ignore upper and lowercase
              if (nameA < nameB) {
                return -1;
              }
              if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
          }
          setTools(allData);
          setToolsLoaded(true);
        })
        .catch((e) => {
          setToolsLoaded(false);
          throw e;
        });
    };

    if (!toolsLoaded) loadAll();
    window.scrollTo(0, 0);

    return () => {
      //setToolsLoaded(false);
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const sortToolsList = () => {
      if (isActive) {
        const allData = [...tools].sort(function (a, b) {
          var nameA = a.title.trim().toUpperCase(); // ignore upper and lowercase
          var nameB = b.title.trim().toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {
            return sortOrder.indexOf("Asc") > 0 ? -1 : 1;
          }
          if (nameA > nameB) {
            return sortOrder.indexOf("Asc") > 0 ? 1 : -1;
          }
          return 0;
        });
        setTools(allData);
      }
    };

    if (toolsLoaded && sortOrder) sortToolsList();

    return () => {
      isActive = false;
    };
  }, [sortOrder]);

  useEffect(() => {
    const filter = async () => {
      if (tools && tag) {
        const filtered = tools.filter((t: SoftwareItem) => {
          if (t.Tags && t.Tags.indexOf(tag) >= 0) return t;
          if (
            t.maturity &&
            t.maturity.toLowerCase().indexOf(tag.toLowerCase()) >= 0
          )
            return t;
        });
        setCurrentPage(0);
        setFilteredTools(filtered);
        return;
      }
      setFilteredTools(tools);
    };
    if (searchCleared && loading === "idle") filter();
  }, [toolsLoaded, tag, loading, searchCleared]);

  const searchHandler = (searchKey: string) => {
    if (searchKey && searchKey.trim())
      return history.push(`/search/${searchKey}`);
  };

  const listSortHandler = (sortOrder) => {
    let mainPath: string = location.pathname;
    if (mainPath.indexOf("Asc") > 0 || mainPath.indexOf("Desc") > 0)
      mainPath = mainPath.substring(0, mainPath.lastIndexOf("/"));
    return history.push(`${mainPath}/${sortOrder}`);
  };

  const onNextPageHandler = () => {
    setCurrentPage((prev) => prev + 1);
  };
  const onPrevPageHandler = () => {
    setCurrentPage((prev) => prev - 1);
  };

  if (error) throw error;

  return (
    <SspSpinner condition={!toolsLoaded}>
      <div className={styles.tools}>
        <div className={styles.subHeader}>NSF TOOL RESULTS</div>
        <div className={styles.content}>
          <div className={` ${styles.ph0} ${styles.navColumn}`}>
            <LeftNav searchHandler={searchHandler} />
          </div>
          <div className={`${styles.contentColumn} ${styles.pl0}`}>
            {filteredTools && filteredTools.length > 0 ? (
              <Stack tokens={tokens.sectionStack}>
                <Stack.Item>
                  <Dropdown
                    placeholder="Sort By"
                    options={options}
                    styles={{
                      dropdown: {
                        float: "left",
                        width: "150px",
                        marginLeft: "10px",
                      },
                    }}
                    onChange={(e, o) => {
                      listSortHandler(o.key);
                    }}
                  />
                  <div style={{ float: "right" }}>
                    <IconButton
                      disabled={currentPage == 0}
                      onClick={onPrevPageHandler}
                      style={{
                        backgroundColor: "#2f5d9e",
                        width: "40px",
                        color: "white",
                      }}
                      iconProps={{ iconName: "ChevronLeft", color: "white" }}
                    />
                    <Text
                      style={{
                        display: "inline-block",
                        padding: "5px 10px 0px 10px",
                        fontWeight: "bold",
                      }}
                    >
                      {currentPage + 1}
                    </Text>
                    <IconButton
                      disabled={currentPage + 1 == numberofPages}
                      onClick={onNextPageHandler}
                      style={{
                        backgroundColor: "#2f5d9e",
                        width: "40px",
                        color: "white",
                        marginRight: "10px",
                      }}
                      iconProps={{ iconName: "ChevronRight", color: "white" }}
                    />
                    <Text
                      style={{ display: "inline-block", fontWeight: "bold" }}
                    >{` of ${numberofPages}`}</Text>
                  </div>
                </Stack.Item>
                {filteredTools
                  .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                  .map((tool) => (
                    <Stack.Item key={tool.id}>
                      <SoftwareItemRow item={tool} showAttributes={true} />
                    </Stack.Item>
                  ))}
                <Stack.Item>
                  <div style={{ float: "right" }}>
                    <IconButton
                      disabled={currentPage == 0}
                      onClick={onPrevPageHandler}
                      style={{
                        backgroundColor: "#2f5d9e",
                        width: "40px",
                        color: "white",
                      }}
                      iconProps={{ iconName: "ChevronLeft", color: "white" }}
                    />
                    <Text
                      style={{
                        display: "inline-block",
                        padding: "5px 10px 0px 10px",
                        fontWeight: "bold",
                      }}
                    >
                      {currentPage + 1}
                    </Text>
                    <IconButton
                      disabled={currentPage + 1 == numberofPages}
                      onClick={onNextPageHandler}
                      style={{
                        backgroundColor: "#2f5d9e",
                        width: "40px",
                        color: "white",
                        marginRight: "10px",
                      }}
                      iconProps={{ iconName: "ChevronRight", color: "white" }}
                    />
                    <Text
                      style={{ display: "inline-block", fontWeight: "bold" }}
                    >{` of ${numberofPages}`}</Text>
                  </div>
                </Stack.Item>
              </Stack>
            ) : (
              <Stack tokens={tokens.sectionStack} horizontalAlign="center">
                <Text className={styles.fHeader_blue}>
                  There are no tools with the selected criteria
                </Text>
              </Stack>
            )}
          </div>
        </div>
        <div className={styles.p20} />
      </div>
    </SspSpinner>
  );
};
