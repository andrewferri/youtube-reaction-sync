const VOLUME_ICON = '<svg width="15px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 1H8V15H6L2 11H0V5H2L6 1Z" fill="#000000"/><path d="M14 8C14 5.79086 12.2091 4 10 4V2C13.3137 2 16 4.68629 16 8C16 11.3137 13.3137 14 10 14V12C12.2091 12 14 10.2091 14 8Z" fill="#000000"/><path d="M12 8C12 9.10457 11.1046 10 10 10V6C11.1046 6 12 6.89543 12 8Z" fill="#000000"/></svg>'
const MUTED_ICON = '<svg width="15px" height="15px" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 1H6L2 5H0V11H2L6 15H8V1Z" fill="#000000"/><path d="M9.29289 6.20711L11.0858 8L9.29289 9.79289L10.7071 11.2071L12.5 9.41421L14.2929 11.2071L15.7071 9.79289L13.9142 8L15.7071 6.20711L14.2929 4.79289L12.5 6.58579L10.7071 4.79289L9.29289 6.20711Z" fill="#000000"/></svg>'

const YTRS = {
    layout: '',
    root: null,
    step: null,
    interval: null,
    videoOffset: 0,
    YTPlayer: null,
    YTVideoURL: '',
    currentVolume: 0,
    localVideoURL: '',
    volumeButton: null,
    volumeSlider: null,
    videoPlaying: false,
    YTVideoValid: false,
    localVideoPlayer: '',
    localVideoDuration: 0,
    localVideoValid: false,
    init: function()
    {
        this.root = $('#root')
        this.step = $('#step')
        this.step1()

        let faq = $('#faq')
        $('#faq-open').on('click', function(e){
            e.preventDefault()
            faq.addClass('show')
        })
        $('#faq-close').on('click', function(e){
            e.preventDefault()
            faq.removeClass('show')
        })
    },
    step1: function() // YT URL
    {
        let self = this
        self.root.attr('class', 'step1')

        let timeout = null
        let warning = null
        let button = $('button.btn')
        let input = $('input.text')

        input.on('input', function(e)
        {
            self.YTVideoURL = e.target.value
            console.log(e.target.value)

            if (warning !== null)
            {
                warning.remove()
            }

            clearTimeout(timeout)

            if (e.target.value !== '')
            {
                timeout = setTimeout(function()
                {
                    let note = $('<p>Play the video until you reach the beginning of the reaction, then click "Next".</p>')
                    self.step.append(note)

                    let wrap = $('<div class="yt-wrapper" />')
                    self.step.append(wrap)

                    let div = $('<div id="yt-player" />')
                    wrap.append(div)
                    console.log(div[0])

                    try {
                        div.innerHTML = ''

                        let player = new YT.Player(div[0], {
                            videoId: self.youtubeId(),
                            width: '640',
                            height: '390',
                            playerVars: {playsinline:1},
                            events: {
                                onStateChange: function()
                                {
                                    button.removeAttr('disabled')
                                },
                            }
                        })

                        button.on('click', function()
                        {
                            self.videoOffset = player.getCurrentTime()
                            self.step2()
                        })

                        self.YTVideoValid = true
                    } catch(e) {
                        note.remove()
                        wrap.remove()
                        button.attr('disabled', 'disabled')
                        self.YTVideoValid = false

                        warning = $('<div class="warning-message">Invalid video URL</div>')
                        self.step.append(warning)
                    }
                }, 600)
            }
        })
    },
    step2: function() // Select local file
    {
        let self = this
        self._clear()
        self.root.attr('class', 'step2')

        let note = $('<div class="block">Select local video file</div>')

        let button = $('<button class="btn" disabled>Next &rarr</button>')
        button.on('click', self.validate_step2.bind(self))

        let input = $('<input type="file" />')
        input.on('change', function(e)
        {
            self.localVideoURL = URL.createObjectURL(e.target.files[0])
            let el = $('#local-player')
            if (el.length <= 0)
            {
                el = $('<div id="local-player" />')
                self.step.append(el)
            }

            el.html('')
            self.loadLocalPlayer(true)

            setTimeout(function()
            {
                if (self.localVideoValid === true)
                {
                    button.removeAttr('disabled')
                } else
                {
                    el.remove()
                }
            }, 100)
        })

        let div = $('<div class="block inputs" />')
        div.append(input)
        div.append(button)
        self.step.append(note)
        self.step.append(div)
    },
    validate_step2: function()
    {
        if (this.YTVideoValid === false)
        {
            alert('Please enter Youtube video URL')
        } else if (this.localVideoValid === false)
        {
            alert('Local video file not selected')
        } else
        {
            this.step3()
        }
    },
    step3: function() // Set up video players
    {
        let self = this
        self._clear()
        self.root.attr('class', 'step3')

        $('#faq-toggle').remove()

        if (localStorage.getItem('infoCleared') === null)
        {
            let info = $('<div class="info"><p>Use the right edge of the Youtube video to resize. Use the other edges to drag and reposition.<br/>When you\'re ready, click play on the Youtube video. The local video will sync with the Youtube video when you play/pause/seek.</p></div>')
            self.step.append(info)

            let a = $('<a href="#">&times;</a>')
            a.on('click', function(e)
            {
                e.preventDefault()
                info.remove()
                localStorage.setItem('infoCleared', '1')
            })
            info.append(a)
        }

        let div = $('<div id="local-player" />')
        self.step.append(div)
        self.loadLocalPlayer(false)

        let wrap1 = $('<div class="yt-wrap" />')
        self.step.append(wrap1)

        let top = localStorage.getItem('ytTop')
        let left = localStorage.getItem('ytLeft')
        let width = localStorage.getItem('ytWidth')

        if (top !== null){ wrap1.css('top', top) }
        if (left !== null){ wrap1.css('left', left) }
        if (width !== null){ wrap1.css('width', width) }

        let wrap2 = $('<div class="yt-wrapper" />')
        wrap1.append(wrap2)

        div = $('<div id="yt-player" />')
        wrap2.append(div)

        self.YTPlayer = new YT.Player(div[0], {
            videoId: self.youtubeId(),
            width: '640',
            height: '390',
            playerVars: {playsinline:1},
            events: {
                onStateChange: self.ytStateChange.bind(self),
            }
        })

        // YT drag/resize
        interact('.yt-wrap')
            .resizable({
                edges: {right: true},
                listeners: {
                    start()
                    {
                        wrap1.addClass('dragging')
                    },
                    end()
                    {
                        wrap1.removeClass('dragging')
                    },
                    move(event)
                    {
                        let width = Math.round(event.rect.width) + 'px'
                        localStorage.setItem('ytWidth', width)
                        event.target.style.width = width
                    },
                },
                modifiers: [
                    interact.modifiers.restrictSize({
                        min: {width:400},
                    })
                ]
            })
            .draggable({
                listeners: {
                    start()
                    {
                        wrap1.addClass('dragging')
                    },
                    end()
                    {
                        wrap1.removeClass('dragging')
                    },
                    move(event)
                    {
                        let left = Math.round(event.rect.left) + 'px'
                        let top = Math.round(event.rect.top) + 'px'

                        localStorage.setItem('ytLeft', left)
                        localStorage.setItem('ytTop', top)

                        event.target.style.left = left
                        event.target.style.top = top
                    },
                },
                inertia: true,
            })
    },
    ytStateChange: function(e)
    {
        let self = this
        switch (e.data)
        {
            case 1: // Play
                self.syncVideo()
                break

            case 2: // Pause
                if (self.videoPlaying === true)
                {
                    self.localVideoPlayer.pause()
                    self.videoPlaying = false
                }
                break
        }
    },
    syncVideo: function()
    {
        let self = this
        let time = self.YTPlayer.getCurrentTime() - self.videoOffset

        if (time < 0)
        {
            // We loop until we reach the offset time, then play the video.
            self.interval = setTimeout(self.syncVideo.bind(self), 100);
        } else
        {
            if (time < self.localVideoDuration)
            {
                self.localVideoPlayer.currentTime = time
                if (self.videoPlaying === false)
                {
                    self.localVideoPlayer.play().then(() => {
                        self.videoPlaying = true
                    })
                }
            } else
            {
                // Youtube video is playing past duration of local video, we pause.
                self.localVideoPlayer.pause()
                self.videoPlaying = false
            }
        }
    },
    changeVolume: function(e)
    {
        this.currentVolume = parseFloat((parseInt(e.target.value) / 100).toFixed(2))
        this.localVideoPlayer.volume = this.currentVolume
        this.volumeButton.innerHTML = (this.currentVolume <= 0) ? MUTED_ICON : VOLUME_ICON
    },
    toggleMute: function()
    {
        if (this.localVideoPlayer.volume > 0)
        {
            this.volumeSlider.value = 0
            this.localVideoPlayer.volume = 0
            this.volumeButton.innerHTML = MUTED_ICON
        } else
        {
            this.volumeSlider.value = this.currentVolume * 100
            this.localVideoPlayer.volume = this.currentVolume
            this.volumeButton.innerHTML = VOLUME_ICON
        }
    },
    loadLocalPlayer: function(controls=false)
    {
        let self = this
        let parent = $('#local-player')
        let video = $('<video preload="metadata" />')

        if (controls === true)
        {
            video.attr('controls', 'true')
        }

        video.on('loadedmetadata', function()
        {
            self.localVideoDuration = this.duration
        })

        video.on('canplay', function()
        {
            self.localVideoValid = true
        })

        /*self.localVideoPlayer.oncanplay = function()
        {
            self.localVideoValid = true

            if (controls === false)
            {
                let div = document.createElement('div')
                div.className = 'video-controls'
                parent.appendChild(div)

                self.volumeButton = document.createElement('button')
                self.volumeButton.innerHTML = VOLUME_ICON
                self.volumeButton.addEventListener('click', self.toggleMute.bind(self))
                div.appendChild(self.volumeButton)

                self.volumeSlider = document.createElement('input')
                self.volumeSlider.setAttribute('type', 'range')
                self.volumeSlider.setAttribute('min', '0')
                self.volumeSlider.setAttribute('max', '100')
                self.volumeSlider.setAttribute('step', '1')
                self.volumeSlider.addEventListener('input', self.changeVolume.bind(self))
                self.volumeSlider.addEventListener('change', self.changeVolume.bind(self))
                self.volumeSlider.value = Math.round(self.localVideoPlayer.volume * 100).toString()
                div.appendChild(self.volumeSlider)

                self.currentVolume = self.localVideoPlayer.volume
            }
        }*/

        video.on('error', function()
        {
            self.localVideoValid = false
            alert('Invalid video format, please choose another file.')
        })

        let source = $(`<source src="${self.localVideoURL}" />`)
        source.on('error', function()
        {
            self.localVideoValid = false
            alert('Invalid video format, please choose another file.')
        })

        video.append(source)
        parent.append(video)
        self.localVideoPlayer = video[0]
    },
    youtubeId: function() {
        let id = ''
        let url = this.YTVideoURL.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
        if(url[2] !== undefined)
        {
            id = url[2].split(/[^0-9a-z_\-]/i)[0]
        } else
        {
            id = url
        }
        return id
    },
    _clear: function()
    {
        this.step.html('')
    },
}

YTRS.init()