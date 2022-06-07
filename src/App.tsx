import React, { ChangeEvent, useState, useRef, useEffect } from "react";
import "./App.css";
import styled from "styled-components";
import * as Tone from "tone";

// const Blur = styled.div`
//   position: "relative",
//   &:before: {
// content: " ",
// position: "absolute",
// background: "rgba(0, 0, 0, 0.5)",
//   },
// `;
const Blur = styled.div`
position:absolute;
height: 394px;
pointer-events: none;
top: 0;
left: 0;
width: 700px;
  &:after {
    content: "";
    filter: blur(${(props: { blur: number }) => props.blur}px);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background-color: white;
    opacity: .2;
  },
`;
function App() {
  const [videoFile, setVideoFile] = useState<File | null>();
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioLoading, setIsAudioLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  let currentTime = 0;
  let startingPitch = 10;
  const [blurValue, setBlurValue] = useState(10);
  const animationRef = useRef<any>();
  const videoTagRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Tone.Player | null>();
  const pitchRef = useRef<any>();

  const handleVideoInputChange = (event: ChangeEvent<HTMLInputElement>) => {
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
      if (videoFile) {
        playerRef.current?.disconnect();
      }
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
    animationRef.current = window.setInterval(whilePlaying, 200);
    console.log('IS PLAYING --> ')
    //@ts-ignore
    Tone.Transport.start();
    if (videoTagRef.current) {
      videoTagRef.current?.classList.add("unBlur");
      if ((duration * 3) / 4 <= videoTagRef.current?.currentTime) {
        videoTagRef.current.style.transition = "";
      } else {
        videoTagRef.current.style.transition = `all ${
          ((duration * 3) / 4 - videoTagRef.current?.currentTime) | duration
        }s ease-out`;
      }
      addBlur()
    }
  };
  const addBlur = () => {
    if(videoTagRef.current) {
      currentTime = videoTagRef.current ? videoTagRef.current?.currentTime : 0;
      const threeQuartersTotal = duration * (3 / 4);
      console.log('currentTime <= threeQuartersTotal -> ', currentTime <= threeQuartersTotal)
      if (currentTime <= threeQuartersTotal) {
        const filterValue =
          "blur(" +
          ((100 - (currentTime * 100) / threeQuartersTotal) / 10).toString() +
          "px)";
        videoTagRef.current.style.filter = filterValue;
        videoTagRef.current.classList.remove("unBlur");
        videoTagRef.current.style.transition = "";
      }
    }
  }

  const whilePlaying = () => {
    currentTime = videoTagRef.current ? videoTagRef.current?.currentTime : 0;
    calculatePitch();
    // animationRef.current = requestAnimationFrame(whilePlaying);
  };
  const isPausing = () => {
    // cancelAnimationFrame(animationRef.current);
    clearInterval(animationRef.current);
    if (videoTagRef.current) {
      // var computedStyle = window.getComputedStyle(videoTagRef.current),
      //   filter = computedStyle.getPropertyValue("filter");
      // videoTagRef.current.style.filter = filter;
      // videoTagRef.current.classList.remove("unBlur");
      addBlur()
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
        //console.log(pitchRef.current.pitch);
      } else {
        pitchRef.current.pitch = 0;
      }
    }
    // console.log(maxBlur * (currentTime <= 0 ? 1 : currentTime));
  };

  const resetAudio = () => {
    playerRef.current?.dispose();
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
                onPause={() => {isPausing(); console.log('FROM ON PAUSE')}}
                onEnded={() => {resetAudio(); console.log('ENDED') }}
                className={`blur ${isAudioPlaying && "unBlur"}`}
                muted
                onSeeked={isPausing}
              />
              {/* <Blur blur={a}></Blur> */}
              <button onClick={resetAudio}>reset</button>
            </div>
            {/* <button onClick={togglePlayPause}>Play</button> */}
          </>
        )}
      </header>
    </div>
  );
}

export default App;
