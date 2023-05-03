import { IconButton, Text } from "office-ui-fabric-react";
import * as React from "react";
import { useState } from "react";
import Collapsible from "react-collapsible";
import { Link } from "react-router-dom";
import { LeftNavSection } from "../../model";
import gs from "../../styles/sspStyle.module.scss";
import { HorizontalDivider } from "../divider";
type TProps = {
  section: LeftNavSection;
};

export const NavCategory: React.FC<TProps> = (props) => {
  const visibilities: boolean[] = new Array(props.section.links.length);
  for (let index = 0; index < visibilities.length; index++) {
    visibilities[index] = false;
  }
  const [showButton, setShowButton] = useState(visibilities);
  const [iconName, setIconName] = useState("ChevronDown");

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
    <div>
      <div className={`${gs.cl3}`}>
        <div className={gs.pv10}>
          <Text style={{ float: "right", fontSize: "20px", color: "#477aa8" }}>
            by
          </Text>
        </div>
      </div>
      <div className={`${gs.cl9} ${gs.bl_grey}`} style={{ paddingLeft: "0px" }}>
        <Collapsible
          trigger={
            <div
              className={gs.p10}
              style={{ backgroundColor: "#d5f0e7", cursor: "pointer" }}
            >
              <Text className={gs.fHeader_blue}>{props.section.name}</Text>
              <div style={{ float: "right", marginTop: "-2px" }}>
                <IconButton
                  style={{
                    backgroundColor: "#56c7da",
                    width: "30px",
                    color: "white",
                  }}
                  iconProps={{ iconName: iconName }}
                  title={props.section.name}
                  ariaLabel={props.section.name}
                />
              </div>
            </div>
          }
          open={false}
          onOpen={() => {
            setIconName("ChevronUp");
          }}
          onClose={() => {
            setIconName("ChevronDown");
          }}
        >
          <HorizontalDivider className={gs.bg_blue} style={{ height: "4px" }} />
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
                    {showButton[index] && (
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
    </div>
  );
};
