import { useBoolean } from "@fluentui/react-hooks";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { unwrapResult } from "@reduxjs/toolkit";
import { jsPDF } from "jspdf";
import {
  Checkbox,
  ChoiceGroup,
  CommandBarButton,
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  IChoiceGroupOption,
  IStackItemTokens,
  IStackTokens,
  Label,
  Panel,
  PrimaryButton,
  Stack,
  TextField,
} from "office-ui-fabric-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import ReactTags from "react-tag-autocomplete";
import { FileUploadPreview, SspSpinner } from "../components";
import useWebtrends from "../hooks/useWebtrends";
import { AnswerType, ToolAnswer, ToolStatus } from "../model";
import {
  addUpdateToolAnswer,
  getAllToolQuestions,
  getTemporaryAnswer,
  getToolVersions,
  removeToolAnswerAttachment,
} from "../store/slicers/toolsSlicer";
import styles from "../styles/sspStyle.module.scss";

const options: IChoiceGroupOption[] = [
  { key: "yes", text: "YES", defaultValue: "Yes" },
  { key: "no", text: "NO", defaultValue: "No" },
];
const mainTokens: IStackTokens = { childrenGap: "l1" };
const buttonTokens: IStackItemTokens = { margin: "l1" };
const tokens = {
  sectionStack: {
    childrenGap: 25,
  },
  headingStack: {
    childrenGap: 5,
  },
  contentStack: {
    childrenGap: 10,
  },
  itemStack: {
    padding: "10px",
  },
};
const KeyCodes = {
  comma: 188,
  enter: 13,
};

const delimiters = [KeyCodes.comma, KeyCodes.enter];

type TProps = {
  context: WebPartContext;
  graph: any;
};

