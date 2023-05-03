import { MSGraphClient } from "@microsoft/sp-http";
import { graph } from "@pnp/graph";
import "@pnp/graph/teams";
import "@pnp/graph/users";

interface ITeamsService {
  getmyTeams(context): Promise<[]>;
  getChannel(teamID): Promise<[]>;
  sendMessage(context, teamId, channelId, message): Promise<[]>;
}

export class TeamsServiceImpl implements ITeamsService {
  public _graphClient: MSGraphClient;
  
  public getmyTeams = async (context): Promise<[]> => {
    this._graphClient = await context.msGraphClientFactory.getClient();
    let myTeams: [] = [];
    try {
      const teamsResponse = await this._graphClient
        .api("me/joinedTeams")
        .version("v1.0")
        .get();
      myTeams = teamsResponse.value as [];
    } catch (error) {
      console.log("Unable to get teams", error);
    }
    return myTeams;
  };

  public getChannel = async (teamID): Promise<[]> => {
    let myTeams: [] = [];
    try {
      const teamsResponse = await graph.teams.getById(teamID).channels();
      myTeams = teamsResponse as [];
    } catch (error) {
      console.log("unable to get channels", error);
    }
    return myTeams;
  };

  public sendMessage = async (
    context,
    teamId,
    channelId,
    message
  ): Promise<[]> => {
    try {
      // https://graph.microsoft.com/beta/teams/{team-id}/channels/{channel-id}/messages
      var content = {
        body: {
          content: message,
        },
      };

      const _graphClient = await context.msGraphClientFactory.getClient();

      const messageResponse = await _graphClient
        .api("/teams/" + teamId + "/channels/" + channelId + "/messages/")
        .version("beta")
        .post(content);
      return messageResponse;
    } catch (error) {
      console.log("Unable to send message", error);
      return null;
    }
  };
}

export const teamsService: ITeamsService = new TeamsServiceImpl();
