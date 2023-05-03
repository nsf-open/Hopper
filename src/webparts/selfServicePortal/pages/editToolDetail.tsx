import { useBoolean, useId } from "@fluentui/react-hooks";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { unwrapResult } from "@reduxjs/toolkit";
import {
  CommandBarButton,
  DefaultButton,
  FontWeights,
  getTheme,
  Icon,
  IconButton,
  IIconProps,
  IStackItemTokens,
  Label,
  mergeStyleSets,
  Modal,
  Panel,
  PrimaryButton,
  Stack,
  Text,
  TextField,
} from "office-ui-fabric-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import ShowMoreText from "react-show-more-text";
import ReactTags from "react-tag-autocomplete";
import {
  ContactInfo,
  FileUploadPreview,
  HorizontalDivider,
  LeftNav,
  SspSpinner,
} from "../components";
import useWebtrends from "../hooks/useWebtrends";
import { PointOfContact, SoftwareItem } from "../model";
import { getSoftwareToolDetail } from "../store/slicers";
import {
  addUpdateCreatorBio,
  deleteToolLink,
  deleteToolVideo,
  getPointOfContact,
  getToolVideos,
  removeToolAttachment,
  saveToolLink,
  saveToolVideo,
  updateSoftwareTool,
} from "../store/slicers/toolsSlicer";
import gs from "../styles/sspStyle.module.scss";
require("../../../../node_modules/react-multi-carousel/lib/styles.css");

//import setToolRating from "../scripts/ratingScript.js";

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

const buttonTokens: IStackItemTokens = { margin: "l1" };
const responsive = {
  desktop: {
    breakpoint: { max: 2000, min: 1024 },
    items: 3,
    slidesToSlide: 3, // optional, default to 1.
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
    slidesToSlide: 2, // optional, default to 1.
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
    slidesToSlide: 1, // optional, default to 1.
  },
};
const thumbsContainer = {
  display: "flex",
  flexDirection: "row" as "row",
  flexWrap: "wrap" as "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #092d74",
  marginBottom: 8,
  marginRight: 8,
  width: 150,
  height: 100,
  padding: 4,
  boxSizing: "border-box" as "border-box",
};

const thumbInner = {
  minWidth: 0,
  overflow: "hidden",
  cursor: "pointer",
};

type TProps = {
  context: WebPartContext;
  graph: any;
};

