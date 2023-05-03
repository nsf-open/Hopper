import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { SoftwareItem } from "../../model";
import { listService } from "../../services";
import {
  PointOfContact,
  ToolAnswer,
  ToolStatus,
} from "./../../model/SoftwareItem";

export const updateSoftwareTool = createAsyncThunk(
  "tools/updateSoftwareTool",
  async (item: SoftwareItem) => {
    const response = await listService.updateSoftwareTool(item);
    return response;
  }
);
export const getSoftwareToolsList = createAsyncThunk(
  "tools/getSoftwareToolsList",
  async (status: ToolStatus) => {
    const response = await listService.getSoftwareToolsList(status);
    return response;
  }
);
export const getPendingApprovalTools = createAsyncThunk(
  "tools/getPendingApprovalTools",
  async () => {
    const response = await listService.getPendingApprovalTools();
    return response;
  }
);

export const getMySubmittedTools = createAsyncThunk(
  "tools/getMySubmittedTools",
  async (status: ToolStatus) => {
    const response = await listService.getMySubmittedTools(status);
    return response;
  }
);
export const getSoftwareToolsCount = createAsyncThunk(
  "tools/getSoftwareToolsCount",
  async () => {
    const response = await listService.getSoftwareToolsCount();
    return response;
  }
);
export const getPagedSoftwareToolsList = createAsyncThunk(
  "tools/getPagedSoftwareToolsList",
  async () => {
    const response = await listService.getPagedSoftwareToolsList();
    return response;
  }
);

export const getFeaturedTool = createAsyncThunk(
  "tools/getFeaturedTool",
  async () => {
    return await listService.getFeaturedTool();
  }
);

export const getPointOfContact = createAsyncThunk(
  "tools/getCreatorBios",
  async (email: string) => {
    return await listService.getCreatorBios([{ email }]);
  }
);

export const getSoftwareToolDetail = createAsyncThunk(
  "tools/getSoftwareToolDetail",
  async (toolId: number) => {
    return await listService.getSoftwareToolDetail(toolId);
  }
);

export const addNewSoftwareTool = createAsyncThunk(
  "tools/addNewSoftwareTool",
  async (newItem: SoftwareItem) => {
    return await listService.addNewSoftwareTool(newItem);
  }
);

export const addToolReviewComment = createAsyncThunk(
  "tools/addToolReviewComment",
  async (param: { toolId: number; comment: string }) => {
    return await listService.addToolReviewComment(param.toolId, param.comment);
  }
);

export const getPendingSubmissions = createAsyncThunk(
  "tools/getPendingSubmissions",
  async () => {
    return await listService.getYourPendingSubmissions();
  }
);

export const getRecentlyAddedTools = createAsyncThunk(
  "tools/getRecentlyAddedTools",
  async () => {
    return await listService.getRecentlyAddedTools();
  }
);

export const getFrequentlyViewedTools = createAsyncThunk(
  "tools/getFrequentlyViewedTools",
  async () => {
    return await listService.getFrequentlyViewedTools();
  }
);

export const getAllToolReviews = createAsyncThunk(
  "tools/getAllToolReviews",
  async (toolId: number) => {
    return await listService.getAllToolReviews(toolId);
  }
);

export const rateSoftwareTool = createAsyncThunk(
  "tools/rateSoftwareTool",
  async (params: { toolId: number; rating: number }) => {
    return await listService.rateSoftwareTool(params.toolId, params.rating);
  }
);

export const getAllToolQuestions = createAsyncThunk(
  "tools/getAllToolQuestions",
  async () => {
    return await listService.getAllToolQuestions();
  }
);
export const getTemporaryAnswer = createAsyncThunk(
  "tools/getTemporaryAnswer",
  async (id: number) => {
    return await listService.getTemporaryAnswer(id);
  }
);
export const addUpdateToolAnswer = createAsyncThunk(
  "tools/addUpdateToolAnswer",
  async (param: ToolAnswer) => {
    return await listService.addUpdateToolAnswer(param);
  }
);
export const removeToolAnswerAttachment = createAsyncThunk(
  "tools/removeItemAttachment",
  async (param: { name: string; id: number }) => {
    return await listService.removeItemAttachment(
      param.name,
      param.id,
      "SSP_ToolAnswers"
    );
  }
);
export const removeToolAttachment = createAsyncThunk(
  "tools/removeItemAttachment",
  async (param: { name: string; id: number }) => {
    return await listService.removeItemAttachment(
      param.name,
      param.id,
      "SSP_NSFTools"
    );
  }
);
export const updateSubmittedToolStatus = createAsyncThunk(
  "tools/updateSubmittedToolStatus",
  async (param: {
    id: number;
    status: ToolStatus;
    approverComment: string;
  }) => {
    return await listService.updateSubmittedToolStatus(
      param.id,
      param.status,
      param.approverComment
    );
  }
);

