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
    ytPlayerContainer: document.getElementsByClassName('yt-player')[0],

    init: function() {
        let self = this;
        this.ytVideoUrlInput.addEventListener('input', self.initPlayers.bind(this));
        this.localVideoSelect.addEventListener('change', self.initPlayers.bind(this));
        this.timeOffsetButton.addEventListener('click', self.updateTimeOffset.bind(this));
        this.timeOffsetButtonDec.addEventListener('click', self.timeOffsetDec.bind(this));
        this.timeOffsetButtonInc.addEventListener('click', self.timeOffsetInc.bind(this));
        this.theatreModeButton.addEventListener('click', self.toggleTheatreMode.bind(this));
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
        if (this.ytVideoUrlInput.value.match(/v=/i) !== null && this.localVideoSelect.files.length > 0)
        {
            let self = this;

            this.ytPlayer = new YT.Player('yt-player', {
                videoId: this.ytVideoUrlInput.value.split('v=').pop().replace(/^([A-Za-z0-9]+).*$/i, '$1'),
                width: '640',
                height: '390',
                playerVars: {playsinline:1},
                events: { onStateChange: this.YTStateChange.bind(this) }
            });

            // Create HTML5 video element to play local video
            this.localPlayer = document.createElement('video');
            this.localPlayer.setAttribute('preload', 'metadata');
            this.localPlayer.onloadedmetadata = function(){ self.videoDuration = this.duration; };

            // Create source element for video above
            let source = document.createElement('source');
            source.src = URL.createObjectURL(this.localVideoSelect.files[0]);
            this.localPlayer.replaceChildren(source);

            this.timeOffsetButton.disabled = false;
            this.localVideo.replaceChildren(this.localPlayer);
            document.getElementById('video-players').classList.add('show');
        }
    },

    updateTimeOffset: function() {
        this.theatreModeButton.disabled = false;
        this.timeOffsetButtonDec.disabled = false;
        this.timeOffsetButtonInc.disabled = false;
        this.videoTimeOffset = this.ytPlayer.getCurrentTime();
        this.timeOffsetInput.value = this.ytPlayer.getCurrentTime();
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
};

YTRS.init();