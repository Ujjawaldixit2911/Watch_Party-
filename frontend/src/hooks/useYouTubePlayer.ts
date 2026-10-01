import { useEffect, useRef, useState, useCallback } from 'react';
import { useRoom } from '../context/RoomContext';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer(containerId: string) {
  const { state, dispatch, sendPlay, sendPause, sendSeek } = useRoom();
  const playerRef = useRef<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const isApplyingRemoteUpdate = useRef(false);
  const lastAppliedVersion = useRef(-1);
  const currentVideoIdRef = useRef<string | null>(null);

  // 1. Load YouTube IFrame API Script
  useEffect(() => {
    if (window.YT && window.YT.Player) {
      initPlayer();
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };
  }, []);

  // 2. Initialize YT.Player
  const initPlayer = useCallback(() => {
    if (playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(containerId, {
        videoId: state.playback.videoId || 'dQw4w9WgXcQ',
        playerVars: {
          autoplay: 0,
          controls: 0, // Custom controls for all users
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setIsPlayerReady(true);
            setDuration(event.target.getDuration() || 0);
            currentVideoIdRef.current = state.playback.videoId;

            // Fetch video title
            try {
              const videoData = event.target.getVideoData();
              if (videoData?.title) {
                dispatch({ type: 'SET_VIDEO_TITLE', payload: videoData.title });
              }
            } catch {
              // Ignore iframe title read error if blocked
            }

            // Trigger initial sync
            applyRemoteSnapshot(state.playback, true);
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (cued)
            if (event.data === window.YT.PlayerState.PLAYING) {
              dispatch({ type: 'SET_AUTOPLAY_BLOCKED', payload: false });
            }
          },
          onError: (event: any) => {
            console.error('[YouTube Player Error]', event.data);
          },
        },
      });
    } catch (err) {
      console.error('Failed to instantiate YT.Player:', err);
    }
  }, [containerId, state.playback.videoId]);

  // 3. Compute expected time based on snapshot and server clock offset
  const getExpectedTime = useCallback(
    (snapshot: typeof state.playback) => {
      if (snapshot.state === 'PLAYING') {
        const serverNow = Date.now() + state.clockOffset;
        const elapsedSec = (serverNow - snapshot.serverTimestamp) / 1000;
        return Math.max(0, snapshot.time + elapsedSec);
      }
      return Math.max(0, snapshot.time);
    },
    [state.clockOffset]
  );

  // 4. Apply authoritative snapshot from server to local player
  const applyRemoteSnapshot = useCallback(
    (snapshot: typeof state.playback, force = false) => {
      const player = playerRef.current;
      if (!player || !player.seekTo || !isPlayerReady) return;

      if (!force && snapshot.version <= lastAppliedVersion.current) {
        return;
      }
      lastAppliedVersion.current = snapshot.version;

      isApplyingRemoteUpdate.current = true;
      const expectedTime = getExpectedTime(snapshot);

      // Handle video ID change
      if (snapshot.videoId && snapshot.videoId !== currentVideoIdRef.current) {
        currentVideoIdRef.current = snapshot.videoId;
        player.loadVideoById({
          videoId: snapshot.videoId,
          startSeconds: expectedTime,
        });

        setTimeout(() => {
          try {
            const data = player.getVideoData();
            if (data?.title) {
              dispatch({ type: 'SET_VIDEO_TITLE', payload: data.title });
            }
          } catch {}
        }, 800);
      } else {
        // Correct time if jitter > 0.5s
        const localTime = player.getCurrentTime() || 0;
        if (Math.abs(localTime - expectedTime) > 0.5) {
          player.seekTo(expectedTime, true);
        }
      }

      // Apply Play / Pause state
      if (snapshot.state === 'PLAYING') {
        try {
          const playPromise = player.playVideo();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              dispatch({ type: 'SET_AUTOPLAY_BLOCKED', payload: true });
            });
          }
        } catch {
          dispatch({ type: 'SET_AUTOPLAY_BLOCKED', payload: true });
        }
      } else {
        player.pauseVideo();
      }

      setTimeout(() => {
        isApplyingRemoteUpdate.current = false;
      }, 300);
    },
    [isPlayerReady, getExpectedTime, dispatch]
  );

  // Apply playback whenever snapshot updates
  useEffect(() => {
    if (isPlayerReady) {
      applyRemoteSnapshot(state.playback);
    }
  }, [state.playback, isPlayerReady, applyRemoteSnapshot]);

  // 5. Periodic Drift Correction (every 5 seconds)
  useEffect(() => {
    if (!isPlayerReady || state.playback.state !== 'PLAYING') return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player || isApplyingRemoteUpdate.current) return;

      const localTime = player.getCurrentTime() || 0;
      const expectedTime = getExpectedTime(state.playback);
      const drift = Math.abs(localTime - expectedTime);

      // If drift exceeds 1.0s, smoothly seek to correct expected time
      if (drift > 1.0) {
        isApplyingRemoteUpdate.current = true;
        player.seekTo(expectedTime, true);
        setTimeout(() => {
          isApplyingRemoteUpdate.current = false;
        }, 300);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isPlayerReady, state.playback, getExpectedTime]);

  // 6. Time and Duration Polling for UI (every 250ms)
  useEffect(() => {
    if (!isPlayerReady) return;

    const interval = setInterval(() => {
      const player = playerRef.current;
      if (!player) return;

      try {
        const time = player.getCurrentTime() || 0;
        const dur = player.getDuration() || 0;
        setCurrentTime(time);
        if (dur > 0 && dur !== duration) {
          setDuration(dur);
        }
      } catch {}
    }, 250);

    return () => clearInterval(interval);
  }, [isPlayerReady, duration]);

  // User Control Actions (Emits intents to server)
  const handlePlay = () => {
    if (isApplyingRemoteUpdate.current) return;
    const time = playerRef.current?.getCurrentTime() || currentTime;
    sendPlay(time);
  };

  const handlePause = () => {
    if (isApplyingRemoteUpdate.current) return;
    const time = playerRef.current?.getCurrentTime() || currentTime;
    sendPause(time);
  };

  const handleSeek = (newTime: number) => {
    if (isApplyingRemoteUpdate.current) return;
    sendSeek(newTime);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume > 0 && isMuted) {
        playerRef.current.unMute();
        setIsMuted(false);
      }
    }
  };

  const handleToggleMute = () => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  };

  const handleUnblockAutoplay = () => {
    if (playerRef.current) {
      const expectedTime = getExpectedTime(state.playback);
      playerRef.current.seekTo(expectedTime, true);
      playerRef.current.playVideo();
      dispatch({ type: 'SET_AUTOPLAY_BLOCKED', payload: false });
    }
  };

  return {
    isPlayerReady,
    currentTime,
    duration,
    volume,
    isMuted,
    handlePlay,
    handlePause,
    handleSeek,
    handleVolumeChange,
    handleToggleMute,
    handleUnblockAutoplay,
  };
}
