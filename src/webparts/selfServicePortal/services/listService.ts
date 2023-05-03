import { sp, SPHttpClient } from "@pnp/sp";
import { IAttachmentInfo } from "@pnp/sp/attachments";
import "@pnp/sp/comments/item";
import "@pnp/sp/items";
import { PagedItemCollection } from "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users/web";
import "@pnp/sp/webs";
import { Web } from "@pnp/sp/webs";
import _ from "lodash";
import { mapSoftwareItems } from "../mappers";
import {
  mapArticleItems,
  mapHopperFeatures,
  mapResourceItems,
} from "../mappers/listItemsMapper";
import {
  Article,
  HopperFeature,
  LeftNavItem,
  LeftNavSection,
  Resource,
  SoftwareItem,
  ToolReview,
} from "../model";
import {
  PointOfContact,
  ToolAnswer,
  ToolQuestion,
  ToolStatus,
  ToolVideo,
} from "./../model/SoftwareItem";
const ACTIVE_FILTER = "IsActive eq '1'";
const SSP_HopperFeatures = "SSP_HopperFeatures";
const SSP_ARTICLES = "SSP_Articles";
const SSP_RESOURCES = "SSP_Resources";
const SSP_LeftNavigation = "SSP_LeftNavigation";
const SSP_NSFTools = "SSP_NSFTools";
const SSP_ToolLinks = "SSP_ToolLinks";
const SSP_ToolVideos = "SSP_ToolVideos";
const SSP_ToolQuestions = "SSP_ToolQuestions";
const SSP_ToolAnswers = "SSP_ToolAnswers";
const SSP_CreatorDetail = "SSP_CreatorDetail";
const SSP_SELECT =
  "Id,Title,Description,Status,DownloadLink,Creator/Id,Creator/Title,Creator/EMail,Guide,Maturity,AverageRating,RatingCount,Tags,ViewCount,TeamChannelLink";

interface IListService {
  getAllUserBadges(): Promise<any>;
  getToolTags(): Promise<any>;
  getLeftNavItems(): Promise<LeftNavSection[]>;
  getSoftwareToolsList(status: ToolStatus): Promise<SoftwareItem[]>;
  getSoftwareToolsCount(): Promise<number>;
  getPagedSoftwareToolsList();
  getFeaturedTool(): Promise<SoftwareItem>;
  getSoftwareToolDetail(toolId: number): Promise<SoftwareItem>;
  addNewSoftwareTool(newItem: SoftwareItem): Promise<void>;
  getYourPendingSubmissions(): Promise<SoftwareItem[]>;
  getRecentlyAddedTools(): Promise<SoftwareItem[]>;
  getFrequentlyViewedTools(): Promise<SoftwareItem[]>;
  updateSoftwareTool(item: SoftwareItem): Promise<boolean>;
  getHomePageResources(): Promise<Resource[]>;
  getHomePageArticles(): Promise<Article[]>;
  addToolReviewComment(toolId: number, comment: string): Promise<ToolReview>;
  getAllToolReviews(toolId): Promise<ToolReview[]>;
  rateSoftwareTool(toolId: number, rating: number): Promise<Number>;
  getAllToolQuestions(): Promise<ToolQuestion[]>;
  getTemporaryAnswer(id): Promise<ToolAnswer>;
  addUpdateToolAnswer(answer: ToolAnswer): Promise<number>;
  removeItemAttachment(name, id, source): Promise<void>;
  getMySubmittedTools(status: ToolStatus): Promise<ToolAnswer[]>;
  getPendingApprovalTools(): Promise<ToolAnswer[]>;
  isUserInApprroverGroup(): Promise<boolean>;
  updateSubmittedToolStatus(id, status, approverComment): Promise<boolean>;
  loadHopperFeatures(): Promise<HopperFeature[]>;
  getCreatorBios(pocs: any[]): Promise<PointOfContact[]>;
  addUpdateCreatorBio(poc: PointOfContact): Promise<boolean>;
  deleteToolLink(id): Promise<void>;
  saveToolLink(link): Promise<boolean>;
  deleteToolVideo(id): Promise<void>;
  saveToolVideo(link): Promise<boolean>;
  getToolVideos(toolId: number): Promise<ToolVideo[]>;
  getVersionForListItem(
    listName: string,
    listItemId: number,
    fields?: string[]
  ): Promise<any[]>;
}

