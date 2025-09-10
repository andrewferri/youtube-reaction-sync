const GO_BUTTON = document.getElementById('go-btn');
const TIME_OFFSET_INPUT = document.getElementById('time-offset');
const LOCAL_VIDEO = document.getElementById('local-video-player');
const YT_VIDEO_URL_INPUT = document.getElementById('yt-video-url');
const SET_TIME_OFFSET_BUTTON = document.getElementById('time-offset-btn');
const LOCAL_VIDEO_SELECT_INPUT = document.getElementById('local-video-select');

let interval = null;
let yt_player = null;
let yt_video_url = '';
let video_duration = 0;
let local_player = null;
let video_time_offset = 0;
let local_video_file = null;
let local_player_playing = false;

const syncVideo = () => {
    let newTime = Math.round(yt_player.getCurrentTime() - video_time_offset);
    console.log(newTime);
    console.log(local_player.duration);
    if (newTime < local_player.duration)
    {
        local_player.currentTime = newTime;
        local_player.play().then(() => {
            local_player_playing = true;
        });
    }
}

const ytStateChange = e => {
    switch (e.data)
    {
        case 1: // play
            //
            if (video_time_offset > 0)
            {
                if (yt_player.getCurrentTime() < video_time_offset)
                {
                    interval = setInterval(() => {
                        if (yt_player.getCurrentTime() >= video_time_offset)
                        {
                            clearInterval(interval);
                            syncVideo();
                        }
                    }, 500);
                } else
                {
                    syncVideo();
                }
            }
            SET_TIME_OFFSET_BUTTON.disabled = false
            break;

        case 2: // pause / stop
            //
            if (local_player_playing === true)
            {
                local_player.pause();
                local_player_playing = false;
            }
            break;
    }
};

const toggleGoButton = () => {
    GO_BUTTON.disabled = (yt_video_url === '' || local_video_file === null);
};

YT_VIDEO_URL_INPUT.addEventListener('input', function(e){
    yt_video_url = e.target.value;
    toggleGoButton();
});

LOCAL_VIDEO_SELECT_INPUT.addEventListener('change', function(e) {
    console.log(e.target.files[0])
    local_video_file = URL.createObjectURL(e.target.files[0]);
    console.log(local_video_file);
    toggleGoButton();
});

GO_BUTTON.addEventListener('click', function() {
    let id = yt_video_url.split('v=').pop();
    yt_player = new YT.Player('yt-player', {
        videoId: id,
        width: '640',
        height: '390',
        playerVars: {playsinline:1},
        events: {
            onStateChange: ytStateChange,
        }
    });

    local_player = document.createElement('video');
    local_player.setAttribute('controls', 'controls');
    local_player.addEventListener('loadeddata', () => {
        console.log(local_player.duration)
    }, false);

    let source = document.createElement('source');
    source.src = local_video_file;
    local_player.replaceChildren(source);

    LOCAL_VIDEO.replaceChildren(local_player);
    document.getElementById('video-players').classList.add('show');
});

SET_TIME_OFFSET_BUTTON.addEventListener('click', function() {
    video_time_offset = yt_player.getCurrentTime();
    TIME_OFFSET_INPUT.value = video_time_offset;
});