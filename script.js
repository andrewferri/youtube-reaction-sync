const YTRS = {
    interval: null,
    ytPlayer: null,
    videoDuration: 0,
    localPlayer: null,
    videoTimeOffset: 0,
    localPlayerPlaying: false,
    global: document.getElementById('global'),
    timeOffsetInput: document.getElementById('time-offset'),
    ytVideoUrlInput: document.getElementById('yt-video-url'),
    localVideo: document.getElementById('local-video-player'),
    timeOffsetButton: document.getElementById('time-offset-btn'),
    theatreModeButton: document.getElementById('theatre-mode-btn'),
    localVideoSelect: document.getElementById('local-video-select'),
    timeOffsetButtonDec: document.getElementById('time-offset-dec'),
    timeOffsetButtonInc: document.getElementById('time-offset-inc'),
    videoCompleteButton: document.getElementById('video-complete-btn'),
    ytPlayerContainer: document.getElementsByClassName('yt-player')[0],

    init: function() {
        let self = this;
        this.ytVideoUrlInput.addEventListener('input', self.initPlayers.bind(this));
        this.localVideoSelect.addEventListener('change', self.initPlayers.bind(this));
        this.timeOffsetButton.addEventListener('click', self.updateTimeOffset.bind(this));
        this.timeOffsetButtonDec.addEventListener('click', self.timeOffsetDec.bind(this));
        this.timeOffsetButtonInc.addEventListener('click', self.timeOffsetInc.bind(this));
        this.videoCompleteButton.addEventListener('click', self.videoComplete.bind(this));
        this.theatreModeButton.addEventListener('click', self.toggleTheatreMode.bind(this));
    },

    videoComplete: function() {
        this.localPlayer.pause();
    },

    timeOffsetDec: function() {
        this.videoTimeOffset -= 0.1;
        this.timeOffsetInput.value = this.videoTimeOffset;
    },

    timeOffsetInc: function() {
        this.videoTimeOffset += 0.1;
        this.timeOffsetInput.value = this.videoTimeOffset;
    },

    syncVideo: function() {
        let self = this;
        if (self.videoTimeOffset > 0)
        {
            let time = self.ytPlayer.getCurrentTime() - self.videoTimeOffset;
            if (time < 0)
            {
                // We loop until we reach the offset time, then play the video.
                self.interval = setTimeout(self.syncVideo.bind(self), 100);
            } else
            {
                clearInterval(self.interval);
                if (time < self.videoDuration)
                {
                    self.localPlayer.currentTime = time;
                    if (self.localPlayerPlaying === false)
                    {
                        self.localPlayer.play().then(() => {
                            self.localPlayerPlaying = true;
                        });
                    }
                } else
                {
                    // Youtube video is playing past duration of local video, we pause.
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
            case 1: // Play
                //
                this.syncVideo();
                break;

            case 2: // Pause
                //
                if (self.localPlayerPlaying === true)
                {
                    self.localPlayer.pause();
                    self.localPlayerPlaying = false;
                }
                break;
        }
    },

    initPlayers: function() {
        let id = this.youtubeId(this.ytVideoUrlInput.value);
        if (id !== '' && this.localVideoSelect.files.length > 0)
        {
            let self = this;

            //
            self.ytPlayer = new YT.Player('yt-player', {
                videoId: id,
                width: '640',
                height: '390',
                playerVars: {playsinline:1},
                events: { onStateChange: self.YTStateChange.bind(self) }
            });

            // Create HTML5 video element to play local video
            self.localPlayer = document.createElement('video');
            self.localPlayer.setAttribute('preload', 'metadata');
            self.localPlayer.onloadedmetadata = function(){ self.videoDuration = this.duration; };
            self.localPlayer.oncanplay = function(){
                self.timeOffsetButton.disabled = false;
                document.getElementById('video-players').classList.add('show');
            };

            // Create source element for video above
            let source = document.createElement('source');
            source.src = URL.createObjectURL(this.localVideoSelect.files[0]);
            source.addEventListener('error', function(){
                alert('Invalid video file, please check.');
            });
            self.localPlayer.replaceChildren(source);
            self.localVideo.replaceChildren(self.localPlayer);
        }
    },

    updateTimeOffset: function() {
        this.theatreModeButton.disabled = false;
        this.timeOffsetButtonDec.disabled = false;
        this.timeOffsetButtonInc.disabled = false;
        this.videoCompleteButton.disabled = false;
        this.videoTimeOffset = this.ytPlayer.getCurrentTime();
        this.timeOffsetInput.value = this.ytPlayer.getCurrentTime();
        this.syncVideo();
    },

    toggleTheatreMode: function() {
        this.global.classList.toggle('theatre-mode');
        if (this.global.classList.contains('theatre-mode'))
        {
            let self = this;
            setTimeout(() => {
                let width = document.body.clientWidth - self.localPlayer.clientWidth - 100;
                self.ytPlayerContainer.style.width = `${width}px`;
            }, 100)
        } else
        {
            this.ytPlayerContainer.removeAttribute('style');
        }
    },

    youtubeId: function(url) {
        let id = '';
        url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        if(url[2] !== undefined)
        {
            id = url[2].split(/[^0-9a-z_\-]/i)[0];
        } else
        {
            id = url;
        }
        return id;
    },
};

YTRS.init();