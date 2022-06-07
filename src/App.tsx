import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
import * as Tone from "tone";

function App() {
  const [videoFile, setVideoFile] = useState<File | null>();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioLoading, setIsAudioLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  let currentTime = 0;
  let startingPitch = 10;
  const [blurValue, setBlurValue] = useState(0);
  const animationRef = useRef<any>();
  const videoTagRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Tone.Player | null>();
  const pitchRef = useRef<any>();
  let counter = 0;

  const handleVideoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (videoFile) {
      playerRef.current?.disconnect();
    }
    if (event.target.files) {
      setIsAudioLoading(true);
      setVideoFile(event.target.files[0]);

      var tempVideo = document.createElement("video");
      tempVideo.src = URL.createObjectURL(event.target.files[0]);
      tempVideo.preload = "metadata";
      tempVideo.onloadedmetadata = function () {
        setDuration(tempVideo.duration);
      };
      tempVideo.src = URL.createObjectURL(event.target.files[0]);

      //@ts-ignore
      playerRef.current = new Tone.Player(
        URL.createObjectURL(event.target.files[0]),
        () => setIsAudioLoading(false)
      )
        .sync()
        .start(0);
      pitchRef.current = new Tone.PitchShift({
        pitch: startingPitch,
      }).toDestination();
      playerRef.current.connect(pitchRef.current);
    }
  };

  const isPlaying = () => {
    // animationRef.current = requestAnimationFrame(whilePlaying);
    // animationRef.current = window.setInterval(whilePlaying, 200);

    //@ts-ignore
    Tone.Transport.start();
    if (videoTagRef.current) {
      videoTagRef.current?.classList.add("unBlur");
      if ((duration * 3) / 4 <= videoTagRef.current?.currentTime) {
        videoTagRef.current.style.transition = "all 0s linear";
      } else {
        console.log((duration * 3) / 4 - videoTagRef.current?.currentTime);
        videoTagRef.current.style.transition = `all ${
          (duration * 3) / 4 - videoTagRef.current?.currentTime
        }s ease-out`;
      }
    }
  };
  const whilePlaying = () => {
    currentTime = videoTagRef.current ? videoTagRef.current?.currentTime : 0;
    calculatePitch();
    if (videoTagRef.current) {
      if (videoTagRef.current?.currentTime <= 1) {
        videoTagRef.current.classList.remove("unBlur");
        videoTagRef.current.style.transition = "all 0s linear";
        videoTagRef.current.style.filter = "blur(10px) !important";
      } else {
        if ((duration * 3) / 4 <= videoTagRef.current?.currentTime) {
          videoTagRef.current.style.transition = "all 0.01s linear !important";
          videoTagRef.current.style.filter = "blur(0.01px) !important";
        } else {
          console.log((duration * 3) / 4 - videoTagRef.current?.currentTime);
          videoTagRef.current.style.transition = `all ${
            (duration * 3) / 4 - videoTagRef.current?.currentTime
          }s ease-out`;
          videoTagRef.current.classList.add("unBlur");
        }
      }
    }
    // animationRef.current = requestAnimationFrame(whilePlaying);
  };
  const isPausing = () => {
    currentTime = videoTagRef.current ? videoTagRef.current?.currentTime : 0;
    // cancelAnimationFrame(animationRef.current);
    // clearInterval(animationRef.current);
    if (videoTagRef.current) {
      // var computedStyle = window.getComputedStyle(videoTagRef.current),
      //   filter = computedStyle.getPropertyValue("filter");
      // videoTagRef.current.style.filter = filter;
      // videoTagRef.current.classList.remove("unBlur");

      const threeQuartersTotal = duration * (3 / 4);
      if (currentTime <= threeQuartersTotal) {
        const filterValue =
          "blur(" +
          ((100 - (currentTime * 100) / threeQuartersTotal) / 10).toString() +
          "px)";
        videoTagRef.current.style.transition = "all 0s linear";
        videoTagRef.current.style.filter = filterValue;
        videoTagRef.current.classList.remove("unBlur");
      }
    }
    //@ts-ignore
    Tone.Transport.pause();
    // videoTagRef.current?.classList.toggle("unBlur");
  };

  const calculatePitch = () => {
    const threeQuartersTotal = duration * (3 / 4);
    const pitchStep = startingPitch / (threeQuartersTotal / 0.2);
    const currentPitch = (currentTime / 0.2) * pitchStep;
    Tone.Transport.seconds = currentTime;
    if (pitchRef.current && pitchRef.current.pitch >= 0) {
      if (startingPitch - currentPitch >= 0) {
        pitchRef.current.pitch = startingPitch - currentPitch;
        console.log(pitchRef.current.pitch);
      } else {
        pitchRef.current.pitch = 0;
      }
    }
    // console.log(maxBlur * (currentTime <= 0 ? 1 : currentTime));
  };

  const resetAudio = () => {
    //@ts-ignore
    Tone.Transport.stop();
    setIsAudioPlaying(false);
    // if (videoTagRef.current) videoTagRef.current.classList.remove("unBlur");
  };

  return (
    <div className="App">
      <header className="App-header">
        <input
          type="file"
          accept="video/mp4,video/x-m4v,video/*"
          onChange={handleVideoInputChange}
          onClick={() => resetAudio()}
        />
        {videoFile && !audioLoading && (
          <>
            <div style={{ position: "relative" }}>
              <video
                src={URL.createObjectURL(videoFile)}
                style={{
                  maxWidth: "700px",
                }}
                ref={videoTagRef}
                controls
                onPlaying={isPlaying}
                onPause={isPausing}
                onEnded={resetAudio}
                onTimeUpdate={whilePlaying}
                className={`blur ${isAudioPlaying && "unBlur"}`}
                onSeeked={isPausing}
                muted
              />
              {/* <Blur blur={a}></Blur> */}
              {/* <button onClick={() => }>reset</button> */}
            </div>
            {/* <button onClick={togglePlayPause}>Play</button> */}
          </>
        )}
      </header>
    </div>
  );
}

export default App;
