import React, { useState } from "react";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

function Videos(props) {
  const { loadVideo, setLoadVideo } = props;
  const [title, setTitleData] = useState("");
  const [url, setUrlData] = useState("");

  function cancelBtnHandler(e) {
    props.setShow(false);
  }

  function addClickHandeler(e) {
    e.preventDefault();
    const newVideo = { title: title, url: url, rating: 0 };
    fetch("http://ec2-13-43-88-72.eu-west-2.compute.amazonaws.com:3000/videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVideo),
    })
      .then((response) => response.json())
      .then((data) => {
        const updatedData = [...loadVideo, data];
        setLoadVideo(updatedData);
        setTitleData("");
        setUrlData("");
      })
      .catch((err) => {
        console.error("Error adding video:", err);
      });
  }

  function deleteBtnHandler(item) {
    fetch(`http://ec2-13-43-88-72.eu-west-2.compute.amazonaws.com:3000/videos/${item.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete video");
        }
        return response.json();
      })
      .then(() => {
        const updatedData = loadVideo.filter((video) => video.id !== item.id);
        setLoadVideo(updatedData);
      })
      .catch((error) => {
        console.error("Error deleting video:", error);
      });
  }

  function thumbUpHandeler(item) {
    const newRating = item.rating + 1;
    const newVideo = {
      id: item.id,
      title: item.title,
      url: item.url,
      rating: newRating,
    };

    fetch(`http://ec2-13-43-88-72.eu-west-2.compute.amazonaws.com:3000/videos/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVideo),
    })
      .then((response) => response.json())
      .then(() => {
        const updatedData = loadVideo.map((video) =>
          video.id === item.id ? { ...video, rating: newRating } : video
        );
        setLoadVideo(updatedData);
      })
      .catch((error) => {
        console.error("Error updating video:", error);
      });
  }

  function thumbDownHandeler(item) {
    const newRating = item.rating - 1;
    const newVideo = {
      id: item.id,
      title: item.title,
      url: item.url,
      rating: newRating,
    };

    fetch(`http://ec2-13-43-88-72.eu-west-2.compute.amazonaws.com:3000/videos/${item.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVideo),
    })
      .then((response) => response.json())
      .then(() => {
        const updatedData = loadVideo.map((video) =>
          video.id === item.id ? { ...video, rating: newRating } : video
        );
        setLoadVideo(updatedData);
      });
  }

  return (
    <>
      <div className="main" style={{ width: "100vw" }}>
        {props.show && (
          <form className="formDiv" style={{ width: "100vw" }} onSubmit={addClickHandeler}>
            <div className="input-group">
              <label htmlFor="title">Title</label>
              <input
                className="lineInput"
                id="title"
                value={title}
                onChange={(e) => setTitleData(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="url">Url</label>
              <input
                className="lineInput"
                id="url"
                value={url}
                onChange={(e) => setUrlData(e.target.value)}
                required
              />
            </div>
            <div className="addCancelBtn">
              <button style={{ borderRadius: 5 }} type="button" onClick={cancelBtnHandler}>
                Cancel
              </button>
              <button style={{ borderRadius: 5 }} type="submit">
                Add
              </button>
            </div>
          </form>
        )}
        <div className="mainShowVideos">
          {loadVideo.length > 0 ? (
            loadVideo.map((item, index) => {
              const videoId = item.url.split("v=")[1];
              return (
                <div key={index} className="showVideo">
                  <div style={{ display: "flex", marginBottom: 10 }}>
                    <button className="thumbBtn" onClick={() => thumbUpHandeler(item)}>
                      <FaThumbsUp />
                    </button>
                    <p style={{ margin: 5 }}>{item.title}</p>
                    <button className="thumbBtn" onClick={() => thumbDownHandeler(item)}>
                      <FaThumbsDown />
                    </button>
                  </div>
                  <p style={{ color: "black" }}>{item.rating}</p>
                  <iframe
                    width="350"
                    height="200"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <button className="btnShowVideo" onClick={() => deleteBtnHandler(item)}>
                    Delete
                  </button>
                </div>
              );
            })
          ) : (
            <p style={{ fontWeight: "bold", color: "white" }}>Loading . . .</p>
          )}
        </div>
      </div>
    </>
  );
}

export default Videos;
