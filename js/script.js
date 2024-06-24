console.log("js");

// Global variables
let currentSong = new Audio();
let songs;
let currFolder;

// Function to convert seconds to MM:SS format
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

// Function to fetch songs from a folder
async function getSongs(folder) {
  currFolder = folder;
  try {
    let response = await fetch(`/${folder}/`);
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    songs = Array.from(anchors)
      .filter(anchor => anchor.href.endsWith(".mp3"))
      .map(anchor => anchor.href.split(`/${folder}/`)[1]);









    // Display songs in playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = songs.map(song => `
      <li>
        <img class="invert" src="img/music.svg" alt="">
        <div class="info">
          <div class="songname">${decodeURIComponent(song).replaceAll("%20", " ")}</div>
          <div class="songartist"></div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg" alt="">
        </div>
      </li>
    `).join("");

    // Attach event listener to each song
    Array.from(songUL.getElementsByTagName("li")).forEach((li, index) => {
      li.addEventListener("click", () => {
        playMusic(songs[index]);
      });
    });

    return songs;
  } catch (error) {
    console.error("Error fetching songs:", error);
  }
}

// Function to play a selected track
const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.getElementById("play").src = "img/pause.svg";
  } else {
    document.getElementById("play").src = "img/play.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// Main function to initialize the player
async function main() {
  // Initialize songs for the initial folder
  await getSongs("songs/Interstellar");
  playMusic(songs[0], true); // Start playing the first song

  // Event listener for play/pause button
  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.getElementById("play").src = "img/pause.svg";
    } else {
      currentSong.pause();
      document.getElementById("play").src = "img/play.svg";
    }
  });

  // Update song time and seek bar on timeupdate
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Seek bar event listener
  document.querySelector(".seekbar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Hamburger menu event listener
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Close button event listener
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Previous button event listener
  document.getElementById("previous").addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index > 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Next button event listener
  document.getElementById("next").addEventListener("click", () => {
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index < songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  // Volume range event listener
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
    console.log("setting volume to", e.target.value, "/100")
    currentSong.volume = parseInt(e.target.value) / 100
  });

  // Load playlist when an album card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async () => {
      let folder = card.dataset.folder;
      await getSongs(`songs/${folder}`);
      playMusic(songs[0], true); // Start playing the first song of the new playlist
    });
  });


  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click", e=>{
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg")
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }else{
      e.target.src = e.target.src.replace("mute.svg", "volume.svg")
      currentSong.volume = .1;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10

    }
    
  })
}

// Call the main function to initialize
main();
 