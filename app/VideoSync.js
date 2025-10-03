"use client"

import Script from 'next/script'
import {useEffect, useMemo, useRef, useState} from 'react'
import { Button, ControlGroup, FileInput, InputGroup } from '@blueprintjs/core'

const YtID = url => {
    let id = ''
    url = url.replace(/(>|<)/gi,'').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
    if (url[2] !== undefined)
    {
        id = url[2].split(/[^0-9a-z_\-]/i)[0]
    } else
    {
        id = url.pop()
    }
    return id
}

export default function VideoSync() {
    const interval = useRef()
    const YTVideo = useRef(null)
    const YTPlayer = useRef(null)
    const [step, setStep] = useState(1)
    const [YtURL, setYtURL] = useState('')
    const [YtState, setYtState] = useState(0)
    const [timeOffset, setTimeOffset] = useState(0)
    const [localVideoURL, setLocalVideoURL] = useState('')
    const [localVideoValid, setLocalVideoValid] = useState(false)
    const [localVideoDuration, setLocalVideoDuration] = useState(0)

    useEffect(() => {
        if (YTVideo.current !== null)
        {
            YTPlayer.current = new YT.Player(YTVideo.current, {
                videoId: id,
                width: '640',
                height: '390',
                playerVars: {playsinline:1},
                events: {
                    onStateChange: function(e)
                    {

                    },
                }
            })
        }
    }, [YTVideo.current])

    const step1Complete = useMemo(() => {
        return (YTPlayer.current !== null && YTPlayer.current.getCurrentTime() > 0)
    }, [YtState])

    const step2Complete = useMemo(() => {
        return localVideoValid
    }, [localVideoValid])

    const updateYtURL = value => {
        setYtURL(value)
        clearInterval(interval.current)
        interval.current = setTimeout(() => {
            let id = YtID(value)
            if (id !== '')
            {
                YTPlayer.current = new YT.Player('yt-player', {
                    videoId: id,
                    width: '640',
                    height: '390',
                    playerVars: {playsinline:1},
                    events: {
                        onStateChange: function(e)
                        {
                            setYtState(e.data)
                        },
                    }
                })
            }
        }, 700)
    }

    const gotoStep2 = () => {
        setTimeOffset(YTPlayer.current.getCurrentTime())
        setStep(2)
    }

    const gotoStep3 = () => {
        setStep(3)
    }

    const selectLocalVideo = e => {
        setLocalVideoURL(URL.createObjectURL(e.target.files[0]))
    }

    const loadedMetadata = e => {
        setLocalVideoValid(true)
        setLocalVideoDuration(e.target.duration)
    }

    const localVideoError = () => {
        alert('Please check video format, possibly unsupported by your browser.')
    }

    return (
        <>
            <div id="root" className={ `step-${step}` }>
                {(step === 1) && (
                    <div className="app-panel">
                        <div className="block">
                            <ControlGroup>
                                <InputGroup
                                    fill={ true }
                                    value={ YtURL }
                                    onValueChange={ updateYtURL }
                                    placeholder="Youtube video URL"
                                    />
                                <Button
                                    text="Next"
                                    intent="primary"
                                    endIcon="arrow-right"
                                    onClick={ gotoStep2 }
                                    disabled={ ( ! step1Complete ) }
                                    />
                            </ControlGroup>
                        </div>
                        {(YtURL.trim() !== '') && (
                            <>
                                <div className="block">
                                    Play the video until the reaction starts, then click &quot;Next&quot;.
                                </div>
                                <div className="yt-wrapper">
                                    <div id="yt-player" />
                                </div>
                            </>
                        )}
                    </div>
                )}
                {(step === 2) && (
                    <div className="app-panel">
                        <div className="block">
                            <FileInput
                                fill={ true }
                                onChange={ selectLocalVideo }
                                hasSelection={ (localVideoURL !== '') }
                                />
                            <Button
                                text="Next"
                                intent="primary"
                                endIcon="arrow-right"
                                onClick={ gotoStep3 }
                                disabled={ ( ! step2Complete ) }
                                />
                        </div>
                        {(localVideoURL !== '') && (
                            <>
                                <div className="block">
                                    <video preload="metadata" onLoadedMetadata={ loadedMetadata } onError={ localVideoError } controls>
                                        <source src={ localVideoURL } />
                                    </video>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {(step === 3) && (
                    <>
                        <div className="local-video-player">
                            <video>
                                <source src={ localVideoURL } />
                            </video>
                        </div>
                        <div className="yt-wrapper">
                            <div ref={ YTVideo } />
                        </div>
                    </>
                )}
            </div>
            <Script src="https://www.youtube.com/iframe_api" />
        </>
    )
}