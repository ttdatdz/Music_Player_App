// Lấy các phần tử DOM cần thiết
const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("play-pause");
const progressBar = document.getElementById("progress");
const volumeBar = document.getElementById("volume");
const currentSong = document.getElementById("current-song");
const sleepTimerSelect = document.getElementById("sleep-timer");
const themeToggleBtn = document.getElementById("toggle-theme");
const currentTimeEl = document.getElementById("current-time");
const durationEl = document.getElementById("duration");

// Biến lưu trữ playlist, chỉ số bài hiện tại, và timer tắt nhạc
let playlist = [];
let currentIndex = 0;
let sleepTimerId = null;

// === TẢI PLAYLIST TỪ localStorage hoặc tạo mặc định ===
function loadPlaylistFromStorage() {
  const data = localStorage.getItem("playlist");
  if (data) {
    const rawPlaylist = JSON.parse(data);
    // Lọc bỏ các bài có URL tạm (blob:)
    playlist = rawPlaylist.filter((song) => !song.url.startsWith("blob:"));
  } else {
    // Nếu chưa có playlist, tạo mặc định
    playlist = [
      { name: "Song 1", url: "music/song1.mp3" },
      { name: "Song 2", url: "music/song2.mp3" },
      { name: "Song 3", url: "music/song3.mp3" },
    ];
  }
  renderPlaylist();
}

// === LƯU PLAYLIST VÀO localStorage ===
function savePlaylistToStorage() {
  localStorage.setItem("playlist", JSON.stringify(playlist));
}

// === HIỂN THỊ PLAYLIST LÊN GIAO DIỆN ===
function renderPlaylist() {
  const playlistEl = document.getElementById("playlist");
  playlistEl.innerHTML = "";
  playlist.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = song.name;
    li.onclick = () => selectSong(index); // Chọn bài khi click
    playlistEl.appendChild(li);
  });
}

// === PHÁT BÀI HÁT ===
function playSong() {
  // Nếu chưa chọn bài hát thì báo lỗi
  if (!audio.src || audio.src === window.location.href) {
    alert("Bạn phải chọn bài hát trước khi phát!");
    return;
  }
  audio.play();
  playPauseBtn.textContent = "⏸"; // Đổi icon sang pause
}

// === DỪNG NHẠC ===
function pauseSong() {
  audio.pause();
  playPauseBtn.textContent = "▶"; // Đổi icon sang play
}

// === CHỌN BÀI HÁT THEO INDEX ===
function selectSong(index) {
  currentIndex = index;
  const song = playlist[currentIndex];
  audio.src = song.url; // Gán src khi chọn bài mới
  currentSong.textContent = "Playing: " + song.name;
  playSong();
}

// === ĐỊNH DẠNG THỜI GIAN (giây -> mm:ss) ===
function formatTime(sec) {
  if (isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// === CÁC SỰ KIỆN NÚT ĐIỀU KHIỂN ===
playPauseBtn.addEventListener("click", () => {
  audio.paused ? playSong() : pauseSong();
});

// Nút next: chuyển sang bài tiếp theo
document.getElementById("next").onclick = () => {
  currentIndex = (currentIndex + 1) % playlist.length;
  selectSong(currentIndex);
};

// Nút prev: chuyển về bài trước
document.getElementById("prev").onclick = () => {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  selectSong(currentIndex);
};

// === TUA NHANH / TUA LẠI 10 GIÂY ===
document.getElementById("forward").onclick = () => {
  audio.currentTime += 10;
};
document.getElementById("backward").onclick = () => {
  audio.currentTime -= 10;
};

// === THANH ÂM LƯỢNG ===
volumeBar.addEventListener("input", () => {
  audio.volume = volumeBar.value / 100;
});

// === THANH TIẾN TRÌNH BÀI HÁT ===
audio.addEventListener("timeupdate", () => {
  progressBar.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

// Khi tải metadata, cập nhật tổng thời lượng
audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);
});

// Khi bài hát kết thúc, reset về đầu và đổi icon
audio.addEventListener("ended", () => {
  audio.currentTime = 0; // Quay về đầu bài hát
  playPauseBtn.textContent = "▶"; // Đổi icon về play
  currentTimeEl.textContent = "0:00"; // Reset thời gian hiển thị
});

// Khi kéo thanh tiến trình, cập nhật thời gian bài hát
progressBar.addEventListener("input", () => {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// === HẸN GIỜ TẮT NHẠC ===
sleepTimerSelect.addEventListener("change", (e) => {
  if (sleepTimerId) clearTimeout(sleepTimerId);
  const minutes = parseFloat(e.target.value); // Lấy số phút (có thể là thập phân)
  if (minutes > 0) {
    sleepTimerId = setTimeout(() => {
      pauseSong();
      alert("⏰ Nhạc đã dừng sau " + minutes + " phút.");
    }, minutes * 60 * 1000);
  }
});

// === GIAO DIỆN SÁNG / TỐI ===
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const mode = document.body.classList.contains("dark-mode") ? "dark" : "light";
  localStorage.setItem("theme", mode);
});

// === GHI NHỚ CHẾ ĐỘ TỐI KHI LOAD LẠI TRANG ===
window.onload = () => {
  if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark-mode");
  }
  loadPlaylistFromStorage();
};

// === THÊM BÀI HÁT MỚI VÀO PLAYLIST (bằng URL) ===
document.getElementById("add-song").addEventListener("click", () => {
  const url = document.getElementById("new-song-url").value.trim();
  const name = document.getElementById("new-song-name").value.trim();

  if (!url.endsWith(".mp3")) {
    alert("Please enter a valid .mp3 URL.");
    return;
  }

  if (!name) {
    alert("Please enter a song name.");
    return;
  }

  playlist.push({ name, url });
  savePlaylistToStorage();
  renderPlaylist();

  // Xóa nội dung input
  document.getElementById("new-song-url").value = "";
  document.getElementById("new-song-name").value = "";
});

// === THÊM FILE MP3 TỪ MÁY NGƯỜI DÙNG ===
document.getElementById("add-local-file").addEventListener("click", () => {
  const fileInput = document.getElementById("local-file");
  const nameInput = document.getElementById("local-file-name");

  const file = fileInput.files[0];
  const name = nameInput.value.trim();

  if (!file || !file.type.includes("audio")) {
    alert("Please choose a valid MP3 file.");
    return;
  }

  if (!name) {
    alert("Please enter a song name.");
    return;
  }

  const url = URL.createObjectURL(file); // Tạo URL tạm thời từ file
  playlist.push({ name, url });
  renderPlaylist();
  savePlaylistToStorage(); // Lưu để giữ lại bài từ URL tạm

  // Reset input
  fileInput.value = "";
  nameInput.value = "";
});
