import _ from "lodash";
import {
  Article,
  HopperFeature,
  LeftNavItem,
  LeftNavSection,
  Resource,
  SoftwareItem,
} from "../model";

export const mapResourceItems = (allItems) => {
  return allItems.map((r) => {
    const res: Resource = { title: r.Title, url: r.Url };
    return res;
  });
};

export const mapArticleItems = (allItems) => {
  return allItems.map((r) => {
    const res: Article = { title: r.Title, description: r.Description };
    return res;
  });
};

export const mapHopperFeatures = (allItems) => {
  return allItems.map((r) => {
    const res: HopperFeature = { title: r.Title, turnedOn: r.TurnedOn };
    return res;
  });
};

export const mapNavLinks = (allItems) => {
  const dict = _.groupBy(allItems, "Category");
  return _.map(dict, (value, key) => {
    const items: LeftNavItem[] = value.map(({ key, name, url }) => ({
      key,
      name,
      url,
      isExpanded: false,
    }));
    const navSec: LeftNavSection = {
      name: key,
      collapseByDefault: true,
      links: items,
      isExpanded: false,
    };
    return navSec;
  });
};

export const mapSoftwareItems = (allItems, includeAttachments) => {
  const toolMapper = (item) => {
    const {
      Id,
      Title,
      Description,
      Status,
      ViewCount,
      DownloadLink,
      Creator,
      Guide,
      Maturity,
      AverageRating,
      RatingCount,
      Tags,
      TeamChannelLink,
    } = item;

    return {
      Id,
      title: Title,
      description: Description,
      status: Status,
      downloadLink: DownloadLink,
      pocs: Creator.map((c) => {
        return { name: c.Title, email: c.EMail, bio: "" };
      }),
      guide: Guide,
      viewCount: ViewCount,
      teamChannelLink: TeamChannelLink,
      maturity: Maturity,
      averageRatings: AverageRating ? AverageRating : 0,
      ratingCount: RatingCount ? RatingCount : 0,
      Attachments: includeAttachments ? item.attachments : null,
      Tags: Tags ? Tags.split(";") : [],
    } as SoftwareItem;
  };

  if (!Array.isArray(allItems)) return [toolMapper(allItems)];
  return allItems.map(toolMapper);
};
