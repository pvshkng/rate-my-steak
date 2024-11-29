import * as htmlToImage from "html-to-image";

export default function downloadAsPng() {
    const download = document.getElementById("download");
    const rect = download?.getBoundingClientRect();

    htmlToImage
    //ts-ignore
      .toPng(download, {
        quality: 1,
        pixelRatio: 1,
        width: rect?.width,
        height: rect?.height,
      })
      .then(function (dataUrl: string) {
        const img = new Image();
        img.src = dataUrl;
        //document.body.appendChild(img);
        const element = document.createElement("a");
        element.appendChild(img);
        element.href = dataUrl;
        element.download = "download.png";
        element.click();
      })
      .catch(function (error: unknown) {
        console.error("Error while generating an image", error);
      });
  }