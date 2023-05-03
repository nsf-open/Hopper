import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

type TProps = {
  url: string;
  name: string;
};

export const PdfThumb: React.FC<TProps> = (props) => {
  pdfjs.GlobalWorkerOptions.workerSrc = "pdf.worker.min.js";
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }
  return (
    <>
      <div className="main">
        <Document file={props.url} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      </div>
    </>
  );
};
