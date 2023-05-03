import { useState, useRef, useEffect } from "react";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists/web";
import "@pnp/sp/items";
import "@pnp/sp/attachments";
import { mapNavLinks, mapSoftwareItems } from "../mappers";
import { IItem } from "@pnp/sp/items";
import { IAttachmentInfo } from "@pnp/sp/attachments";

const SSP_LeftNavigation = "SSP_LeftNavigation";
const SSP_NSFTools = "SSP_NSFTools";

export const useGetListItems = (
  listTitle: string,
  id?: number,
  includeAttachments?: boolean
) => {
  const isMounted = useRef(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isMounted.current = true;
    async function init() {
      try {
        let response = null;
        if (!id)
          response = await sp.web.lists.getByTitle(listTitle).items.getAll();
        else if (!includeAttachments)
          response = await sp.web.lists
            .getByTitle(listTitle)
            .items.getById(id)
            .get();
        else {
          const item = sp.web.lists.getByTitle(listTitle).items.getById(id);
          const info: IAttachmentInfo[] = await item.attachmentFiles();
          response = await item.get();
          response["attachments"] = info;
        }

        if (listTitle === SSP_LeftNavigation) {
          setData(mapNavLinks(response));
          return;
        }
        if (listTitle === SSP_NSFTools) {
          setData(mapSoftwareItems(response, includeAttachments));
          return;
        } else setData(response);
      } catch (e) {
        if (isMounted.current) setError(e);
      } finally {
        if (isMounted.current) setLoading(false);
      }
    }
    init();

    return () => {
      isMounted.current = false;
    };
  }, [listTitle]);

  return { data, error, loading };
};
