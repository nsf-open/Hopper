import { unwrapResult } from "@reduxjs/toolkit";
import $ from "jquery";
import {
  CommandBarButton,
  Icon,
  IconButton,
  PrimaryButton,
  Rating,
  Stack,
  Text,
  TextField,
} from "office-ui-fabric-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Carousel from "react-multi-carousel";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useParams } from "react-router-dom";
import ShowMoreText from "react-show-more-text";
import ImageViewer from "react-simple-image-viewer";
import {
  ContactInfo,
  HorizontalDivider,
  LeftNav,
  SoftwareItemRow,
  SspSpinner,
  VideoModal,
} from "../components";
import useWebtrends from "../hooks/useWebtrends";
import { ToolVideo } from "../model";
import { getSoftwareToolDetail } from "../store/slicers";
import {
  addToolReviewComment,
  getAllToolReviews,
  getToolVideos,
  rateSoftwareTool,
} from "../store/slicers/toolsSlicer";
import gs from "../styles/sspStyle.module.scss";
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

export const ToolDetail = () => {
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
  const [showScoreCard, setShowScoreCard] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<ToolVideo>(null);
  const [toolVideos, setToolVideos] = useState([]);
  //const [instance, updateInstance] = usePDF({ document: ToolPDF });
  const inputRef = useRef(null);
  const [videoShownOnce, setVideoShownOnce] = useState(false);

  useEffect(() => {
    const init = async () => {
      const result = await dispatch(getSoftwareToolDetail(id));
      if (getSoftwareToolDetail.fulfilled.match(result)) setIsDataLoaded(true);
    };
    init();
    window.scrollTo(0, 0);
  }, [newRating, commentAdded]);

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
    $('[class^="ivideo"]').on("load", function () {
      $(this)
        .contents()
        .find("body")
        .on("click", function (event) {
          alert("test");
        });
    });
  }, []);

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

  const openVideo = (video) => {
    setCurrentVideo(video);
    setShowVideoModal(true);
  };

  const closeImageViewer = () => {
    setCurrentImage(0);
    setShowDialog(false);
  };

  if (error) throw error;

  const showHideText = showAllReviews
    ? `Hide Reviews`
    : `See all ${toolDetail.reviewCount} Reviews`;

  const scoreCard =
    toolDetail && toolDetail.Attachments && toolDetail.Attachments.length
      ? toolDetail.Attachments.filter((f) =>
          f.FileName.toLowerCase().includes("scorecard")
        )
      : null;
  const screenshots =
    toolDetail && toolDetail.Attachments && toolDetail.Attachments.length
      ? toolDetail.Attachments.filter(
          (f) => !f.FileName.toLowerCase().includes("scorecard")
        )
      : null;

  return (
    <SspSpinner condition={loading === "pending" || !isDataLoaded}>
      {toolDetail && (
        <div className={gs.tools}>
          <div className={gs.subHeader}>NSF TOOL DETAIL</div>
          {toolDetail.canUserEdit && (
            <div className={gs.subHeader}>
              <Link to={`/editTool/${toolDetail.Id}`}>Edit Tool</Link>
            </div>
          )}
          <div className={gs.content}>
            <div className={` ${gs.ph0} ${gs.navColumn}`}>
              <LeftNav searchHandler={searchHandler} />
            </div>
            <div className={gs.contentColumn + " " + gs.contentDetail}>
              <SoftwareItemRow
                item={toolDetail}
                showAttributes={false}
                className={gs.mh_8}
              />
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
                      <Stack horizontal>
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
                      </Stack>
                    ))}
                </div>
              </div>

              {scoreCard && scoreCard.length > 0 && (
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>
                    SCORE CARD &nbsp;{" "}
                    <Icon
                      iconName="infoSolid"
                      title="This section only shown for a tool with score card"
                      style={{ fontSize: "25px", verticalAlign: "top" }}
                    ></Icon>
                  </div>
                  <div className={gs.attBody}>
                    <Carousel
                      responsive={responsive}
                      infinite={true}
                      itemClass={gs.sliderImageItem}
                      containerClass={gs.carouselContainerWithScrollbar}
                    >
                      {scoreCard.map((a, i) => {
                        return (
                          <img
                            src={a.ServerRelativeUrl}
                            alt={a.FileName}
                            onClick={() => setShowScoreCard(!showScoreCard)}
                            key={a.FileName}
                            style={{
                              width: "300px",
                              height: "200px",
                              cursor: "pointer",
                            }}
                          />
                        );
                      })}
                    </Carousel>
                    {showScoreCard && (
                      <ImageViewer
                        src={scoreCard.map((i) => i.ServerRelativeUrl)}
                        currentIndex={0}
                        onClose={() => setShowScoreCard(!showScoreCard)}
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
              {screenshots && (
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>SCREENSHOTS</div>
                  <div className={gs.pl20}>
                    <Carousel
                      responsive={responsive}
                      infinite={true}
                      itemClass={gs.sliderImageItem}
                      containerClass={gs.carouselContainerWithScrollbar}
                    >
                      {screenshots.map((a, i) => {
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
                        src={screenshots.map((i) => i.ServerRelativeUrl)}
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
              {toolVideos && toolVideos.length > 0 && (
                <div className={gs.attributeSection}>
                  <div className={gs.attHeader}>VIDEOS</div>
                  <div className={gs.pl20}>
                    <Carousel
                      ref={inputRef}
                      responsive={responsive}
                      infinite={true}
                      itemClass={gs.sliderImageItem}
                      containerClass={gs.carouselContainerWithScrollbar}
                    >
                      {toolVideos.map((a, i) => {
                        return (
                          <div style={{ width: "300px", height: "200px" }}>
                            <div
                              style={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                backgroundColor: "transparent",
                              }}
                              onClick={() => openVideo(a)}
                              data-embedcode={`https://web.microsoftstream.com/embed/video/${a.streamId}?autoplay=false&showinfo=true`}
                            ></div>
                            <iframe
                              allowFullScreen
                              style={{ width: "300px", height: "200px" }}
                              className={`ivideo_${a.streamId}`}
                              src={`https://web.microsoftstream.com/embed/video/${a.streamId}?autoplay=false&showinfo=true`}
                            ></iframe>
                          </div>
                        );
                      })}
                    </Carousel>
                    {currentVideo && (
                      <VideoModal
                        title={currentVideo.title}
                        showModal={showVideoModal}
                        streamId={currentVideo.streamId}
                        onCancel={() => {
                          setShowVideoModal(false);
                          setVideoShownOnce(!videoShownOnce);
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
                <div className={gs.attHeader}>
                  DOCUMENTATION
                  <div
                    style={{ color: "black", fontSize: "12px" }}
                    className={gs.label}
                  >
                    By using this tool, the user agrees to follow all NSF
                    policies including Conflicts of interest and standards of
                    ethical conduct, Information technology and Privacy of
                    sensitive information. All analyses of NSF data that are
                    intended for public distribution are required to be
                    de-identified and reviewed consistent with the{" "}
                    <a
                      href="https://collaboration.inside.nsf.gov/od/oia/dawg/_layouts/15/WopiFrame.aspx?sourcedoc=%7bE465DDFB-51A4-445C-A64C-3D400250EF44%7d&file=OD%2018-10%20Interim%20Guidance%20Disclosure%20of%20nonpublic%20information_UPDATED.docx&action=default&DefaultItemOpen=1"
                      target="_blank"
                    >
                      OD-18 guidance for disclosure of non-public information
                    </a>
                    .
                  </div>
                </div>
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
              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>COLLABORATION</div>
                <div className={`${gs.row} ${gs.bg_deepBlue}`}>
                  <div className={`${gs.cl3} ${gs.p0} ${gs.bg_deepBlue}`}></div>
                  <div className={`${gs.cl9} ${gs.p0} ${gs.bg_deepBlue}`}>
                    <CommandBarButton
                      onClick={navigateToTeamsChannel}
                      style={{
                        backgroundColor: "#3055a6",
                        padding: "10px",
                      }}
                      iconProps={{ iconName: "TeamsLogo" }}
                      styles={{
                        label: { fontWeight: "bolder", color: "white" },
                        icon: { color: "white" },
                      }}
                      text="Need Help?  Collaborate on | MICROSOFT TEAMS"
                      ariaLabel="Need Help?  Collaborate on | MICROSOFT TEAMS"
                    />
                    <IconButton
                      onClick={navigateToTeamsChannel}
                      style={{
                        backgroundColor: "#3055a6",
                        width: "30px",
                        color: "white",
                        padding: "11px",
                        height: "100%",
                      }}
                      iconProps={{ iconName: "ChevronRight" }}
                      title="Collaborate on Microsoft Teams"
                      ariaLabel="Collaborate on Microsoft Teams"
                    />
                  </div>
                </div>
              </div>
              <div className={gs.attributeSection}>
                <div className={gs.attHeader}>RATINGS & REVIEWS</div>
                <div className={gs.attBody}>
                  <div className={gs.attributeKey}>
                    <p>
                      <Rating
                        allowZeroStars
                        min={0}
                        max={5}
                        rating={
                          toolDetail.ratingCount == 0
                            ? 0
                            : toolDetail.averageRatings
                        }
                        readOnly
                      />
                      <Text
                        className={gs.fCaption_blue_small}
                      >{`${toolDetail.ratingCount} Ratings`}</Text>
                    </p>
                  </div>
                  <div className={gs.attributeVal}>
                    <ShowMoreText
                      lines={3}
                      more="See more"
                      less="See less"
                      expanded={false}
                      className={gs.fCaption_blue_small}
                    >
                      {toolDetail.reviews
                        ? toolDetail.reviews[0].comment
                        : "No comments provided about this tool. Be the first to add a comment below."}
                    </ShowMoreText>
                    {toolDetail.reviews && (
                      <p className={gs.fCaption_blue_small}>{`Reviewer: ${
                        toolDetail.reviews[0].reviewer
                      }, Date: ${new Date(
                        toolDetail.reviews[0].timestamp
                      ).toDateString()}`}</p>
                    )}
                    {showAllReviews &&
                      toolReviews.length > 0 &&
                      toolReviews.slice(1).map((review) => {
                        return (
                          <>
                            <HorizontalDivider />
                            <ShowMoreText
                              lines={3}
                              more="See more"
                              less="See less"
                              expanded={false}
                              className={gs.fCaption_blue_small}
                            >
                              {review.comment}
                            </ShowMoreText>
                            <p className={gs.fCaption_blue_small}>{`Reviewer: ${
                              review.reviewer
                            }, Date: ${new Date(
                              review.timestamp
                            ).toDateString()}`}</p>
                          </>
                        );
                      })}
                  </div>
                </div>
              </div>
              <div className={gs.attributeSection}>
                {toolDetail.reviewCount > 1 && (
                  <div className={`${gs.row} ${gs.bg_lghtGrey}`}>
                    <div className={`${gs.cl3} ${gs.p0} ${gs.bg_lghtGrey}`}>
                      <IconButton
                        onClick={loadAllToolReviews}
                        style={{
                          width: "120px",
                          color: "white",
                        }}
                        iconProps={{
                          iconName: showAllReviews
                            ? "ChevronUp"
                            : "ChevronDown",
                        }}
                        title="See more reviews"
                        ariaLabel="See more reviews"
                      />
                    </div>
                    <div className={`${gs.cl9} ${gs.p0} ${gs.bg_lghtGrey}`}>
                      <Link
                        onClick={loadAllToolReviews}
                        style={{
                          color: "white",
                          padding: "5px",
                          fontWeight: "bold",
                        }}
                      >
                        {showHideText}
                      </Link>
                    </div>
                  </div>
                )}
                <div className={gs.attBody}>
                  <div className={gs.attributeKey}>
                    <p>Share Your Review</p>
                    <Rating
                      min={0}
                      max={5}
                      value={newRating}
                      onChange={(e, r) => {
                        handleRatingChange(r);
                      }}
                    />
                  </div>
                  <div className={gs.attributeVal}>
                    <br />
                    <TextField
                      placeholder="Comment"
                      validateOnLoad={false}
                      value={reviewComment}
                      multiline
                      onChange={(e, v) => setReviewComment(v)}
                    />
                    {validationError && (
                      <p className={gs.fCaption_blue_small}>
                        <Text className={gs.error}>Comment is required</Text>
                      </p>
                    )}
                    <br />
                    <PrimaryButton text="Submit" onClick={onSubmitReview} />
                  </div>
                </div>
              </div>
              <div className={gs.attributeSection}>
                <div className={gs.attBody}>
                  <Text className={gs.fCaption_blue_small}>
                    This page is viewed {toolDetail.viewCount} times.
                  </Text>
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
