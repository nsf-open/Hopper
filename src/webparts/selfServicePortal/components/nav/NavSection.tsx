import { IconButton, Text } from "office-ui-fabric-react";
import React, { useState } from "react";
import Collapsible from "react-collapsible";
import { HorizontalDivider } from "../divider/HorizontalDivider";
import gs from "../../styles/sspStyle.module.scss";
import { Link, useParams } from "react-router-dom";

const CollapsibleHeader = (group) => {
  return (
    <>
      <div className={`${gs.pv6} ${gs.pl20} ${gs.homeNav}`}>
        <Text className={gs.fHeader_blue}>{group.text}</Text>
        <div style={{ float: "right", marginTop: "-3px" }}>
          <IconButton
            style={{
              backgroundColor: "#56c7da",
              width: "30px",
              color: "white",
            }}
            iconProps={{ iconName: "ChevronDown" }}
            title={group.text}
            ariaLabel={group.text}
          />
        </div>
      </div>
      <HorizontalDivider className={gs.bg_blue} style={{ height: "4px" }} />
    </>
  );
};

type TProps = {
  section: any;
  expand: boolean;
  selectedTag: string;
};

export const NavSection: React.FC<TProps> = (props) => {
  const visibilities: boolean[] = new Array(props.section.links.length);
  for (let index = 0; index < visibilities.length; index++) {
    visibilities[index] = false;
  }
  const [showButton, setShowButton] = useState(visibilities);

  const handleMouseEnter = (index) => {
    setShowButton((prev) => {
      const temp = [...prev];
      temp[index] = true;
      return temp;
    });
  };
  const handleMouseLeave = (index) => {
    setShowButton((prev) => {
      const temp = [...prev];
      temp[index] = false;
      return temp;
    });
  };

  return (
    <div className={` ${gs.bl_grey} ${gs.pl0} ${gs.pr20}`}>
      <Collapsible
        trigger={<CollapsibleHeader text={props.section.name} />}
        open={props.expand}
      >
        {props.section.links.map((link, index) => {
          const alternateStyle = index % 2 == 0 ? gs.bg_lightGray : gs.bg_wh;
          return (
            <>
              <Link
                to={link.url.replace("#", "")}
                style={{ textDecoration: "none" }}
              >
                <div
                  key={link.key}
                  className={`${gs.pv6} ${gs.pl20} ${gs.homeNav} ${alternateStyle}`}
                  onMouseEnter={(e) => handleMouseEnter(index)}
                  onMouseLeave={(e) => handleMouseLeave(index)}
                >
                  <Text>{link.name}</Text>
                  {(showButton[index] ||
                    link.url.includes(props.selectedTag)) && (
                    <div style={{ float: "right", marginTop: "-7px" }}>
                      <IconButton
                        style={{
                          backgroundColor: "#ddec92",
                          width: "30px",
                          color: "white",
                        }}
                        iconProps={{ iconName: "ChevronRight" }}
                        title={link.name}
                        ariaLabel={link.name}
                      />
                    </div>
                  )}
                </div>
              </Link>
              <HorizontalDivider
                className={gs.bg_yellow}
                style={{ height: "1px" }}
              />
            </>
          );
        })}
      </Collapsible>
    </div>
  );
};