class ListServiceImpl implements IListService {
  getAllUserBadges = async (): Promise<any> => {
    const badgrWeb = Web("https://nsf.sharepoint.com/sites/badgr/");
    const allBadgeClasses: any[] = await badgrWeb.lists
      .getByTitle("BadgeClasses")
      .items.getAll()
      .then((result) => {
        if (!result) return [];
        return result.map((b) => {
          return {
            badgeClassId: b.EntityId,
            badgeClassName: b.Title,
            badgeClassImageUrl: b.ImageUrl,
            description: b.Description,
          };
        });
      });
    return badgrWeb.lists
      .getByTitle("Assertions")
      .items.getAll()
      .then((result) => {
        if (!result) return [];
        return result.map((a) => {
          const badgeClass = allBadgeClasses.find(
            (b) => b.badgeClassId === a.BadgeClass
          );
          return {
            badgeClassName: badgeClass.badgeClassName,
            badgeClassImageUrl: badgeClass.badgeClassImageUrl,
            recipientEmail: a.RecipientEmail,
            issuedOn: a.IssuedOn,
            narrative: a.Narrative,
            assertionId: a.EntityId,
            description: badgeClass.description,
            acceptance:
              a.Acceptance && a.Acceptance === "Accepted" ? true : false,
          };
        });
      })
      .catch((error) => {
        throw error;
      });
  };
  updateSoftwareTool = async (item: SoftwareItem): Promise<boolean> => {
    let tool = sp.web.lists.getByTitle(SSP_NSFTools).items.getById(item.Id);
    const pocIds = item.pocs.map((p) => p.id);
    try {
      if (item.fileInfos && item.fileInfos.length > 0) {
        const newFiles = item.fileInfos.filter((f) => f.content);
        await tool.attachmentFiles.addMultiple(newFiles);
      }
      if (item.Tags && item.Tags.length > 0) {
        tool.update({
          Tags: item.Tags.join(";"),
          Title: item.title,
          Description: item.description,
          CreatorId: { results: pocIds },
          Guide: item.guide,
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  getYourPendingSubmissions = async (): Promise<SoftwareItem[]> => {
    const currentUser = await sp.web.currentUser.get();
    const yourSubmissions = await sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.filter(`Author eq ${currentUser.Id} and Status eq 'Draft'`)
      .select(SSP_SELECT)
      .expand("Creator")
      .get();
    return mapSoftwareItems(yourSubmissions, false);
  };

  getRecentlyAddedTools = async (): Promise<SoftwareItem[]> => {
    const yourSubmissions = await sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.filter(`Status eq 'Approved'`)
      .orderBy("Created", false)
      .top(5)
      .select(SSP_SELECT)
      .expand("Creator")
      .get();
    return mapSoftwareItems(yourSubmissions, false);
  };

  getFrequentlyViewedTools = async (): Promise<SoftwareItem[]> => {
    const yourSubmissions = await sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.filter(`Status eq 'Approved'`)
      .orderBy("ViewCount", false)
      .top(5)
      .select(SSP_SELECT)
      .expand("Creator")
      .get();
    return mapSoftwareItems(yourSubmissions, false);
  };

  getToolTags = async () => {
    const allItems: any[] = await sp.web.lists
      .getByTitle(SSP_LeftNavigation)
      .items.filter(`IsActive eq 1`)
      .get();

    return allItems.map((i) => ({ key: i.key, name: i.name }));
  };
  getLeftNavItems = async (): Promise<LeftNavSection[]> => {
    const allItems: any[] = await sp.web.lists
      .getByTitle(SSP_LeftNavigation)
      .items.filter(`IsActive eq 1`)
      .orderBy("DisplayOrder", true)
      .get();
    const dict = _.groupBy(allItems, "Category");
    return _.map(dict, (value, key) => {
      const items: LeftNavItem[] = value.map(({ Id, key, name, url }) => ({
        Id,
        key,
        name,
        url,
      }));
      const navSec: LeftNavSection = {
        name: key,
        links: _.sortBy(items, "name"),
      };
      return navSec;
    });
  };

  getHomePageResources = async (): Promise<Resource[]> => {
    const allItems: any[] = await sp.web.lists
      .getByTitle(SSP_RESOURCES)
      .items.filter(ACTIVE_FILTER)
      .get();
    return mapResourceItems(allItems);
  };

  getHomePageArticles = async (): Promise<Article[]> => {
    const allItems: any[] = await sp.web.lists
      .getByTitle(SSP_ARTICLES)
      .items.filter(ACTIVE_FILTER)
      .get();
    return mapArticleItems(allItems);
  };

  getSoftwareToolsCount = async (): Promise<number> => {
    return sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.filter(`Status eq 'Approved'`)
      .get()
      .then((result) => {
        if (!result) return 0;
        return result.length;
      });
  };

  getAllItems = async (web, query) => {
    try {
      let returnedItems = [];

      const getData = await sp.web.lists
        .getByTitle(SSP_NSFTools)
        .items.select(SSP_SELECT)
        .expand("Creator")
        .filter(`Status eq 'Approved'`)
        .top(3)
        .getPaged()
        .then((page) => {
          if (page) {
            // data was returned, so concat the results
            returnedItems = returnedItems.concat(page.results);
            return page;
          } else {
            return;
          }
        });

      if (getData.hasNext) {
        return returnedItems.concat(
          await this.pageData(getData).then((result) => {
            return result;
          })
        );
      } else {
        return returnedItems;
      }
    } catch (e) {
      console.log("error - ", e);
      return {
        body: e.data.responseBody
          ? e.data.responseBody["odata.error"].message.value
          : e,
        status: e.status,
        statusText: e.statusText,
      };
    }
  };

  pageData = async (data) => {
    try {
      let returnedItems = [];

      const getPage = await data.getNext().then((page) => {
        if (page) {
          // data was returned so concat the results
          returnedItems = returnedItems.concat(page.results);
          return page;
        } else {
          return;
        }
      });

      if (getPage.nextUrl) {
        // still have more pages, so go get more
        return returnedItems.concat(await this.pageData(getPage));
      } else {
        // we've reached the last page
        return returnedItems;
      }
    } catch (e) {
      return {
        body: e.data.responseBody
          ? e.data.responseBody["odata.error"].message.value
          : e,
        status: e.status,
        statusText: e.statusText,
      };
    }
  };

  getSoftwareToolsList = async (
    status: ToolStatus
  ): Promise<SoftwareItem[]> => {
    const allItems = await sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.select(SSP_SELECT)
      .expand("Creator")
      .filter(`Status eq '${status}'`)
      .orderBy("Title", true)
      .get();
    return mapSoftwareItems(allItems, false);
  };

  getPagedSoftwareToolsList = async (): Promise<PagedItemCollection<any[]>> => {
    return sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.select(SSP_SELECT)
      .expand("Creator")
      .filter(`Status eq 'Approved'`)
      .top(3)
      .getPaged();
  };

  getFeaturedTool = async (): Promise<SoftwareItem> => {
    const featuredItem = await sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.filter(`IsFeatured eq 1`)
      .top(1)
      .select(SSP_SELECT)
      .expand("Creator")
      .get();
    if (!featuredItem) return null;
    return mapSoftwareItems(featuredItem, false)[0];
  };

  getSoftwareToolDetail = async (id) => {
    const currentUser = await sp.web.currentUser.get();
    const isUserApprover = await this.isUserInApprroverGroup();

    const item = sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.getById(id)
      .select(SSP_SELECT)
      .expand("Creator");
    const comments = await item.comments();
    const info: IAttachmentInfo[] = await item.attachmentFiles();
    const response = await item.get();
    response["attachments"] = info;
    const retVal = mapSoftwareItems(response, true)[0];
    retVal.reviewCount = 0;
    if (comments && comments.length > 0) {
      const latestComment = [];
      const comment = comments[0];
      latestComment.push({
        comment: comment.text,
        reviewer: comment.author.name,
        timestamp: comment.createdDate,
      });
      retVal.reviews = latestComment;
      retVal.reviewCount = comments.length;
    }
    retVal.pocs = await this.getCreatorBios(retVal.pocs);
    retVal.links = await this.getToolLinks(id);
    retVal.viewCount += 1;
    retVal.canUserEdit =
      isUserApprover ||
      retVal.pocs.findIndex((p) => p.email === currentUser.Email) > -1;
    item.update({ ViewCount: retVal.viewCount });
    return retVal;
  };

  getToolLinks = (id: number): Promise<any> => {
    return sp.web.lists
      .getByTitle(SSP_ToolLinks)
      .items.select("Title,Url, Id")
      .filter("ToolId eq '" + id + "'")
      .get()
      .then((results) => {
        if (!results) return [];
        return results.map((l) => {
          return { title: l.Title, url: l.Url, id: l.Id, toolId: l.ToolId };
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  deleteToolVideo = (id: number): Promise<any> => {
    return sp.web.lists.getByTitle(SSP_ToolVideos).items.getById(id).delete();
  };

  saveToolLink = (link): Promise<boolean> => {
    if (link.id) {
      const item = sp.web.lists
        .getByTitle(SSP_ToolLinks)
        .items.getById(link.id);
      return item
        .update({ Title: link.title, Url: link.url, ToolIdId: link.toolId })
        .then(() => {
          return true;
        })
        .catch((e) => {
          return false;
        });
    } else
      return sp.web.lists
        .getByTitle(SSP_ToolLinks)
        .items.add({ Title: link.title, Url: link.url, ToolIdId: link.toolId })
        .then(() => {
          return true;
        })
        .catch((e) => {
          return false;
        });
  };

  deleteToolLink = (id: number): Promise<any> => {
    return sp.web.lists.getByTitle(SSP_ToolLinks).items.getById(id).delete();
  };

  saveToolVideo = (link): Promise<boolean> => {
    if (link.id) {
      const item = sp.web.lists
        .getByTitle(SSP_ToolVideos)
        .items.getById(link.id);
      return item
        .update({
          Title: link.title,
          VideoStreamID: link.streamId,
          ToolIDId: link.toolId,
        })
        .then(() => {
          return true;
        })
        .catch((e) => {
          return false;
        });
    } else
      return sp.web.lists
        .getByTitle(SSP_ToolVideos)
        .items.add({
          Title: link.title,
          VideoStreamID: link.streamId,
          ToolIDId: link.toolId,
        })
        .then(() => {
          return true;
        })
        .catch((e) => {
          return false;
        });
  };

  getToolVideos = async (toolId: number): Promise<ToolVideo[]> => {
    return sp.web.lists
      .getByTitle(SSP_ToolVideos)
      .items.select("Title,VideoStreamID, ID")
      .filter("ToolID eq '" + toolId + "'")
      .get()
      .then((results) => {
        if (!results) return [];
        return results.map((l) => {
          return {
            id: l.Id,
            title: l.Title,
            streamId: l.VideoStreamID,
            toolId: toolId,
          } as ToolVideo;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  getCreatorBios = (pocs: any[]): Promise<PointOfContact[]> => {
    if (!pocs || pocs.length == 0) return;
    const filterExp = pocs.map((p) => `(Creator/EMail eq '${p.email}')`);
    return sp.web.lists
      .getByTitle(SSP_CreatorDetail)
      .items.select("Creator/Id, Creator/Title, Creator/EMail, CreatorBio, id")
      .expand("Creator")
      .filter(`(${filterExp.join(` or `)})`)
      .get()
      .then((results) => {
        if (!results) return [];
        return results.map((p) => {
          return {
            name: p.Creator.Title,
            email: p.Creator.EMail,
            bio: p.CreatorBio,
            id: p.Creator.Id,
          };
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  addUpdateCreatorBio = async (poc: PointOfContact): Promise<boolean> => {
    const contact = await sp.web.lists
      .getByTitle(SSP_CreatorDetail)
      .items.filter(`(Creator/EMail eq '${poc.email}')`)
      .top(1)
      .get();
    if (contact && contact.length > 0) {
      try {
        sp.web.lists
          .getByTitle(SSP_CreatorDetail)
          .items.getById(contact[0].Id)
          .update({ CreatorBio: poc.bio });
        return true;
      } catch (e) {
        return false;
      }
    } else {
      return sp.web.lists
        .getByTitle(SSP_CreatorDetail)
        .items.add({
          CreatorId: poc.id,
          CreatorBio: poc.bio,
        })
        .then(() => {
          return true;
        })
        .catch((e) => {
          return false;
        });
    }
  };

  updateToolCreator = async (toolDetail: SoftwareItem): Promise<boolean> => {
    const pocIds = toolDetail.pocs.map((p) => p.id);
    return sp.web.lists
      .getByTitle(SSP_NSFTools)
      .items.getById(toolDetail.Id)
      .update({ CreatorId: { results: [...pocIds] } })
      .then(() => {
        return true;
      })
      .catch((e) => {
        return false;
      });
  };

  addNewSoftwareTool = async (newItem: SoftwareItem): Promise<void> => {
    await sp.web.lists.getByTitle(SSP_NSFTools).items.add({
      Title: newItem.title,
      Description: newItem.description,
      CreatorId: { results: newItem.pocs },
      ViewCount: newItem.viewCount,
    });
  };

  addToolReviewComment = async (
    toolId: number,
    comment: string
  ): Promise<ToolReview> => {
    const item = sp.web.lists.getByTitle(SSP_NSFTools).items.getById(toolId);
    const newComment = await item.comments.add(comment);
    return {
      timestamp: newComment.createdDate,
      comment: newComment.text,
      reviewer: newComment.author.name,
    } as ToolReview;
  };

  getAllToolReviews = async (toolId): Promise<ToolReview[]> => {
    const item = sp.web.lists.getByTitle(SSP_NSFTools).items.getById(toolId);
    const comments = await item.comments();
    if (!comments || comments.length == 0) return [];

    return comments.map(
      (c) =>
        ({
          timestamp: c.createdDate,
          comment: c.text,
          reviewer: c.author.name,
        } as ToolReview)
    );
  };

  getAllToolQuestions = async (): Promise<ToolQuestion[]> => {
    return sp.web.lists
      .getByTitle(SSP_ToolQuestions)
      .items.filter(`IsActive eq 1`)
      .orderBy("DisplayOrder", true)
      .get()
      .then((results) => {
        if (!results || results.length == 0) return [];
        return results.map((p) => {
          return {
            id: p.Id,
            title: p.Title,
            altTitle: p.AltTitle,
            caption: p.Caption,
            displayOrder: p.DisplayOrder,
            answerType: p.AnswerType,
            fieldName: p.FieldName,
            isRequired: p.IsRequired,
            errorMessage: p.ErrorMessage,
          } as ToolQuestion;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  getTemporaryAnswer = async (id): Promise<ToolAnswer> => {
    const item = sp.web.lists.getByTitle(SSP_ToolAnswers).items.getById(id);
    const info: IAttachmentInfo[] = await item.attachmentFiles();

    return item
      .get()
      .then((result) => {
        if (!result) return null;
        return {
          id: result.Id,
          status: result.Status,
          submittedOn: result.SubmittedOn,
          submittedBy: result.SubmittedBy,
          answerJson: {
            Title: result.Title,
            Description: result.Description,
            ...JSON.parse(result.AnswerJson),
          },
          Attachments: info,
        } as ToolAnswer;
      })
      .catch((error) => {
        throw error;
      });
  };

  removeItemAttachment = async (name, id, source): Promise<void> => {
    const item = sp.web.lists.getByTitle(source).items.getById(id);
    await item.attachmentFiles.getByName(name).delete();
  };

  addUpdateToolAnswer = async (answer: ToolAnswer): Promise<number> => {
    const { Title, Description, ...rest } = JSON.parse(answer.answerJson);
    const currentUser = await sp.web.currentUser.get();
    if (answer.id)
      return sp.web.lists
        .getByTitle(SSP_ToolAnswers)
        .items.getById(answer.id)
        .update({
          Title,
          Description,
          AnswerJson: JSON.stringify(rest),
          Status: answer.status,
          SubmittedOn:
            answer.status === ToolStatus.Submitted ? answer.submittedOn : null,
          SubmittedBy:
            answer.status === ToolStatus.Submitted ? currentUser.Title : null,
        })
        .then((result) => {
          if (answer.fileInfos && answer.fileInfos.length > 0) {
            const newFiles = answer.fileInfos.filter((f) => f.content);
            result.item.attachmentFiles.addMultiple(newFiles);
          }
          return answer.id;
        });
    else
      return sp.web.lists
        .getByTitle(SSP_ToolAnswers)
        .items.add({
          Title,
          Description,
          AnswerJson: JSON.stringify(rest),
          Status: answer.status,
          SubmittedOn: answer.submittedOn,
          SubmittedBy:
            answer.status === ToolStatus.Submitted ? currentUser.Title : "",
        })
        .then((result) => {
          if (answer.fileInfos && answer.fileInfos.length > 0)
            result.item.attachmentFiles.addMultiple(answer.fileInfos);
          return result.data.ID;
        });
  };

  rateSoftwareTool = async (
    toolId: number,
    rating: number
  ): Promise<Number> => {
    const client = new SPHttpClient();
    const list = await sp.web.lists.getByTitle(SSP_NSFTools);
    const r = await list.select("Id")();
    const context = await sp.site.getContextInfo();
    const webUrl = context.WebFullUrl;
    const postUrl = `${webUrl}/_api/Microsoft.Office.Server.ReputationModel.Reputation.SetRating(listID='${r.Id}',itemID='${toolId}',rating=${rating})`;
    const requestOption = {
      method: "POST",
      headers: {
        "Content-Type": "application/json;odata=verbose",
        Accept: "application/json;odata=verbose",
      },
    };
    return client
      .post(postUrl, requestOption)
      .then((r) => {
        if (r.ok) {
          return r.json().then((response) => {
            return response.d.SetRating;
          });
        }
      })
      .catch((error) => {
        throw error;
      });
  };

  getMySubmittedTools = async (status: ToolStatus): Promise<ToolAnswer[]> => {
    const currentUser = await sp.web.currentUser.get();
    const items = sp.web.lists
      .getByTitle(SSP_ToolAnswers)
      .items.select(
        "Id,Status,Title,Description,AnswerJson,Author/Title,Created"
      )
      .filter(`Author eq ${currentUser.Id} and Status eq '${status}'`)
      .expand("Author")
      .get();
    return items
      .then((result) => {
        if (!result) return null;
        return result.map((i) => {
          const answer = JSON.parse(i.AnswerJson);
          var authorNames = i.Author.Title;
          if (answer.CreatorName === "no") {
            authorNames = answer.CreatorName_Person
              ? answer.CreatorName_Person.map((p) => p.name).join(";")
              : "";
          }
          return {
            id: i.Id,
            status: i.Status,
            answerJson: {
              Title: i.Title,
              Description: i.Description,
              ...JSON.parse(i.AnswerJson),
            },
            author: authorNames,
            createdBy: i.Author.Title,
            createdOn: i.Created,
          } as ToolAnswer;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  updateSubmittedToolStatus = async (
    id,
    status,
    approverComment
  ): Promise<boolean> => {
    return sp.web.lists
      .getByTitle(SSP_ToolAnswers)
      .items.getById(id)
      .update({
        Status: status,
        ApproverComment: approverComment,
      })
      .then(() => {
        return true;
      })
      .catch((error) => {
        throw error;
      });
  };

  getPendingApprovalTools = async (): Promise<ToolAnswer[]> => {
    const isApprover = await this.isUserInApprroverGroup();
    if (!isApprover) return [];

    const items = sp.web.lists
      .getByTitle(SSP_ToolAnswers)
      .items.select(
        "Id,Status,Title,Description,AnswerJson,Author/Title,Created"
      )
      .filter(`Status eq '${ToolStatus.Submitted}'`)
      .expand("Author")
      .get();
    return items
      .then((result) => {
        if (!result) return null;
        return result.map((i) => {
          const answer = JSON.parse(i.AnswerJson);
          return {
            id: i.Id,
            status: i.Status,
            answerJson: {
              Title: i.Title,
              Description: i.Description,
              ...answer,
            },
            author: answer.CreatorName_Person
              ? answer.CreatorName_Person.map((p) => p.name).join(";")
              : "",
            createdBy: i.Author.Title,
            createdOn: i.Created,
          } as ToolAnswer;
        });
      })
      .catch((error) => {
        throw error;
      });
  };

  isUserInApprroverGroup = async (): Promise<boolean> => {
    return sp.web.currentUser.groups
      .get()
      .then((result) => {
        if (!result || result.length == 0) return false;
        return result.some((g) => g.Title.includes("Hopper_Tool_Approvers"));
      })
      .catch((error) => {
        throw error;
      });
  };

  loadHopperFeatures = async (): Promise<HopperFeature[]> => {
    const allItems: any[] = await sp.web.lists
      .getByTitle(SSP_HopperFeatures)
      .items.get();
    return mapHopperFeatures(allItems);
  };

  //get version history by list name and item id
  public async getVersionForListItem(
    listName: string,
    listItemId: number,
    fields?: string[]
  ): Promise<any[]> {
    let versionHistory: any[] = [];
    const webUrl = await sp.web.get().then((web) => {
      return web.ServerRelativeUrl;
    });
    try {
      return sp.web.lists
        .getByTitle(listName)
        .get()
        .then((listDetails) => {
          let listId = listDetails["Id"];
          let url = `${webUrl}/_api/Web/Lists(guid'${listId}')/Items(${listItemId})/versions`;
          let headers = {
            accept: "application/json; odata=verbose",
          };
          return fetch(url, {
            headers: headers,
          })
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              console.log("getVersionForItemUrl", json);
              let results = json.d && json.d.results ? json.d.results : [];
              versionHistory =
                results.length > 0
                  ? results.map((item) => {
                      let verObj = {
                        VersionLabel: item.VersionLabel,
                        IsCurrentVersion: item.IsCurrentVersion,
                        VersionId: item.VersionId,
                        CreatedDate: item.Created,
                        CreatedBy:
                          item.Author &&
                          item.Author.Email &&
                          item.Author.LookupValue
                            ? item.Author.LookupValue +
                              "(" +
                              item.Author.Email +
                              ")"
                            : "",
                        ModifiedDate: item.Modified,
                        ModifiedBy:
                          item.Editor &&
                          item.Editor.Email &&
                          item.Editor.LookupValue
                            ? item.Editor.LookupValue +
                              "(" +
                              item.Editor.Email +
                              ")"
                            : "",
                      };
                      if (fields && fields.length > 0) {
                        fields.forEach((elm) => {
                          verObj[elm] = item[elm];
                        });
                      }
                      return verObj;
                    })
                  : [];
              return versionHistory;
            })
            .catch((err) => {
              return err;
            });
        });
    } catch (err) {
      return err;
    }
  }
}

export const listService: IListService = new ListServiceImpl();
