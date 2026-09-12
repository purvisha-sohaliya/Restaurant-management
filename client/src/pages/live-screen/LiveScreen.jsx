import { useEffect, useState } from "react";
import { getDisplayScreen } from "../../services/kitchenService";
import { addDisplayVideo, getDisplayVideos } from "../../services/displayVideoService";
import { toast } from "react-toastify";

const LiveScreen = () => {
  // left-side show token
  const [currentToken, setCurrentToken] = useState(null);
  const [nextTokens, setNextTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  // display video
  const [displayVideos, setDisplayVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchLiveTokens = async () => {
    try {
      const response = await getDisplayScreen();
      if (!response?.success) {
        throw new Error(
          response?.message || "Display screen API failed"
        );
      }

      const data = response.data;
      //Current Token
      if (data?.current_token) {
        const tokenData = {
          token_number: data.current_token,
          status: data.current_status || "Pending",
          table_number: data.current_table || null,
          customer_name: data.current_customer || null,
        };
        setCurrentToken(tokenData);
      } else {
        setCurrentToken(null);
      }

      //Next Token
      const queue = Array.isArray(data?.queue)
        ? data.queue
        : [];
      setNextTokens(queue);
    } catch (error) {
      setCurrentToken(null);
      setNextTokens([]);
    } finally {
      setLoading(false);
    }
  };
  const fetchDisplayVideos = async () => {
    try {
      const response = await getDisplayVideos();
      if (response?.success) {
        const videos = (response.data || []).map((video) => ({
          ...video,
          video_url: video.video_url
            ?.replace(/\\/g, "/")
            .replace(/^\/+/, "")
        }));

        setDisplayVideos(videos);
        setCurrentVideoIndex(0);
      }
    } catch (error) {
      console.error("DISPLAY VIDEO ERROR:", error);
    }
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      toast.warning("Please enter video title!");
      return;
    }
    if (!videoFile) {
      toast.warning("Please select video!");
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("title", videoTitle);
      formData.append("video", videoFile);

      const response = await addDisplayVideo(formData);
      if (response?.success) {
        setVideoTitle("");
        setVideoFile(null);
        await fetchDisplayVideos();
        if (response?.success) {
          toast.success("Video uploaded successfully!");
        }
        const modalElement = document.getElementById("uploadVideoModal");
        if (modalElement) {
          const modal = window.bootstrap.Modal.getInstance(modalElement);
          if (modal) { modal.hide(); }
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    document.body.classList.add("live-screen-active");
    fetchLiveTokens();
    fetchDisplayVideos();
    return () => {
      document.body.classList.remove("live-screen-active");
    };
  }, []);

  return (
    <div className="live-screen-page">
      <div
        className="live-screen w-100 min-vh-100 d-flex flex-column flex-md-row gap-3 overflow-hidden">
        <div className="live-token-section d-flex flex-column bg-white overflow-hidden col-12 col-md-4 col-xl-3">
          {/*  HEADER  */}

          <div className="token-header d-flex align-items-center justify-content-between bg-blue text-white px-3 py-3">
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn text-white btn-sm fw-bold"
                onClick={() => window.history.back()}
              >
                Back
              </button>

              <h2 className="mb-0 fs-4 fw-bold">
                LIVE TOKENS
              </h2>
            </div>

            <div className="live-status d-flex align-items-center gap-2 px-3 py-1 rounded-pill fw-bold">
              <span className="live-dot"></span>
              LIVE
            </div>

          </div>
          {/* CURRENT TOKEN */}

          <div className="current-token-card m-3 p-3 text-center rounded-3 border bg-light shadow-sm">
            <p className="now-serving mb-1 text-secondary fw-bold">
              NOW SERVING
            </p>
            {/* LOADING */}
            {loading ? (
              <div className="token-loading py-4">
                Loading...
              </div>
            ) : currentToken ? (
              <>
                {/* TOKEN NUMBER */}
                <h1 className="current-token mb-2 fw-bold text-black"
                  style={{
                    fontSize: "clamp(40px, 5vw, 55px)", lineHeight: "1"
                  }}>
                  {currentToken.token_number}
                </h1>

                {/*STATUS*/}
                {currentToken.status && (
                  <span
                    className={`badge mb-2 ${currentToken.status === "Ready"
                      ? "bg-success"
                      : currentToken.status === "Preparing"
                        ? "bg-warning text-dark"
                        : "bg-secondary"
                      }`}
                  >
                    {currentToken.status}
                  </span>
                )}

              </>
            ) : (
              <div className="no-token py-4 text-secondary">
                No Active Token
              </div>
            )}
          </div>

          {/* NEXT TOKENS */}
          <div className="next-token-section flex-grow-1 overflow-auto px-3" >
            <h3 className="mt-1 mb-3 text-dark fw-bold fs-6">
              NEXT TOKENS
            </h3>
            {nextTokens.length > 0 ? (
              <div className="next-token-list d-flex flex-column gap-2">
                {nextTokens.map((token, index) => (
                  <div
                    className="next-token-card d-flex align-items-center justify-content-between rounded-3 bg-white border shadow-sm px-3 py-2"
                    key={token.kitchen_id || index}
                  >

                    {/* LEFT SIDE - TOKEN */}
                    <span
                      className="next-token-number text-black fw-bold"
                    >
                      {token.token_number}
                    </span>

                    {/* RIGHT SIDE - STATUS */}
                    <span className="small">
                      {token.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-next-token text-center text-secondary py-4">
                No waiting tokens
              </p>
            )}
          </div>

          {/*  FOOTER  */}
          <div className="token-footer d-flex align-items-center justify-content-center border-top bg-light text-secondary py-3">
            <span>
              Thank you for waiting
            </span>
          </div>
        </div>

        {/* VIDEO SECTION */}
        <div className="live-video-section col-12 col-md-8 col-xl-9 position-relative overflow-hidden"
          style={{ height: "100vh" }}>
          {displayVideos.length > 0 ? (

            <video
              key={displayVideos[currentVideoIndex]?._id}
              className="live-video w-100 h-100 d-block"
              autoPlay
              muted
              playsInline
              onEnded={() => {
                setCurrentVideoIndex((prev) =>
                  prev + 1 >= displayVideos.length ? 0 : prev + 1
                );
              }}
              onError={(e) => {
                console.error(
                  "VIDEO ERROR:",
                  displayVideos[currentVideoIndex]?.video_url
                );
              }}
              style={{
                height: "100%",
                objectFit: "cover"
              }}
            >
              <source
                src={displayVideos[currentVideoIndex]?.video_url}
                type="video/mp4"
              />
            </video>
          ) : (
            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
              No display video available
            </div>
          )}
          {/* UPLOAD BUTTON */}
          <button type="button" className="btn bg-blue text-white position-absolute"
            style={{ top: "20px", right: "20px", zIndex: 10, }}
            data-bs-toggle="modal"
            data-bs-target="#uploadVideoModal">
            + Add Video
          </button>

          {/* UPLOAD MODAL */}
          <div className="modal fade" id="uploadVideoModal" tabIndex="-1" >
            <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Add Display Video
                  </h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <form onSubmit={handleVideoUpload}>
                  <div className="modal-body">
                    {/* TITLE */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Video Title
                      </label>
                      <input type="text" className="form-control"
                        placeholder="Enter video title" value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)} />
                    </div>
                    {/* VIDEO */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Select Video
                      </label>
                      <input type="file" className="form-control"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary"
                      data-bs-dismiss="modal" >
                      Cancel
                    </button>

                    <button type="submit" className="btn btn-primary" disabled={uploading}>
                      {uploading
                        ? "Uploading..."
                        : "Upload Video"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScreen;