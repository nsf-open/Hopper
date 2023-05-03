import { Spinner, SpinnerSize } from "office-ui-fabric-react";
import React from "react";
import LoadingOverlay from "react-loading-overlay";

type TProps = {
  condition: boolean;
};

export const SspSpinner: React.FC<TProps> = (props) => {
  return (
    <LoadingOverlay
      active={props.condition}
      spinner={<Spinner size={SpinnerSize.large} />}
    >
      {props.children}
    </LoadingOverlay>
  );
};
