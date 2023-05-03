import { unwrapResult } from "@reduxjs/toolkit";
import { Link, Stack, Text, TextField } from "office-ui-fabric-react";
import React, { useCallback, useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import ShowMoreText from "react-show-more-text";
import ImageViewer from "react-simple-image-viewer";
import {
  ContactInfo,
  HorizontalDivider,
  LeftNav,
  SspSpinner,
} from "../../components";
import useWebtrends from "../../hooks/useWebtrends";
import { getSoftwareToolDetail } from "../../store/slicers";
import {
  addToolReviewComment,
  getAllToolReviews,
  rateSoftwareTool,
} from "../../store/slicers/toolsSlicer";
import gs from "../../styles/sspStyle.module.scss";
//require("../../../../node_modules/react-multi-carousel/lib/styles.css");

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

export const EditSoftwareTool = () => {
  const history = useHistory();
  useWebtrends();
  const { id } = useParams();
  const { toolDetail } = useSelector((state) => state.tool);
  const { keyWords } = useSelector((state) => state.nav);
  const { loading, error } = useSelector((state) => state.app);
  const dispatch = useDispatch();
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [toolReviews, setToolReviews] = useState([]);
  const [commentAdded, setCommentAdded] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  //const [instance, updateInstance] = usePDF({ document: ToolPDF });

  useEffect(() => {
    const init = async () => {
      const result = await dispatch(getSoftwareToolDetail(id));
      if (getSoftwareToolDetail.fulfilled.match(result)) setIsDataLoaded(true);
    };
    init();
    window.scrollTo(0, 0);
  }, [newRating, commentAdded]);

  const handleRatingChange = async (rating) => {
    const result = await dispatch(rateSoftwareTool({ toolId: id, rating }));
    if (rateSoftwareTool.rejected.match(result))
      throw Error("There is an error saving the rating");
    const newRating = unwrapResult(result) as number;
    setNewRating(newRating);
  };

  const onSubmitReview = async () => {
    if (!reviewComment) {
      setValidationError(true);
      return;
    }
    const result = await dispatch(
      addToolReviewComment({ toolId: id, comment: reviewComment })
    );
    if (addToolReviewComment.rejected.match(result))
      throw Error("There is an error saving review comments");
    setReviewComment("");
    setCommentAdded(true);
    setValidationError(false);
  };

  const stackTokens = { childrenGap: 5 };

  const loadAllToolReviews = async () => {
    const result = await dispatch(getAllToolReviews(id));
    if (getAllToolReviews.fulfilled.match(result))
      setToolReviews(unwrapResult(result));
    else throw Error("There is an error loading tool reviews");
    setShowAllReviews(!showAllReviews);
  };

  const navigateToTeamsChannel = async () => {
    const newPageUrl = toolDetail.teamChannelLink.Url;
    window.open(newPageUrl, "_blank");
  };

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

  const handleShowDialog = () => {
    setShowDialog(!showDialog);
  };
  const openImageViewer = useCallback((index) => {
    setCurrentImage(index);
    setShowDialog(true);
  }, []);

  const closeImageViewer = () => {
    setCurrentImage(0);
    setShowDialog(false);
  };

  if (error) throw error;

  const showHideText = showAllReviews
    ? `Hide Reviews`
    : `See all ${toolDetail.reviewCount} Reviews`;

  return (
    <SspSpinner condition={loading === "pending" || !isDataLoaded}>
      {toolDetail && (
        <div className={gs.tools}>
          <div className={gs.subHeader}>NSF TOOL RESULTS</div>
          <div className={gs.subHeader}>
            <Link underline>Edit</Link>
          </div>
          <div className={gs.content}>
            <div className={` ${gs.ph0} ${gs.navColumn}`}>
              <LeftNav searchHandler={searchHandler} />
            </div>
            <div className={gs.contentColumn + " " + gs.contentDetail}>
              <Stack tokens={tokens.sectionStack}>
                <Stack tokens={tokens.headingStack}>
                  <TextField value={toolDetail.title}></TextField>
                </Stack>
                <HorizontalDivider />
                <Stack tokens={tokens.contentStack}>
                  <TextField
                    multiline
                    rows={4}
                    value={toolDetail.description}
                  ></TextField>
                </Stack>
              </Stack>
              <div className={gs.pv6}></div>
              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>METADATA</div>
                <div className={gs.attBody}>
                  <div className={gs.attributeKey}>Keywords</div>
                  <div className={gs.attributeVal}>
                    <Text className={gs.fCaption_blue_small}>
                      {getFullTagNames(toolDetail.Tags)}
                    </Text>
                  </div>
                </div>
              </div>
              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>POINTS OF CONTACT</div>
                <div className={gs.attBody}>
                  {toolDetail.pocs &&
                    toolDetail.pocs.map((c) => (
                      <>
                        <div className={gs.attributeKey}>
                          <ContactInfo name={c.name} email={c.email} />
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
                      </>
                    ))}
                </div>
              </div>
              {toolDetail.Attachments && toolDetail.Attachments.length > 0 && (
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>SCREENSHOTS</div>
                  <div className={gs.pl20}>
                    <Carousel
                      responsive={responsive}
                      infinite={true}
                      itemClass={gs.sliderImageItem}
                      containerClass={gs.carouselContainerWithScrollbar}
                    >
                      {toolDetail.Attachments.map((a, i) => {
                        return (
                          <img
                            src={a.ServerRelativeUrl}
                            alt={a.FileName}
                            onClick={() => openImageViewer(i)}
                            key={a.FileName}
                            style={{ width: "300px", height: "200px" }}
                          />
                        );
                      })}
                    </Carousel>
                    {showDialog && (
                      <ImageViewer
                        src={toolDetail.Attachments.map(
                          (i) => i.ServerRelativeUrl
                        )}
                        currentIndex={currentImage}
                        onClose={closeImageViewer}
                        backgroundStyle={{
                          backgroundColor: "rgba(0,0,0,0.9)",
                          left: "10%",
                          top: "10%",
                          width: "80%",
                          height: "90%",
                          zIndex: "1000",
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>ACCESS AND DOWNLOADS</div>
                <div className={gs.attBody}>
                  {toolDetail.links &&
                    toolDetail.links.length > 0 &&
                    toolDetail.links.map((link) => {
                      return (
                        <>
                          <div className={gs.attributeKey}>
                            <Text className={gs.fCaption_blue_small}>
                              {link.title}
                            </Text>
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
                        </>
                      );
                    })}
                </div>
              </div>
              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>DOCUMENTATION</div>
                <div className={gs.attBody}>
                  <div className={gs.attributeKey}>Guide</div>
                  <div className={gs.attributeVal}>
                    {toolDetail.guide && (
                      <a
                        onClick={() =>
                          window.open(toolDetail.guide.Url, "_blank")
                        }
                        className={`${gs.textLink} ${gs.fCaption_blue_small}`}
                      >
                        {toolDetail.guide.Description}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={gs.p20} />
        </div>
      )}
    </SspSpinner>
  );
};
