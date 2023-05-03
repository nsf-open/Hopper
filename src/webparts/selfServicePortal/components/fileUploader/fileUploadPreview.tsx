import { Icon } from "office-ui-fabric-react";
import React, { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import gs from "../../styles/sspStyle.module.scss";

const thumbsContainer1 = {
  display: "flex",
  flexDirection: "row" as "row",
  flexWrap: "wrap" as "wrap",
  marginTop: 16,
};

const thumbsContainer2 = {
  display: "flex",
  flexDirection: "column" as "column",
  flexWrap: "wrap" as "wrap",
  marginTop: 16,
};

const thumb = {
  display: "inline-flex",
  borderRadius: 2,
  border: "1px solid #092d74",
  marginBottom: 8,
  marginRight: 8,
  width: 150,
  height: 100,
  padding: 4,
  boxSizing: "border-box" as "border-box",
};

const thumbInner = {
  minWidth: 0,
  overflow: "hidden",
  cursor: "pointer",
  minHeight: "30px",
};

const img = {
  display: "block",
  width: "100%",
  height: "100%",
};

type TProps = {
  files: any;
  onSetFiles: any;
  onRemoveFile: any;
  screenshotsOnly: boolean;
};

export const FileUploadPreview: React.FC<TProps> = (props) => {
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    accept: props.screenshotsOnly ? "image/*" : ".pdf,.doc,.docx",
    onDrop: (acceptedFiles) => {
      const x = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      props.onSetFiles((prevState) => x.concat(prevState));
    },
  });

  const removeFile = (file) => {
    const newFiles = [...props.files]; // make a var for the new array
    if (!newFiles[file].preview.includes("blob:https"))
      props.onRemoveFile(props.files[file].name);
    newFiles.splice(file, 1); // remove the file from the array
    props.onSetFiles(
      newFiles.map((f) =>
        Object.assign(f, {
          preview: f.preview ? f.preview : URL.createObjectURL(f),
        })
      )
    );
  };

  const thumbs = props.screenshotsOnly
    ? props.files.map((file, i) => (
        <div style={thumb} key={file.name}>
          <div style={thumbInner} className={gs.thumbInner}>
            <img src={file.preview} style={img} alt={file.name} />
            <Icon
              iconName="Delete"
              className={gs.deleteIcon}
              onClick={() => removeFile(i)}
            />
          </div>
        </div>
      ))
    : props.files.map((file, i) => (
        <div style={thumbInner} className={gs.thumbInner}>
          <Icon
            key={`doc_${i}`}
            iconName="Delete"
            className={gs.deleteIcon}
            onClick={() => removeFile(i)}
          /> <span style={{paddingLeft: "30px"}}>
          <strong>{file.name}</strong></span>
        </div>
      ));
  const fileRejectionItems = fileRejections.map(({ file, errors }) => (
    <li key={file.name}>
      {file.name} - {file.size} bytes
      <ul>
        {errors.map((e) => (
          <li key={e.code}>{e.message}</li>
        ))}
      </ul>
    </li>
  ));

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      props.files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [props.files]
  );

  return (
    <section className={gs.dzcontainer}>
      <div {...getRootProps({ className: gs.dropzone })}>
        <input {...getInputProps()} />
        <p>
          {props.screenshotsOnly
            ? `Drag 'n' drop screen shots only, or click to select files`
            : `Drag 'n' drop pdfs or word documents only, or click to select files`}
        </p>
      </div>
      <aside
        style={props.screenshotsOnly ? thumbsContainer1 : thumbsContainer2}
      >
        {thumbs}
        <ul>{fileRejectionItems}</ul>
      </aside>
    </section>
  );
};
