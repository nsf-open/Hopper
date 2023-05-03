import { useEffect } from "react";

const useWebtrends = () => {
  useEffect(() => {
    let script1 = null;
    let script3 = null;
    let script4 = null;
    const runWbtrends = () => {
      script1 = document.createElement("script");
      script1.type = "text/javascript";
      script1.innerHTML = `var dcsidGlobal = "dcs3820vwcxafpgmptheg1ry9_8c1z";`;

      script3 = document.createElement("script");
      script3.type = "text/javascript";
      script3.innerHTML = `//<![CDATA[
            var _tag=new WebTrends();
           _tag.dcsCollect(); 
           //]]>`;
      script4 = document.createElement("noscript");
      const div4 = document.createElement("div");
      div4.innerHTML = `<img alt="DCSIMG" id="DCSIMG" width="1" height="1" src="http://wt.research.gov/dcs3820vwcxafpgmptheg1ry9_8c1z/njs.gif?dcsuri=/nojavascript&amp;WT.js=No&amp;DCS.dcscfg=1&amp;WT.tv=8.6.2"/>`;
      script4.appendChild(div4);
      document.body.appendChild(script1);
      document.body.appendChild(script3);
      document.body.appendChild(script4);
    };

    const crazyEgg = document.createElement("script");
    crazyEgg.type = "text/javascript";
    crazyEgg.src = `//script.crazyegg.com/pages/scripts/0041/5508.js`;
    crazyEgg.async = true;

    const script2 = document.createElement("script");
    script2.type = "text/javascript";
    script2.src = `../SiteAssets/webTrends/webtrends.js`;
    script2.async = false;
    script2.onload = runWbtrends;

    //document.body.appendChild(script2);
    document.body.appendChild(crazyEgg);

    return () => {
      //document.body.removeChild(script1);
      //document.body.removeChild(script2);
      //document.body.removeChild(script3);
      //document.body.removeChild(script4);
      document.body.removeChild(crazyEgg);
    };
  }, []);
};

export default useWebtrends;