export const EditToolDetail: React.FC<TProps> = (props) => {
  const history = useHistory();
  useWebtrends();
  const { id } = useParams();

  const { keyWords } = useSelector((state) => state.nav);
  const { entities } = useSelector((state) => state.nav);
  const { loading, error } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [tags, setTags] = React.useState([]);
  const [toolDetail, setToolDetail] = useState<SoftwareItem>();

  const [showSideTagsMenu, setShowSideTagsMenu] = useState(false);
  const [toolGuide, setToolGuide] = useState({ Description: "", Url: "" });

  const [screenShots, setScreenShots] = useState([]);
  const [toolVideos, setToolVideos] = useState([]);
  const [newContact, setNewContact] = useState<PointOfContact>({
    email: "",
    name: "",
    bio: "",
    id: 0,
  });
  const [toolLink, setToolLink] = useState({
    id,
    title: "",
    altText: "",
    url: "",
  });
  const [toolVideo, setToolVideo] = useState({ title: "", id, streamId: "" });

  useEffect(() => {
    var ignore = false;
    const getVideos = async () => {
      const result = await dispatch(getToolVideos(id));
      if (getToolVideos.fulfilled.match(result))
        setToolVideos(unwrapResult(result));
    };

    if (!ignore) getVideos();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      const result = await dispatch(getSoftwareToolDetail(id));
      if (getSoftwareToolDetail.fulfilled.match(result)) {
        const toolToEdit = unwrapResult(result);
        setIsDataLoaded(true);
        setToolDetail(toolToEdit);
        setToolGuide(toolToEdit.guide);
        getTags(result.payload.Tags);
        if (
          result.payload.Attachments &&
          result.payload.Attachments.length > 0
        ) {
          const attFiles = result.payload.Attachments.map((f) => {
            return { name: f.FileName, preview: f.ServerRelativeUrl };
          });
          setScreenShots(attFiles);
        }
      }
    };
    init();
    window.scrollTo(0, 0);
  }, [keyWords]);

  const getTags = (detailTags) => {
    if (!detailTags) return [];
    const existingTags = keyWords
      .filter((k) => detailTags.includes(k.key))
      .map((i) => {
        return { id: i.key, name: i.name };
      });
    setTags(existingTags);
  };

  const stackTokens = { childrenGap: 5 };

  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] =
    useBoolean(false);
  const titleId = useId("title");
  const cancelIcon: IIconProps = { iconName: "Cancel" };

  const [isLinkModalOpen, { setTrue: showLinkModal, setFalse: hideLinkModal }] =
    useBoolean(false);

  const [
    isVideoModalOpen,
    { setTrue: showVideoModal, setFalse: hideVideoModal },
  ] = useBoolean(false);
  const linkTitleId = useId("title");
  const linkCancelIcon: IIconProps = { iconName: "Cancel" };

  const searchHandler = (searchKey: string) => {
    if (searchKey && searchKey.trim())
      return history.push(`/search/${searchKey}`);
  };

  const getFullTagNames = (toolTags: []) => {
    if (!toolTags || toolTags.length == 0) return null;
    const fullNames = toolTags.map((t) => {
      const elem = keyWords.find((i) => i.key === t);
      if (elem) return elem.name;
    });
    return fullNames.join("  |  ");
  };
  const suggestions = keyWords.map((k) => {
    return { id: k.key, name: k.name };
  });

  const handleDelete = (i) => {
    const newTags = tags.filter((tag, index) => index !== i);
    setTags(newTags);
  };

  const onRemoveAttachment = (name) => {
    if (id) {
      dispatch(removeToolAttachment({ name, id }));
    }
  };

  const handleAddition = (tag) => {
    const newTags = [...tags, tag];
    setTags(newTags);
  };

  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };

  const readFileAsync = (file) => {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const blob = async (screenShots, documentations) => {
    var fileInfos = [];
    if (screenShots && screenShots.length > 0) {
      fileInfos = [
        ...fileInfos,
        ...(await Promise.all(
          screenShots.map(async (file) => {
            if (file.preview.includes("blob:https")) {
              let contentBuffer = await readFileAsync(file);
              return {
                name: `screenshot_${file.name}`,
                content: contentBuffer,
              };
            } else {
              return { name: `screenshot_${file.name}` };
            }
          })
        )),
      ];
    }
    if (documentations && documentations.length > 0) {
      fileInfos = [
        ...fileInfos,
        ...(await Promise.all(
          documentations.map(async (file) => {
            if (file.preview.includes("blob:https")) {
              let contentBuffer = await readFileAsync(file);
              return {
                name: `document_${file.name}`,
                content: contentBuffer,
              };
            } else {
              return { name: `document_${file.name}` };
            }
          })
        )),
      ];
    }
    return fileInfos;
  };

  const onSaveSoftwareTool = async () => {
    const updatedTool = { ...toolDetail };
    updatedTool.guide = toolGuide;
    updatedTool.Tags = tags.map((t) => t.id);
    updatedTool.fileInfos = await blob(screenShots, []);
    await dispatch(updateSoftwareTool(updatedTool));
    history.goBack();
  };

  const onSetContactBio = (email, bio) => {
    const tool = { ...toolDetail };
    const toUpdate = tool.pocs.filter((p) => p.email === email);
    toUpdate[0].bio = bio;
    dispatch(addUpdateCreatorBio(toUpdate[0]));
    tool.pocs = tool.pocs.map((p) => {
      if (p.email === email) return { ...p, bio };
      return p;
    });
    setToolDetail((prev) => {
      return { ...prev, ...tool };
    });
  };

  const onDeleteContact = (email) => {
    const tool = { ...toolDetail };
    tool.pocs = tool.pocs.filter((p) => p.email !== email);
    setToolDetail((prev) => {
      return { ...prev, ...tool };
    });
  };

  const onAddContact = (person) => {
    const tool = { ...toolDetail };
    tool.pocs = [...tool.pocs, person];
    dispatch(addUpdateCreatorBio(person));
    setToolDetail((prev) => {
      return { ...prev, ...tool };
    });
  };

  const onAddUpdateLink = (isNew) => {
    const tool = { ...toolDetail };
    const newLink: any = {
      title: toolLink.title,
      url: { Url: toolLink.url, Description: toolLink.altText },
      toolId: id,
    };
    const linkToSave = isNew
      ? newLink
      : {
          ...toolDetail.links.filter((l) => l.id === toolLink.id)[0],
          ...newLink,
        };

    tool.links = isNew
      ? [...tool.links, newLink]
      : [...tool.links.filter((l) => l.id !== toolLink.id), newLink];
    setToolDetail((prev) => {
      return { ...prev, ...tool };
    });
    dispatch(saveToolLink(linkToSave));
  };
  const onDeleteLink = () => {
    const tool = { ...toolDetail };
    tool.links = tool.links.filter((l) => l.id !== toolLink.id);
    setToolDetail((prev) => {
      return { ...prev, ...tool };
    });
    dispatch(deleteToolLink(toolLink.id));
  };
  const onAddUpdateVideo = (isNew) => {
    const newVideo: any = {
      title: toolVideo.title,
      streamId: toolVideo.streamId,
      toolId: id,
    };
    const videoToSave = isNew
      ? newVideo
      : {
          ...newVideo,
          toolId: id,
          id: toolVideo.id,
        };

    const newVideos = isNew
      ? [...toolVideos, newVideo]
      : [...toolVideos.filter((l) => l.id !== toolVideo.id), newVideo];
    setToolVideos(newVideos);
    dispatch(saveToolVideo(videoToSave));
  };
  const onDeleteVideo = () => {
    const videos = toolVideos.filter((l) => l.id !== toolVideo.id);
    setToolVideos(videos);
    dispatch(deleteToolVideo(toolVideo.id));
  };

  const onPersonSelected = async (e) => {
    var person: any = {};
    if (e.length) {
      const email = e[0].secondaryText;
      const poc = await dispatch(getPointOfContact(email));
      person = e.map((c: any) => {
        return {
          email,
          name: c.text,
          bio: poc && poc.payload.length ? poc.payload[0].bio : "",
          id: c.id,
        };
      })[0];
    }
    setNewContact(person);
  };

  const showToolLinkPopup = (link) => {
    setToolLink(link);
    showLinkModal();
  };

  const showToolVideoPopup = (video) => {
    setToolVideo(video);
    showVideoModal();
  };

  const onCancelHandler = () => {
    history.goBack();
  };

  if (error) throw error;

  return (
    <>
      <SspSpinner condition={loading === "pending" || !isDataLoaded}>
        {toolDetail && (
          <div className={gs.tools}>
            <div className={gs.subHeader}>EDIT TOOL</div>
            <div className={gs.content}>
              <div className={` ${gs.ph0} ${gs.navColumn}`}>
                <LeftNav searchHandler={searchHandler} />
              </div>
              <div className={gs.contentColumn + " " + gs.contentDetail}>
                <Stack tokens={tokens.sectionStack}>
                  <Stack tokens={tokens.headingStack}>
                    <TextField
                      value={toolDetail.title}
                      onChange={(e, value) =>
                        setToolDetail((prev) => {
                          return { ...prev, ...{ title: value } };
                        })
                      }
                    ></TextField>
                  </Stack>
                  <HorizontalDivider />
                  <Stack tokens={tokens.contentStack}>
                    <TextField
                      multiline
                      rows={5}
                      value={toolDetail.description}
                      onChange={(e, value) =>
                        setToolDetail((prev) => {
                          return { ...prev, ...{ description: value } };
                        })
                      }
                    ></TextField>
                  </Stack>
                </Stack>
                <div className={gs.pv6}></div>
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>METADATA</div>
                  <div className={gs.attBody}>
                    <div className={gs.attributeKey}>Keywords</div>
                    <div className={gs.attributeVal}>
                      <ReactTags
                        tags={tags}
                        placeholderText="Keywords"
                        suggestions={suggestions}
                        onDelete={(i) => handleDelete(i)}
                        onAddition={(t) => handleAddition(t)}
                      />
                      <Label disabled className={gs.label}>
                        <a
                          href="javascript:void(0);"
                          onClick={() => setShowSideTagsMenu(!showSideTagsMenu)}
                        >
                          Click Here to see the entire Tags List
                        </a>
                      </Label>
                    </div>
                  </div>
                </div>
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>
                    POINTS OF CONTACT &nbsp;&nbsp;
                    <CommandBarButton
                      iconProps={{ iconName: "Add" }}
                      text={"Add Contact"}
                      onClick={showModal}
                      styles={{ root: { height: 30 } }}
                    />
                  </div>
                  <div className={gs.attBody}>
                    {toolDetail.pocs &&
                      toolDetail.pocs.map((c) => (
                        <div style={{ width: "100%", display: "inline-block" }}>
                          <div className={gs.attributeKey}>
                            <ContactInfo
                              name={c.name}
                              email={c.email}
                              bio={c.bio}
                              showEditIcon
                              setBio={onSetContactBio}
                              deleteUser={onDeleteContact}
                            />
                          </div>
                          <div className={gs.attributeVal}>
                            <ShowMoreText
                              lines={3}
                              more="See more"
                              less="See less"
                              expanded={false}
                              className={gs.fCaption_blue_small}
                            >
                              {c.bio}
                            </ShowMoreText>
                            <br />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                {toolDetail.Attachments && toolDetail.Attachments.length > 0 && (
                  <div className={gs.attributeSection}>
                    <div className={gs.attHeader}>SCREENSHOTS</div>
                    <div className={gs.pl20}>
                      <FileUploadPreview
                        files={screenShots}
                        onSetFiles={setScreenShots}
                        onRemoveFile={onRemoveAttachment}
                        screenshotsOnly
                      />
                    </div>
                  </div>
                )}

                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>
                    VIDEOS&nbsp;&nbsp;
                    <CommandBarButton
                      iconProps={{ iconName: "Add" }}
                      text={"Add Video"}
                      onClick={() => showToolVideoPopup({})}
                      styles={{ root: { height: 30 } }}
                    />
                  </div>
                  <div className={gs.pl20}>
                    <div style={thumbsContainer}>
                      {toolVideos.map((a, i) => {
                        return (
                          <div style={{ width: "150px", height: "100px" }}>
                            <div
                              style={{
                                width: "150px",
                                height: "100px",
                                position: "absolute",
                                backgroundColor: "transparent",
                                cursor: "pointer",
                              }}
                              onClick={() =>
                                showToolVideoPopup({
                                  title: a.title,
                                  id: a.id,
                                  streamId: a.streamId,
                                })
                              }
                              data-embedcode={`https://web.microsoftstream.com/embed/video/${a.streamId}?autoplay=false&showinfo=true`}
                            ></div>
                            <iframe
                              allowFullScreen
                              style={thumb}
                              className={`ivideo_${a.streamId}`}
                              src={`https://web.microsoftstream.com/embed/video/${a.streamId}?autoplay=false&showinfo=true`}
                            ></iframe>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>
                    ACCESS AND DOWNLOADS&nbsp;&nbsp;
                    <CommandBarButton
                      iconProps={{ iconName: "Add" }}
                      text={"Add Access and Downloads Link"}
                      onClick={() => showToolLinkPopup({})}
                      styles={{ root: { height: 30 } }}
                    />
                  </div>
                  {toolDetail.links &&
                    toolDetail.links.length > 0 &&
                    toolDetail.links.map((link: any) => {
                      return (
                        <div className={gs.attBody}>
                          <div className={gs.attributeKey}>
                            <Stack className={gs.pv5} horizontal>
                              <Stack.Item>
                                <Icon
                                  iconName="Edit"
                                  style={{
                                    fontSize: 20,
                                    cursor: "pointer",
                                    paddingRight: "5px",
                                  }}
                                  onClick={() =>
                                    showToolLinkPopup({
                                      title: link.title,
                                      altText: link.url.Description,
                                      url: link.url.Url,
                                      id: link.id,
                                    })
                                  }
                                ></Icon>
                              </Stack.Item>
                              <Stack.Item>
                                <Text className={gs.fCaption_blue_small}>
                                  {link.title}
                                </Text>
                              </Stack.Item>
                            </Stack>
                          </div>
                          <div className={gs.attributeVal}>
                            <a
                              onClick={() =>
                                window.open(link.url.Url, "_blank")
                              }
                              className={`${gs.textLink} ${gs.fCaption_blue_small}`}
                            >
                              {link.url.Description}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                </div>
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>DOCUMENTATION</div>
                  <div className={gs.attBody}>
                    <div className={gs.attributeKey}>Guide</div>
                    <div className={gs.attributeVal}>
                      <TextField
                        placeholder="Guide Description"
                        onChange={(e, v) =>
                          setToolGuide((prev) => {
                            return { ...prev, Description: v };
                          })
                        }
                        value={toolGuide ? toolGuide.Description : ""}
                      />
                      <br />
                      <TextField
                        placeholder="Guide URL"
                        onChange={(e, v) =>
                          setToolGuide((prev) => {
                            return { ...prev, Url: v };
                          })
                        }
                        value={toolGuide ? toolGuide.Url : ""}
                      />
                    </div>
                  </div>
                </div>
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}></div>
                  <div className={gs.attBody}>
                    <div className={gs.attributeKey}></div>
                    <div className={gs.attributeVal}>
                      <Stack horizontal>
                        <Stack.Item grow align="start" tokens={buttonTokens}>
                          <Stack horizontal>
                            <PrimaryButton
                              text="Save"
                              name="Save"
                              onClick={onSaveSoftwareTool}
                            />
                            <div className={gs.ph40} />
                            <DefaultButton
                              text="Cancel"
                              onClick={onCancelHandler}
                            />
                          </Stack>
                        </Stack.Item>
                      </Stack>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={gs.p20} />
          </div>
        )}
      </SspSpinner>
      <Modal
        titleAriaId={titleId}
        isOpen={isModalOpen}
        onDismiss={hideModal}
        isBlocking={true}
      >
        <div className={contentStyles.header}>
          <PeoplePicker
            context={props.context}
            showtooltip={false}
            placeholder={"Select user"}
            ensureUser
            showHiddenInUI={false}
            principalTypes={[PrincipalType.User]}
            resolveDelay={1000}
            onChange={onPersonSelected}
          />
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
            styles={{ root: { minWidth: "500px" } }}
            value={newContact.bio}
            onChange={(e, v) =>
              setNewContact((prev) => {
                return { ...prev, bio: v };
              })
            }
          ></TextField>
          <div style={{ paddingTop: "10px" }}>
            <Stack horizontal horizontalAlign="space-between">
              <PrimaryButton
                onClick={() => {
                  onAddContact(newContact);
                  hideModal();
                }}
                text="Add Contact"
              />
              <DefaultButton
                onClick={() => {
                  setNewContact((prev) => {
                    return { ...prev, bio: "" };
                  });
                  hideModal();
                }}
                text="Cancel"
              />
            </Stack>
          </div>
        </div>
      </Modal>

      <Modal
        titleAriaId={linkTitleId}
        isOpen={isLinkModalOpen}
        onDismiss={hideLinkModal}
        isBlocking={true}
      >
        <div className={contentStyles.header}>
          <TextField
            value={toolLink.title}
            placeholder="Link Title"
            onChange={(e, v) =>
              setToolLink((prev) => {
                return { ...prev, title: v };
              })
            }
          />
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideLinkModal}
          />
        </div>
        <div className={contentStyles.body}>
          <TextField
            styles={{ root: { minWidth: "500px" } }}
            placeholder="Link Alternate Text"
            value={toolLink.altText}
            onChange={(e, v) =>
              setToolLink((prev) => {
                return { ...prev, altText: v };
              })
            }
          ></TextField>
          <br />
          <TextField
            styles={{ root: { minWidth: "500px" } }}
            placeholder="Link URL"
            value={toolLink.url}
            onChange={(e, v) =>
              setToolLink((prev) => {
                return { ...prev, url: v };
              })
            }
          ></TextField>
          <div style={{ paddingTop: "10px" }}>
            <Stack horizontal horizontalAlign="space-between">
              {!toolLink.id ? (
                <PrimaryButton
                  onClick={() => {
                    onAddUpdateLink(true);
                    hideLinkModal();
                  }}
                  text="Add Link"
                />
              ) : (
                <>
                  <PrimaryButton
                    onClick={() => {
                      onAddUpdateLink(false);
                      hideLinkModal();
                    }}
                    text="Update Link"
                  />
                  <PrimaryButton
                    style={{ backgroundColor: "red" }}
                    onClick={() => {
                      onDeleteLink();
                      hideLinkModal();
                    }}
                    text="Delete Link"
                  />
                </>
              )}
              <DefaultButton onClick={hideLinkModal} text="Cancel" />
            </Stack>
          </div>
        </div>
      </Modal>

      <Panel
        isLightDismiss
        isOpen={showSideTagsMenu}
        onDismiss={() => setShowSideTagsMenu(false)}
        headerText="Tool Tags"
        closeButtonAriaLabel="Close"
        isFooterAtBottom={true}
      >
        {entities &&
          entities.map((g) => {
            return (
              g.name.trim().toLowerCase() !== "tool maturity stage" && (
                <ul>
                  <Label
                    style={{
                      fontSize: "12px !important",
                      fontWeight: "bold",
                      color: "#092d74",
                    }}
                  >
                    {g.name}
                  </Label>
                  {g.links.map((l) => {
                    return (
                      <li>
                        {" "}
                        <a
                          href="javascript:void(0);"
                          onClick={() =>
                            handleAddition({ id: l.key, name: l.name })
                          }
                        >
                          {l.name}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )
            );
          })}
      </Panel>

      <Modal
        titleAriaId={linkTitleId}
        isOpen={isVideoModalOpen}
        onDismiss={hideVideoModal}
        isBlocking={true}
      >
        <div className={contentStyles.header}>
          <IconButton
            styles={iconButtonStyles}
            iconProps={cancelIcon}
            ariaLabel="Close popup modal"
            onClick={hideVideoModal}
          />
        </div>
        <div className={contentStyles.body}>
          <TextField
            label="Video Title: "
            title="Video Title: "
            styles={{ root: { minWidth: "500px" } }}
            placeholder="Video Title"
            value={toolVideo.title}
            onChange={(e, v) =>
              setToolVideo((prev) => {
                return { ...prev, title: v };
              })
            }
          ></TextField>
          <br />
          <TextField
            label="Stream ID: "
            title="Stream ID: "
            styles={{ root: { minWidth: "500px" } }}
            placeholder="Video ID"
            value={toolVideo.streamId}
            onChange={(e, v) =>
              setToolVideo((prev) => {
                return { ...prev, streamId: v };
              })
            }
          ></TextField>
          <div style={{ paddingTop: "10px" }}>
            <Stack horizontal horizontalAlign="space-between">
              {!toolVideo.id ? (
                <PrimaryButton
                  onClick={() => {
                    onAddUpdateVideo(true);
                    hideVideoModal();
                  }}
                  text="Add Video"
                />
              ) : (
                <>
                  <PrimaryButton
                    onClick={() => {
                      onAddUpdateVideo(false);
                      hideVideoModal();
                    }}
                    text="Update Video"
                  />
                  <PrimaryButton
                    style={{ backgroundColor: "red" }}
                    onClick={() => {
                      onDeleteVideo();
                      hideVideoModal();
                    }}
                    text="Delete Video"
                  />
                </>
              )}
              <DefaultButton onClick={hideVideoModal} text="Cancel" />
            </Stack>
          </div>
        </div>
      </Modal>
    </>
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
