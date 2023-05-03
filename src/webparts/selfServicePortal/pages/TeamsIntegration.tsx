import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PrimaryButton, TextField, Text } from "office-ui-fabric-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { teamsService } from "../services/teamsService";
import styles from "../styles/teams.module.scss";
import gs from "../styles/sspStyle.module.scss";

type TProps = {
  context: WebPartContext;
};

export const TeamsIntegration: React.FC<TProps> = (props) => {
  const [myTeams, setMyTeams] = useState([]);
  const [teamChannels, setTeamChannels] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [myMessage, setMyMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadMyTeams = async () => {
      const teams = await teamsService.getmyTeams(props.context);
      setMyTeams(teams);
    };
    if (!isCancelled) loadMyTeams();
    return () => {
      isCancelled = true;
    };
  }, []);

  const getChannels = async () => {
    const channels = await teamsService.getChannel(selectedTeam.team.id);
    setTeamChannels(channels);
  };

  const sendMesssage = async () => {
    teamsService
      .sendMessage(
        props.context,
        selectedTeam.team.id,
        selectedChannel.channel.id,
        myMessage
      )
      .then(() => {
        setMyMessage("");
        setShowSuccess(true);
      });
  };

  return (
    <div className={`${gs.bg_wh} ${styles.myTeams}`}>
      <h1>Research on Teams integration with sharepoint</h1>
      {myTeams.length > 0 && (
        <>
          <h3>Below is list of your teams</h3>
          <h4>Select any team and click on Get Channels</h4>
        </>
      )}
      <div className={gs.row}>
        <div className={gs.cl6}>
          {myTeams.map((team: any, index: number) => (
            <>
              <input
                className={styles.radio}
                onClick={() => setSelectedTeam({ team })}
                type="radio"
                id={team.id}
                name="myteams"
                value={team.id}
              />
              <label>{team.displayName}</label>
              <br />
            </>
          ))}
          <br />
          <br />
          {selectedTeam && selectedTeam.team && (
            <PrimaryButton text="Get Channels" onClick={() => getChannels()} />
          )}
          {showSuccess && <Text>Message sent successfully"</Text>}
        </div>
      </div>
      <div className={gs.row}>
        <div className={gs.cl6}>
          {teamChannels.length > 0 && (
            <>
              <h3>
                Below is list of your channels for selected team :{" "}
                {selectedTeam.team.displayName}
              </h3>
              <h4>
                Select any channel, enter message and click 'Send Message' to
                Post Message on MS teams
              </h4>
            </>
          )}

          {teamChannels.map((channel: any, index: number) => (
            <>
              <input
                className={styles.radio}
                onClick={() => setSelectedChannel({ channel })}
                type="radio"
                id={channel.id}
                name="teamchannels"
                value={channel.id}
              />
              <label>{channel.displayName}</label>
              <br />
            </>
          ))}
        </div>

        {selectedChannel && selectedChannel.channel && (
          <>
            <TextField
              label="Message"
              placeholder="Type your message"
              value={myMessage}
              multiline
              onChange={(e, v) => setMyMessage(v)}
            />
            <br></br>
            <br></br>
            <PrimaryButton text="Send Message" onClick={sendMesssage} />
          </>
        )}
      </div>
    </div>
  );
};
