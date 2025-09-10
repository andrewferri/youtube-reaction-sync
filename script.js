const YT_VIDEO_URL_INPUT = document.getElementById('yt-video-url');
const LOCAL_VIDEO_SELECT_INPUT = document.getElementById('local-video-select');
const GO_BUTTON = document.getElementById('go-btn');

let yt_video_url = '';
let local_video_file = null;
let video_time_offset = 0;

const toggleGoButton = () => {
    GO_BUTTON.disabled = (yt_video_url === '' || local_video_file === null)
};

YT_VIDEO_URL_INPUT.addEventListener('input', function(e){
    yt_video_url = e.target.value
    toggleGoButton()
});

LOCAL_VIDEO_SELECT_INPUT.addEventListener('change', function(e){
    local_video_file = e.target.files[0]
    toggleGoButton()
});