export const addUpdateCreatorBio = createAsyncThunk(
  "tools/addUpdateCreatorBio",
  async (poc: PointOfContact) => {
    return await listService.addUpdateCreatorBio(poc);
  }
);

export const deleteToolVideo = createAsyncThunk(
  "tools/deleteToolVideo",
  async (id: number) => {
    return await listService.deleteToolVideo(id);
  }
);

export const saveToolVideo = createAsyncThunk(
  "tools/saveToolVideo",
  async (link: any) => {
    return await listService.saveToolVideo(link);
  }
);

export const deleteToolLink = createAsyncThunk(
  "tools/deleteToolLink",
  async (id: number) => {
    return await listService.deleteToolLink(id);
  }
);

export const saveToolLink = createAsyncThunk(
  "tools/saveToolLink",
  async (link: any) => {
    return await listService.saveToolLink(link);
  }
);
export const getToolVideos = createAsyncThunk(
  "tools/getToolVideos",
  async (toolId: number) => {
    return await listService.getToolVideos(toolId);
  }
);
export const getToolVersions = createAsyncThunk(
  "tools/getToolVersions",
  async (toolId: number) => {
    return await listService.getVersionForListItem("SSP_ToolAnswers", toolId);
  }
);

const toolsSlicer = createSlice({
  name: "tools",
  initialState: {
    tools: [],
    pocs: [],
    featuredTool: {},
    toolDetail: {},
    newTool: null,
    recentTools: [],
    frequentTools: [],
    pagedTools: {},
    count: 0,
    questions: [],
    answer: {},
    myTools: [],
    pendingApprovals: [],
    toolVideos: [],
    toolVersions: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getRecentlyAddedTools.fulfilled, (state, action) => {
        state.recentTools = action.payload;
      })
      .addCase(getFrequentlyViewedTools.fulfilled, (state, action) => {
        state.frequentTools = action.payload;
      })
      .addCase(getPointOfContact.fulfilled, (state, action) => {
        state.pocs = action.payload;
      })
      .addCase(getSoftwareToolDetail.fulfilled, (state, action) => {
        state.toolDetail = action.payload;
      })
      .addCase(getMySubmittedTools.fulfilled, (state, action) => {
        state.myTools = action.payload;
      })
      .addCase(getPendingApprovalTools.fulfilled, (state, action) => {
        state.pendingApprovals = action.payload;
      })
      .addCase(getSoftwareToolsList.fulfilled, (state, action) => {
        state.tools = action.payload;
      })
      .addCase(getSoftwareToolsCount.fulfilled, (state, action) => {
        state.count = action.payload;
      })
      .addCase(getPagedSoftwareToolsList.fulfilled, (state, action) => {
        state.pagedTools = action.payload;
      })
      .addCase(getFeaturedTool.fulfilled, (state, action) => {
        state.featuredTool = action.payload;
      })
      .addCase(addToolReviewComment.fulfilled, (state, action) => {
        state.toolDetail = { ...state.toolDetail, reviews: [action.payload] };
      })
      .addCase(rateSoftwareTool.fulfilled, (state, action) => {
        state.toolDetail = {
          ...state.toolDetail,
          averageRatings: action.payload,
        };
      })
      .addCase(getTemporaryAnswer.fulfilled, (state, action) => {
        state.answer = action.payload;
      })
      .addCase(getAllToolQuestions.fulfilled, (state, action) => {
        state.questions = action.payload;
      })
      .addCase(getToolVideos.fulfilled, (state, action) => {
        state.toolVideos = action.payload;
      })
      .addCase(getToolVersions.fulfilled, (state, action) => {
        state.toolVersions = action.payload;
      });
  },
});

export default toolsSlicer.reducer;