export const NewTool: React.FC<TProps> = (props) => {
  const { id } = useParams();
  const history = useHistory();
  useWebtrends();
  const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);

  const { entities } = useSelector((state) => state.nav);

  const { questions } = useSelector((state) => state.tool);
  const { loading, error } = useSelector((state) => state.app);
  const { keyWords } = useSelector((state) => state.nav);
  const dispatch = useDispatch();
  const [toolAnswer, setToolAnswer] = useState({});
  const [fullAnswer, setFullAnswer] = useState(null);
  const [toolVersions, setToolVersions] = useState([]);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [screenShots, setScreenShots] = useState([]);
  const [documentations, setDocumentations] = useState([]);
  const [newId, setNewId] = useState(null);
  const [userAgreed, setUserAgreed] = useState(false);
  const [showSideTagsMenu, setShowSideTagsMenu] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [tags, setTags] = React.useState([]);
  const suggestions = keyWords.map((k) => {
    return { id: k.key, name: k.name };
  });
  const handleDelete = (i, name) => {
    const newTags = tags.filter((tag, index) => index !== i);
    setTags(newTags);
    setToolAnswer((prev) => ({
      ...prev,
      [name]: newTags.map((t) => JSON.stringify(t)).join(";"),
    }));
  };

  const handleAddition = (tag, name) => {
    const newTags = [...tags, tag];
    setTags(newTags);
    setToolAnswer((prev) => ({
      ...prev,
      [name]: newTags.map((t) => JSON.stringify(t)).join(";"),
    }));
  };

  const getUserDisplayName = async (emails) => {
    var names = [];
    emails.forEach(async (email) => {
      const user = await props.graph.users.getById(email);
      names.push(user.displayName);
    });

    return names.join("; ");
  };

  const extractContent = (s) => {
    var span = document.createElement("span");
    span.innerHTML = s;
    return span.textContent || span.innerText;
  };

  const generatePDF = async () => {
    const doc = new jsPDF("portrait", "pt", "a4");
    var dwidth = doc.internal.pageSize.getWidth();
    var dheight = doc.internal.pageSize.getHeight();
    const title = toolAnswer["Title"];
    doc.setFontSize(15);
    const textWidth = doc.getTextWidth(title);
    var xOffset =
      doc.internal.pageSize.width / 2 -
      (doc.getStringUnitWidth(title) * 15) / 2;
    doc.text(title, xOffset, 45);
    doc.line(xOffset, 50, xOffset + textWidth, 50);

    var initialY = 80;

    var qOrder = 1;

    questions.forEach((question, i) => {
      if (question.answerType !== AnswerType.Attachment) {
        doc.setFontSize(12);
        const titleLines = doc.splitTextToSize(
          `${
            question.answerType === AnswerType.NoAnswer ? "" : qOrder++ + "."
          } ${question.title}`,
          dwidth - 45
        );

        var tempY = initialY + titleLines.length * 15 + 40;
        if (tempY >= dheight) {
          doc.addPage();
          initialY = 70;
          dheight = doc.internal.pageSize.getHeight();
        }

        doc.setFont("Open Sans", "normal", "bold");
        doc.text(titleLines, 30, initialY);

        doc.setFontSize(10);
        const captionLines = doc.splitTextToSize(
          extractContent(question.caption),
          dwidth - 55
        );

        tempY = initialY + captionLines.length * 15 + 40;
        if (tempY >= dheight) {
          doc.addPage();
          initialY = 70;
          dheight = doc.internal.pageSize.getHeight();
        } else {
          initialY = initialY + titleLines.length * 15 + 8;
        }

        doc.setFont("Open Sans", "normal");
        doc.text(captionLines, 30, initialY);
        initialY = initialY + captionLines.length * 15 + 8;

        var answerText = `Response: `;

        if (
          toolAnswer[question.fieldName] &&
          (question.answerType === AnswerType.LongText ||
            question.answerType === AnswerType.ShortText ||
            question.answerType === AnswerType.YesNo)
        )
          answerText = answerText + toolAnswer[question.fieldName];

        if (
          toolAnswer[question.fieldName] &&
          question.answerType === AnswerType.Person
        )
          answerText =
            answerText +
            toolAnswer[question.fieldName].map((p) => p.name).join("; ");

        if (
          question.answerType === AnswerType.YesNoConditional &&
          toolAnswer[question.fieldName] === "no" &&
          toolAnswer[`${question.fieldName}_Person`]
        )
          answerText =
            answerText +
            toolAnswer[`${question.fieldName}_Person`]
              .map((p) => p.name)
              .join("; ");

        if (
          toolAnswer[question.fieldName] &&
          question.answerType === AnswerType.Tags
        )
          answerText =
            answerText +
            toolAnswer[question.fieldName]
              .split(";")
              .map((t) => JSON.parse(t).name)
              .join("; ");

        if (
          question.answerType === AnswerType.ScreenShot &&
          screenShots &&
          screenShots.length > 0
        ) {
          screenShots.forEach((s) => {
            var img = new Image();
            img.src = s.preview;
            const imgProps = doc.getImageProperties(img);
            const pdfHeight =
              (imgProps.height * (dwidth - 45)) / imgProps.width;
            doc.addImage(img, "png", 30, initialY, dwidth - 45, pdfHeight);
            initialY += dheight;
            if (initialY >= dheight) {
              doc.addPage();
              initialY = 70;
              dheight = doc.internal.pageSize.getHeight();
            }
          });
        } else {
          doc.setFontSize(10);
          const answerLines = doc.splitTextToSize(answerText, dwidth - 80);
          tempY = initialY + answerLines.length * 15 + 40;
          if (tempY >= dheight) {
            doc.addPage();
            initialY = 70;
            dheight = doc.internal.pageSize.getHeight();
          }
          doc.setFont("Open Sans", "normal", "bold");
          if (question.answerType !== AnswerType.NoAnswer)
            doc.text(answerLines, 40, initialY);

          if (
            toolAnswer[`${question.fieldName}_url`] &&
            question.answerType === AnswerType.Link
          ) {
            if (toolAnswer[`${question.fieldName}_altText`]) {
              doc.text(
                toolAnswer[`${question.fieldName}_altText`],
                88,
                initialY
              );
              initialY = initialY + 15;
            }
            //doc.setTextColor(0, 0, 255);
            doc.text(toolAnswer[`${question.fieldName}_url`], 88, initialY);
            // doc.textWithLink(
            //   toolAnswer[`${question.fieldName}_altText`],
            //   88,
            //   initialY,
            //   {
            //     url: toolAnswer[`${question.fieldName}_url`],
            //   }
            // );
            doc.setTextColor(0, 0, 0);
          }

          initialY = initialY + answerLines.length * 15 + 15;
        }
      }
    });

    const userAgreement = `By clicking here, I acknowledge receipt of, understand my responsibilities, and will comply with all relevant NSF policies such as NSF Rules of Behavior for Access to IT Resources and OD-18-10 - Interim Guidance on sharing of Non-public NSF Information.`;
    const agreement = doc.splitTextToSize(userAgreement, dwidth - 50);
    doc.setFont("Open Sans", "normal", "bold");
    doc.text(agreement, 30, initialY);
    doc.setFontSize(10);
    doc.setFont("Open Sans", "normal", "bold");
    const firstVersion = [...toolVersions].reverse()[0];
    const i = firstVersion.CreatedBy.indexOf(")");
    const initiallyAuthor = firstVersion.CreatedBy.slice(0, i + 1);
    const initiallyAuthorDate = new Date(
      firstVersion.CreatedDate
    ).toLocaleDateString();
    const initialText = `Initially Submitted By: ${initiallyAuthor} - On: ${initiallyAuthorDate}`;
    doc.text(initialText, 30, initialY + 40, { align: "left" });
    if (fullAnswer.status === ToolStatus.Submitted && fullAnswer.submittedOn) {
      const submitText = `Final Submitted By: ${
        fullAnswer.submittedBy
      } - On: ${new Date(fullAnswer.submittedOn).toLocaleDateString("en-US")}`;
      doc.text(submitText, 30, initialY + 60, { align: "left" });
    }
    doc.save(`${title}.pdf`);
  };

  useEffect(() => {
    let isActive = true;
    const getQuestionAnswers = async () => {
      if (isActive) {
        await dispatch(getAllToolQuestions());
        if (id) {
          const result = await dispatch(getTemporaryAnswer(id));
          const vResults = await dispatch(getToolVersions(id));
          if (getTemporaryAnswer.fulfilled.match(result)) {
            const entireAnswer = unwrapResult(result);
            const versions = unwrapResult(vResults);
            const answer = entireAnswer.answerJson;
            setFullAnswer(entireAnswer);
            setToolAnswer(answer);
            setToolVersions(versions);
            setTags(
              answer["Tags"]
                ? answer["Tags"].split(";").map((i) => JSON.parse(i))
                : []
            );
            if (
              result.payload.Attachments &&
              result.payload.Attachments.length > 0
            ) {
              const attFiles = result.payload.Attachments.map((f) => {
                return { name: f.FileName, preview: f.ServerRelativeUrl };
              });
              setScreenShots(
                attFiles.filter((f) => f.name.includes("screenshot"))
              );
              setDocumentations(
                attFiles.filter((f) => f.name.includes("document"))
              );
            }
          } else throw Error("There is an error loading tool answers");
        }
      }
    };
    if (isActive) getQuestionAnswers();
    return () => {
      isActive = false;
    };
  }, []);

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

  const onRemoveAttachment = (name) => {
    if (id) {
      dispatch(removeToolAnswerAttachment({ name, id }));
    }
  };

  const startValidation = () => {
    const reqFields = questions.filter((q) => q.isRequired);
    let errorsExist = false;
    reqFields.forEach((f) => {
      if (!toolAnswer[f.fieldName]) {
        errorsExist = true;
        setErrors((errors) => {
          return {
            ...errors,
            [f.fieldName]: f.errorMessage,
          };
        });
      }
    });
    return errorsExist;
  };

  const questionSubmitHandler = async (event) => {
    event.preventDefault();
    const errorsExist = startValidation();
    //@ts-ignore
    if (errorsExist && errors && Object.keys(errors).length > 0) {
      toggleHideDialog();
      return;
    }
    setConfirmationMessage(
      "You have successfully saved your tool information."
    );
    if (toolAnswer && Object.keys(toolAnswer).length > 0) {
      const answer: ToolAnswer = {
        id: !id ? newId : id,
        answerJson: JSON.stringify(toolAnswer),
        status: ToolStatus.Pending,
      };
      if (event.nativeEvent.submitter.name === "Submit") {
        answer.status = ToolStatus.Submitted;
        answer.submittedOn = new Date();
        setConfirmationMessage(
          "You have successfully submitted your tool information."
        );
      }
      if (screenShots && screenShots.length > 0)
        //@ts-ignore
        answer.fileInfos = await blob(screenShots, documentations);
      const addResult = await dispatch(addUpdateToolAnswer(answer));
      if (addUpdateToolAnswer.fulfilled.match(addResult)) {
        const id = unwrapResult(addResult);
        setNewId(id);
        toggleHideDialog();
      }
    }
  };
  const onCancelHandler = () => {
    history.goBack();
  };
  const onSuccessOk = () => {
    if (errors && Object.keys(errors).length > 0) {
      toggleHideDialog();
      return;
    }
    history.goBack();
  };

  const inputChangeHandler = (evt, option) => {
    const { name, value: newValue, type } = evt.target;
    const value = type === "radio" ? option.key : newValue;
    setToolAnswer((prev) => ({ ...prev, [name]: value }));
    setTouched({ ...touched, [name]: true });
  };

  const errorValidation = (field, fieldValue) => {
    const question = questions.filter((q) => field.includes(q.fieldName))[0];
    if (question.isRequired && fieldValue.trim() === "") {
      return question.errorMessage;
    }
    return null;
  };

  const handleBlur = (evt) => {
    const { name, value } = evt.target;
    //@ts-ignore
    const { [name]: removedError, ...rest } = errors;
    const error = errorValidation(name, value);
    setErrors({
      ...rest,
      ...(error && { [name]: touched[name] && error }),
    });
  };

  const getPeoplePickerItems = (fieldName, items: any[]) => {
    setToolAnswer((prev) => ({
      ...prev,
      [fieldName]: items.map((c) => {
        return { email: c.loginName.split("|")[2], name: c.text };
      }),
    }));
  };

  const onAgreeCheck = (ev, isChecked) => {
    setUserAgreed(isChecked);
  };
  const onRenderLabel = () => {
    return (
      <label
        className={styles.fCaption_blue}
        onClick={() => {
          setUserAgreed(!userAgreed);
        }}
      >
        By clicking here, I acknowledge receipt of, understand my
        responsibilities, and will comply with all relevant{" "}
        <a
          target="_blank"
          href="https://inside.nsf.gov/internalservices/informationtechnology/itsecurityPrivacyInsiderThreatProgram/Pages/default.aspx"
        >
          NSF IT Security and Privacy
        </a>{" "}
        policies and{" "}
        <a
          target="_blank"
          href="https://nsf.sharepoint.com/sites/dah/SitePages/policies.aspx"
        >
          Data and Analytics
        </a>{" "}
        policies.
      </label>
    );
  };

  const successDialogContentProps = {
    type: DialogType.normal,
    title: "Success",
    closeButtonAriaLabel: "Close",
    subText: confirmationMessage,
  };

  const errorDialogContentProps = {
    type: DialogType.normal,
    title: "Error",
    closeButtonAriaLabel: "Close",
    subText: "Please scroll up and correct all errors!",
  };

  if (error) throw error;

  var displayNumber = 0;

  return (
    <>
      <SspSpinner condition={!loading}>
        <div className={styles.tools}>
          <Dialog
            hidden={hideDialog}
            onDismiss={toggleHideDialog}
            dialogContentProps={
              errors && Object.keys(errors).length > 0
                ? errorDialogContentProps
                : successDialogContentProps
            }
          >
            <DialogFooter>
              <PrimaryButton onClick={onSuccessOk} text="OK" />
            </DialogFooter>
          </Dialog>

          <Stack horizontal>
            <Stack.Item grow>
              <CommandBarButton
                style={{
                  backgroundColor: "#3055a6",
                  padding: "20px",
                }}
                iconProps={{ iconName: "ChevronLeft" }}
                styles={{
                  label: { fontWeight: "bolder", color: "white" },
                  icon: { color: "white", fontSize: "30px" },
                }}
                text="GO BACK"
                ariaLabel="GO BACK"
                onClick={() => history.goBack()}
              />
            </Stack.Item>
            <Stack.Item>
              <div className={styles.subHeader} style={{ margin: "0px" }}>
                NEW TOOL FORM
              </div>
            </Stack.Item>
          </Stack>

          <div
            className={`${styles.gradientBg} ${styles.ph40} ${styles.pv20}`}
            id="dvToolContainer"
          >
            {questions && questions.length > 0 ? (
              <form
                onSubmit={questionSubmitHandler}
                autoComplete="off"
                noValidate
              >
                <Stack tokens={tokens.sectionStack}>
                  {questions.map((question, index) => (
                    <Stack.Item key={question.id}>
                      <Label
                        className={
                          question.answerType === AnswerType.NoAnswer
                            ? styles.fCaption_blue_large
                            : styles.fCaption_blue
                        }
                        required={question.isRequired}
                      >
                        {`${
                          question.answerType === AnswerType.NoAnswer
                            ? ""
                            : ++displayNumber + "."
                        } ${question.title}`}
                      </Label>
                      <span
                        style={{ color: "#a19f9d" }}
                        className={styles.label}
                        dangerouslySetInnerHTML={{ __html: question.caption }}
                      />
                      <Label disabled className={styles.label}>
                        {question.answerType === AnswerType.Tags && (
                          <a
                            href="javascript:void(0);"
                            onClick={() =>
                              setShowSideTagsMenu(!showSideTagsMenu)
                            }
                          >
                            Click Here to see the entire Tags List
                          </a>
                        )}
                      </Label>
                      <div>
                        {question.answerType === AnswerType.Tags && (
                          <ReactTags
                            tags={tags}
                            placeholderText="Keywords"
                            suggestions={suggestions}
                            onDelete={(i) =>
                              handleDelete(i, question.fieldName)
                            }
                            onAddition={(t) =>
                              handleAddition(t, question.fieldName)
                            }
                          />
                        )}
                        {question.answerType === AnswerType.ShortText && (
                          <TextField
                            name={question.fieldName}
                            onChange={inputChangeHandler}
                            onBlur={handleBlur}
                            value={toolAnswer[question.fieldName]}
                          />
                        )}
                        {question.answerType === AnswerType.LongText && (
                          <TextField
                            multiline
                            rows={3}
                            name={question.fieldName}
                            onChange={inputChangeHandler}
                            onBlur={handleBlur}
                            value={toolAnswer[question.fieldName]}
                          />
                        )}
                        {question.answerType === AnswerType.YesNo && (
                          <ChoiceGroup
                            options={options}
                            name={question.fieldName}
                            onChange={inputChangeHandler}
                            selectedKey={toolAnswer[question.fieldName]}
                          />
                        )}
                        {question.answerType ===
                          AnswerType.YesNoConditional && (
                          <>
                            <ChoiceGroup
                              options={options}
                              name={question.fieldName}
                              onChange={inputChangeHandler}
                              selectedKey={toolAnswer[question.fieldName]}
                            />
                            <br />
                            {toolAnswer[question.fieldName] === "no" && (
                              <PeoplePicker
                                context={props.context}
                                showtooltip={true}
                                personSelectionLimit={4}
                                defaultSelectedUsers={
                                  toolAnswer[`${question.fieldName}_Person`] &&
                                  toolAnswer[
                                    `${question.fieldName}_Person`
                                  ].map((p) => p.email)
                                }
                                placeholder={"Select user"}
                                showHiddenInUI={false}
                                principalTypes={[
                                  PrincipalType.User,
                                  PrincipalType.SharePointGroup,
                                  PrincipalType.DistributionList,
                                ]}
                                resolveDelay={1000}
                                onChange={(e) =>
                                  getPeoplePickerItems(
                                    `${question.fieldName}_Person`,
                                    e
                                  )
                                }
                              />
                            )}
                          </>
                        )}
                        {question.answerType === AnswerType.Link && (
                          <Stack
                            disableShrink
                            horizontal
                            tokens={mainTokens}
                            style={{ width: "100%" }}
                          >
                            <Stack.Item grow={3} disableShrink>
                              <TextField
                                name={`${question.fieldName}_url`}
                                placeholder="URL"
                                onChange={inputChangeHandler}
                                onBlur={handleBlur}
                                value={toolAnswer[`${question.fieldName}_url`]}
                              />
                            </Stack.Item>
                            <Stack.Item grow={1}>
                              <TextField
                                name={`${question.fieldName}_altText`}
                                placeholder="Alt Text"
                                onChange={inputChangeHandler}
                                onBlur={handleBlur}
                                value={
                                  toolAnswer[`${question.fieldName}_altText`]
                                }
                              />
                            </Stack.Item>
                          </Stack>
                        )}
                        {question.answerType === AnswerType.Person && (
                          <PeoplePicker
                            context={props.context}
                            personSelectionLimit={4}
                            showtooltip={true}
                            defaultSelectedUsers={
                              toolAnswer[question.fieldName] &&
                              toolAnswer[question.fieldName].map((p) => p.email)
                            }
                            placeholder={"Select user"}
                            showHiddenInUI={false}
                            principalTypes={[
                              PrincipalType.User,
                              PrincipalType.SharePointGroup,
                              PrincipalType.DistributionList,
                            ]}
                            resolveDelay={1000}
                            onChange={(e) =>
                              getPeoplePickerItems(question.fieldName, e)
                            }
                          />
                        )}
                        {question.answerType === AnswerType.Attachment && (
                          <FileUploadPreview
                            files={documentations}
                            onSetFiles={setDocumentations}
                            onRemoveFile={onRemoveAttachment}
                            screenshotsOnly={false}
                          />
                        )}
                        {question.answerType === AnswerType.ScreenShot && (
                          <FileUploadPreview
                            files={screenShots}
                            onSetFiles={setScreenShots}
                            onRemoveFile={onRemoveAttachment}
                            screenshotsOnly
                          />
                        )}
                        {question.isRequired && (
                          <Label className={styles.error}>
                            {errors[question.fieldName]}
                          </Label>
                        )}
                      </div>
                    </Stack.Item>
                  ))}
                </Stack>

                <br />
                <br />

                <div>
                  <Checkbox
                    className={styles.fCaption_blue}
                    checked={userAgreed}
                    onRenderLabel={onRenderLabel}
                    label={`By clicking here, I acknowledge receipt of, understand my responsibilities, and will comply with all relevant 
                    NSF policies such as 
                    <a target='_blank' href='https://inside.nsf.gov/internalservices/informationtechnology/itsecurityPrivacyInsiderThreatProgram/Pages/default.aspx'>NSF Rules of Behavior for Access to IT Resources</a>
                     and 
                     OD-18-10 - Interim Guidance on sharing of Non-public NSF Information.`}
                    onChange={onAgreeCheck}
                  />
                </div>

                <br />
                <br />
                {fullAnswer && fullAnswer.status === ToolStatus.Submitted && (
                  <div>
                    <span>
                      {`Submitted By: ${
                        fullAnswer.submittedBy
                      } - Submitted On: ${new Date(
                        fullAnswer.submittedOn
                      ).toLocaleDateString("en-US")}`}
                    </span>
                  </div>
                )}

                <br />
                <br />
                <Stack horizontal>
                  <Stack.Item grow align="start" tokens={buttonTokens}>
                    <Stack horizontal>
                      <PrimaryButton
                        text="Save"
                        type="submit"
                        name="Save"
                        disabled={!userAgreed}
                      />
                      <div className={styles.ph40} />
                      <DefaultButton text="Cancel" onClick={onCancelHandler} />
                      <div className={styles.ph40} />
                      <DefaultButton
                        text="Generate PDF"
                        onClick={generatePDF}
                      />
                    </Stack>
                  </Stack.Item>
                  <Stack.Item align="end">
                    <PrimaryButton
                      text="Submit"
                      type="submit"
                      name="Submit"
                      disabled={!userAgreed}
                    />
                  </Stack.Item>
                </Stack>
              </form>
            ) : (
              <Stack tokens={tokens.sectionStack} horizontalAlign="center">
                <span className={styles.fHeader_blue}>
                  There are no questions
                </span>
              </Stack>
            )}
          </div>
          <div className={styles.p20} />
        </div>
      </SspSpinner>
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
                            handleAddition({ id: l.key, name: l.name }, "Tags")
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
    </>
  );
};
