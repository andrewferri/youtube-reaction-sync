const YTRS = {
    interval: null,
    ytPlayer: null,
    videoDuration: 0,
    localPlayer: null,
    videoTimeOffset: 0,
    localPlayerPlaying: false,
    timeOffsetInput: document.getElementById('time-offset'),
    ytVideoUrlInput: document.getElementById('yt-video-url'),
    localVideo: document.getElementById('local-video-player'),
    timeOffsetButton: document.getElementById('time-offset-btn'),
    localVideoSelect: document.getElementById('local-video-select'),

    init: function() {
        let self = this;
        this.ytVideoUrlInput.addEventListener('input', self.initPlayers.bind(this));
        this.localVideoSelect.addEventListener('change', self.initPlayers.bind(this));
        this.timeOffsetButton.addEventListener('click', self.updateTimeOffset.bind(this));
    },
    syncVideo: function() {
        let self = this;
        if (self.videoTimeOffset > 0)
        {
            let time = self.ytPlayer.getCurrentTime() - self.videoTimeOffset;
            if (time < 0)
            {
                self.interval = setTimeout(self.syncVideo.bind(self), 100);
            } else
            {
                if (time < self.videoDuration)
                {
                    self.localPlayer.currentTime = time;
                    self.localPlayer.play().then(() => {
                        self.localPlayerPlaying = true;
                    });
                } else
                {
                    self.localPlayer.pause();
                    self.localPlayerPlaying = false;
                }
            }
        }
    },
    YTStateChange: function(e) {
        let self = this;
        switch (e.data)
        {
            case 1: // play
                //
                this.syncVideo();
                break;

            case 2: // pause
                //
                if (self.localPlayerPlaying === true)
                {
                    self.localPlayer.pause();
                    self.localPlayerPlaying = false;
                }
                break;

            default:
                //
                console.log(e);
                break;
        }
    },
    initPlayers: function() {
        if (this.ytVideoUrlInput.value.match(/v=/i) !== null && this.localVideoSelect.files.length > 0)
        {
            let self = this;
            let id = this.ytVideoUrlInput.value.split('v=').pop().replace(/^([A-Za-z0-9]+).*$/i, '$1');

            this.ytPlayer = new YT.Player('yt-player', {
                videoId: id,
                width: '640',
                height: '390',
                playerVars: {playsinline:1},
                events: {
                    onStateChange: this.YTStateChange.bind(this),
                }
            });

            this.localPlayer = document.createElement('video');
            this.localPlayer.setAttribute('preload', 'metadata');
            //this.localPlayer.setAttribute('controls', 'controls');
            this.localPlayer.onloadedmetadata = function(){ self.videoDuration = this.duration; };

            let source = document.createElement('source');
            source.src = URL.createObjectURL(this.localVideoSelect.files[0]);
            this.localPlayer.replaceChildren(source);

            this.timeOffsetButton.disabled = false;

            this.localVideo.replaceChildren(this.localPlayer);
            document.getElementById('video-players').classList.add('show');
        }
    },
    updateTimeOffset: function() {
        this.videoTimeOffset = this.ytPlayer.getCurrentTime();
        this.timeOffsetInput.value = this.ytPlayer.getCurrentTime();
    }
};

YTRS.init();

/*

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
    let id = yt_video_url.split('v=').pop().replace(/^([A-Za-z0-9]+).*$/i, '$1');
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
});*/