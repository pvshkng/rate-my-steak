"use client";
import downloadAsPng from "@/lib/download-as-png";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import "./rate-my-steak.css";

export default function Page() {
  const [rawImage, setRawImage] = useState(null);
  const [text, setText] = useState(null);
  const [toggleUploadModal, setToggleUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imageInputRef = useRef(null);

  function toggleModal() {
    setToggleUploadModal(!toggleUploadModal);
  }

  function handleCloseModal(e) {
    const modal = document.querySelector(".upload-modal-container");
    if (modal && !modal.contains(e.target)) {
      setToggleUploadModal(false);
    }
  }

  useEffect(() => {
    if (toggleUploadModal === true) {
      document.addEventListener("click", handleCloseModal);
      return () => {
        document.removeEventListener("click", handleCloseModal);
      };
    }
  }, [toggleUploadModal]);

  async function convertImage(file, maxWidth = 500, maxHeight = 500) {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg");
        resolve(dataUrl.split(",")[1]);
      };
      img.onerror = reject;
    });
  }

  function handleClickToSelectFile(event) {
    event.preventDefault();
    imageInputRef.current.click();
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!rawImage) {
      return;
    } else {
      setIsLoading(true);
      const base64Image = await convertImage(rawImage);
      const response = await fetch("/api/steak/rate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();

      let json;

      try {
        json = JSON.parse(data.response);
      } catch (error) {
        console.error("Error while trying yo parse json: ", error);
        json = {
          isSteak: false,
        };
      }

      setText(json);
      setIsLoading(false);
    }
  }

  function handleImageChange(event) {
    const selectedImage = event.target.files[0];
    setRawImage(selectedImage);
  }

  async function handleSelectTemplate(filename) {
    try {
      const response = await fetch(`images/rate-my-steak/${filename}`);
      const blob = await response.blob();
      const file = new File([blob], filename, { type: "image/png" });
      setRawImage(file);
      setToggleUploadModal(false);
    } catch (error) {
      console.error("Error loading template image:", error);
    }
  }

  function handleReset() {
    setText(null);
    setRawImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
    window.location.reload();
  }

  if (isLoading)
    return (
      <>
        <div
          className="entire-modal"
          style={{ display: isLoading ? "block" : "none" }}
        >
          <div className="modal-dimmer">
            <div className="loading-container">
              <p>
                <span>L</span>
                <span>O</span>
                <span>A</span>
                <span>D</span>
                <span>I</span>
                <span>N</span>
                <span>G</span>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  else
    return (
      <>
        {/* START OF MODAL ELEMENT */}
        <div
          className="entire-modal"
          style={{ display: toggleUploadModal ? "block" : "none" }}
        >
          <div className="modal-dimmer">
            <div className="upload-modal-container">
              <p className="text-black">TRY OUR TEMPLATES OR USE YOUR OWN!</p>
              <div className="steak-img-container">
                <img
                  alt="option"
                  src="/images/rate-my-steak/steak-1.png"
                  onClick={() => {
                    handleSelectTemplate("steak-1.png");
                  }}
                />
                <img
                  alt="option"
                  src="/images/rate-my-steak/steak-2.png"
                  onClick={() => {
                    handleSelectTemplate("steak-2.png");
                  }}
                />
              </div>
              <button onClick={handleClickToSelectFile}>USE MINE</button>
            </div>
          </div>
        </div>
        {/* END OF MODAL ELEMENT */}

        <main className="flex flex-col items-center justify-center h-full w-full">
          {text === null ? (
            <>
              <h1>RATE MY STEAK!</h1>

              <div className="step-container">
                <div className="detail-container upload" onClick={toggleModal}>
                  <Image
                    alt="upload-icon"
                    width={32}
                    height={32}
                    src="/icon/upload.svg"
                  />
                  <a>
                    {rawImage
                      ? rawImage.name
                      : "SELECT THE IMAGE OF YOUR JUICY CREATION"}
                  </a>
                </div>
              </div>
              <form onSubmit={onSubmit}>
                {/* <input type="text" name="name" /> */}
                <input
                  type="file"
                  ref={imageInputRef}
                  accept="image/png, image/jpeg"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />

                <div className="button-container">
                  <button type="submit">Submit</button>
                  <button id="reset" onClick={handleReset}>
                    Reset
                  </button>
                </div>
              </form>
            </>
          ) : text.isSteak ? (
            <>
              <div className="result-card-container mt-14" id="download">
                <div className="result-card">
                  <h2 className="text-black ">HERE IS HOW AI SEES YOUR STEAK</h2>

                  {rawImage ? (
                    <img
                      src={URL.createObjectURL(rawImage)}
                      alt="steak image"
                    />
                  ) : (
                    ""
                  )}

                  <div className="steak-attribute-grid">
                    <div className="attribute-container" id="doneness">
                      <div className="attribute">
                        <Image
                          alt="icon"
                          height={0}
                          width={0}
                          src="icon/temperature.svg"
                        />
                        <p>DONENESS</p>
                      </div>
                      <div className="rate">
                        <p>{text.doneness}</p>
                      </div>
                    </div>

                    <div className="attribute-container" id="appearance">
                      <div className="attribute">
                        <Image
                          alt="icon"
                          height={0}
                          width={0}
                          src="icon/utensils.svg"
                        />
                        <p>APPEARANCE</p>
                      </div>
                      <div className="rate">
                        <p>{text.appearance}</p>
                      </div>
                    </div>

                    <div className="attribute-container" id="texture">
                      <div className="attribute">
                        <img src="icon/drumstick.svg" />
                        <p>TEXTURE</p>
                      </div>
                      <div className="rate" id="texture">
                        <p>{text.texture}</p>
                      </div>
                    </div>

                    <div className="attribute-container" id="juiciness">
                      <div className="attribute">
                        <img src="icon/droplet.svg" />
                        <p>JUICINESS</p>
                      </div>
                      <div className="rate">
                        <p>{text.juiciness}</p>
                      </div>
                    </div>

                    <div className="attribute-container" id="overall">
                      <div className="attribute">
                        <img src="icon/thumbsup.svg" />
                        <p>OVERALL</p>
                      </div>
                      <div className="rate">
                        <p>{text.overall}</p>
                      </div>
                    </div>

                    <div className="review-box">{text.description}</div>
                  </div>
                </div>
              </div>
              <div className="button-container">
                <button onClick={downloadAsPng}>Download</button>
                <button id="reset" onClick={handleReset}>
                  Try again
                </button>
              </div>
            </>
          ) : (
            <div className="result-card-container">
              <div className="result-card">
                <h2 className="text-black">YO! YOU CAN'T FOOL ME</h2>
                <h2 className="text-black">THIS IS NOT STEAK!</h2>
                {rawImage ? (
                  <img src={URL.createObjectURL(rawImage)} alt="result image" />
                ) : (
                  ""
                )}{" "}
              </div>
              <div className="button-container">
                <button id="reset" onClick={handleReset}>
                  Try again
                </button>
              </div>
            </div>
          )}
        </main>
      </>
    );
}
