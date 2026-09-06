import React, { useState, useRef } from 'react';
import type { Song, LyricLine, Word } from '../types/lyrics';
import { X, Upload, Music, Sparkles, Mic, FileText, CheckCircle2, Play, Pause, RefreshCw, Link as LinkIcon, Loader2 } from 'lucide-react';
import { extractSongFromLink } from '../utils/linkExtractor';
import confetti from 'canvas-confetti';

interface SongStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSong: (newSong: Song) => void;
}

export const SongStudioModal: React.FC<SongStudioModalProps> = ({
  isOpen,
  onClose,
  onSaveSong,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'link' | 'details' | 'lyrics' | 'tap-sync'>('link');

  // Link Importer state inside studio
  const [studioLinkUrl, setStudioLinkUrl] = useState('');
  const [isExtractingLink, setIsExtractingLink] = useState(false);
  const [linkExtractSuccess, setLinkExtractSuccess] = useState(false);

  // Song metadata state
  const [title, setTitle] = useState('Cosmic Horizon');
  const [artist, setArtist] = useState('My Custom Track');
  const [album, setAlbum] = useState('Aura Collection');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80'
  );
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | undefined>(undefined);
  const [audioDuration, setAudioDuration] = useState(30);
  const [synthVibe, setSynthVibe] = useState('synthwave');


  // Raw lyrics text for paste mode
  const [rawLyrics, setRawLyrics] = useState(
    `Floating through the neon haze
Lost inside a velvet maze
Every heartbeat feels so clear
Now that you are standing here`
  );

  // Synced lyrics data
  const [parsedLines, setParsedLines] = useState<LyricLine[]>([]);

  // Tap-to-sync state
  const [syncWordsList, setSyncWordsList] = useState<{ lineIdx: number; wordIdx: number; text: string }[]>([]);
  const [currentSyncIndex, setCurrentSyncIndex] = useState(0);
  const [isSyncRecording, setIsSyncRecording] = useState(false);
  const [syncCurrentTime, setSyncCurrentTime] = useState(0);
  const syncTimerRef = useRef<number | null>(null);


  // Handle Cover Image Upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCoverUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Audio File Upload
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setAudioUrl(blobUrl);

      // Determine duration
      const tempAudio = new Audio(blobUrl);
      tempAudio.onloadedmetadata = () => {
        if (tempAudio.duration && isFinite(tempAudio.duration)) {
          setAudioDuration(Math.round(tempAudio.duration));
        }
      };
    }
  };

  // Auto Parse raw lyrics into timed words
  const handleAutoGenerateTimers = () => {
    const lines = rawLyrics
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) return;

    const totalSeconds = audioDuration || 30;
    const lineDuration = (totalSeconds - 2) / lines.length;

    const generated: LyricLine[] = lines.map((lineText, lIdx) => {
      const lineStart = 1.0 + lIdx * lineDuration;
      const lineEnd = lineStart + lineDuration * 0.9;
      const wordsArr = lineText.split(/\s+/).filter((w) => w.length > 0);
      const wordDuration = (lineEnd - lineStart) / wordsArr.length;

      const words: Word[] = wordsArr.map((w, wIdx) => ({
        text: w,
        startTime: +(lineStart + wIdx * wordDuration).toFixed(2),
        endTime: +(lineStart + (wIdx + 1) * wordDuration).toFixed(2),
        emphasis: wIdx === wordsArr.length - 1 || w.length > 6,
      }));

      return {
        id: `custom-${lIdx}`,
        startTime: +lineStart.toFixed(2),
        endTime: +lineEnd.toFixed(2),
        text: lineText,
        words,
      };
    });

    setParsedLines(generated);

    // Prepare for tap sync
    const flatWords: { lineIdx: number; wordIdx: number; text: string }[] = [];
    generated.forEach((line, lIdx) => {
      line.words.forEach((w, wIdx) => {
        flatWords.push({ lineIdx: lIdx, wordIdx: wIdx, text: w.text });
      });
    });
    setSyncWordsList(flatWords);
    setCurrentSyncIndex(0);
  };

  // Tap-to-sync start/stop recording
  const startTapSync = () => {
    if (parsedLines.length === 0) {
      handleAutoGenerateTimers();
    }
    setIsSyncRecording(true);
    setCurrentSyncIndex(0);
    setSyncCurrentTime(0);

    const startTime = Date.now();
    syncTimerRef.current = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setSyncCurrentTime(elapsed);
    }, 50);
  };

  const stopTapSync = () => {
    setIsSyncRecording(false);
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };

  // Record a word tap
  const handleTapWord = () => {
    if (!isSyncRecording || currentSyncIndex >= syncWordsList.length) return;

    const cur = syncWordsList[currentSyncIndex];
    const tapTime = +syncCurrentTime.toFixed(2);

    setParsedLines((prev) => {
      const next = [...prev];
      const line = { ...next[cur.lineIdx] };
      const words = [...line.words];

      // Update current word start time
      words[cur.wordIdx] = {
        ...words[cur.wordIdx],
        startTime: tapTime,
        endTime: +(tapTime + 0.5).toFixed(2),
      };

      // If previous word exists in same line, adjust its end time
      if (cur.wordIdx > 0) {
        words[cur.wordIdx - 1] = {
          ...words[cur.wordIdx - 1],
          endTime: tapTime,
        };
      }

      line.words = words;
      line.startTime = words[0].startTime;
      line.endTime = words[words.length - 1].endTime;
      next[cur.lineIdx] = line;
      return next;
    });

    setCurrentSyncIndex((prev) => prev + 1);

    if (currentSyncIndex + 1 >= syncWordsList.length) {
      stopTapSync();
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
  };

  // Handle Studio Link Extraction
  const handleExtractStudioLink = async () => {
    if (!studioLinkUrl.trim()) return;
    setIsExtractingLink(true);
    setLinkExtractSuccess(false);

    try {
      const extracted = await extractSongFromLink(studioLinkUrl);
      setTitle(extracted.title);
      setArtist(extracted.artist);
      setAlbum(extracted.album);
      setCoverUrl(extracted.coverUrl);
      setYoutubeVideoId(extracted.youtubeVideoId);
      setAudioDuration(extracted.duration);
      setParsedLines(extracted.lyrics);
      setLinkExtractSuccess(true);
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    } finally {
      setIsExtractingLink(false);
    }
  };

  // Handle Save
  const handleSave = () => {
    let finalLines = parsedLines;
    if (finalLines.length === 0) {
      handleAutoGenerateTimers();
      finalLines = parsedLines;
    }

    const newSong: Song = {
      id: youtubeVideoId ? `yt-${youtubeVideoId}` : `custom-song-${Date.now()}`,
      title: title.trim() || 'Untitled Track',
      artist: artist.trim() || 'Unknown Artist',
      album: album.trim() || 'Custom Album',
      coverUrl,
      audioUrl,
      youtubeVideoId,
      sourceType: youtubeVideoId ? 'youtube' : audioUrl ? 'audio' : 'synth',
      duration: audioDuration || 30,
      bpm: synthVibe === 'cyberpunk' ? 130 : synthVibe === 'lofi' ? 85 : 115,
      lyrics: finalLines.length > 0 ? finalLines : [
        {
          id: 'c1',
          startTime: 1,
          endTime: 5,
          text: 'Enjoying custom kinetic lyrics visualizer',
          words: [
            { text: 'Enjoying', startTime: 1, endTime: 2 },
            { text: 'custom', startTime: 2, endTime: 3 },
            { text: 'kinetic', startTime: 3, endTime: 4 },
            { text: 'visualizer', startTime: 4, endTime: 5, emphasis: true },
          ],
        },
      ],
    };

    onSaveSong(newSong);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg">
      <div className="w-full max-w-2xl max-h-[92vh] bg-neutral-950 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Custom Song Studio</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 mt-3 mb-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'link'
                ? 'border-fuchsia-500 text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <LinkIcon className="w-4 h-4 text-fuchsia-400" /> 1. Paste Link
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-fuchsia-500 text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Music className="w-4 h-4" /> 2. Song & Poster
          </button>
          <button
            onClick={() => {
              setActiveTab('lyrics');
              if (parsedLines.length === 0) handleAutoGenerateTimers();
            }}
            className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'lyrics'
                ? 'border-fuchsia-500 text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <FileText className="w-4 h-4" /> 3. Lyrics Sync
          </button>
          <button
            onClick={() => {
              setActiveTab('tap-sync');
              if (parsedLines.length === 0) handleAutoGenerateTimers();
            }}
            className={`flex-1 min-w-[120px] py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tap-sync'
                ? 'border-fuchsia-500 text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            <Mic className="w-4 h-4" /> 4. Tap to Sync
          </button>
        </div>

        {/* Tab 0: Paste Link Extractor */}
        {activeTab === 'link' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-fuchsia-950/40 to-indigo-950/40 border border-fuchsia-500/20 text-center">
              <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" /> Auto-Extract Music, Poster & Lyrics
              </h3>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
                Paste any YouTube Music, YouTube, Spotify link or search query to automatically fetch artwork and synchronized word timestamps!
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-white/50 font-mono block">
                Song URL or Search Term
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studioLinkUrl}
                  onChange={(e) => setStudioLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExtractStudioLink()}
                  placeholder="https://music.youtube.com/watch?v=... or song name"
                  className="flex-1 bg-white/5 border border-white/15 focus:border-fuchsia-400 rounded-xl px-3 py-2 text-sm text-white focus:outline-none placeholder-white/30"
                />
                <button
                  onClick={handleExtractStudioLink}
                  disabled={isExtractingLink || !studioLinkUrl.trim()}
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-fuchsia-500 hover:bg-fuchsia-400 text-white disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-lg"
                >
                  {isExtractingLink ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Extract</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {linkExtractSuccess && (
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center gap-3 animate-fade-in">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/20">
                  <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Successfully Extracted!
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
                  <p className="text-xs text-white/60 truncate">{artist} • {parsedLines.length} Lyric Lines</p>
                </div>
                <button
                  onClick={() => setActiveTab('details')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                >
                  Review Details →
                </button>
              </div>
            )}
          </div>
        )}


        {/* Tab 1: Song & Poster Details */}
        {activeTab === 'details' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-1.5">
                  Song Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                  placeholder="e.g. Neon Horizon"
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-1.5">
                  Artist Name
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                  placeholder="e.g. Luna Eclipse"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-1.5">
                  Album Name
                </label>
                <input
                  type="text"
                  value={album}
                  onChange={(e) => setAlbum(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-400"
                  placeholder="e.g. Aura Collection (2025)"
                />
              </div>

            </div>

            {/* Poster / Album Art */}
            <div>
              <label className="text-xs uppercase tracking-wider text-white/50 font-mono block mb-1.5">
                Poster Artwork (Dynamic Theme Origin)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/20 flex-shrink-0 bg-neutral-900 shadow-lg">
                  <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-fuchsia-400"
                    placeholder="Paste image URL..."
                  />
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs cursor-pointer transition-colors border border-white/10">
                    <Upload className="w-3.5 h-3.5" /> Upload Image File
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Audio Selection */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <label className="text-xs uppercase tracking-wider text-white/70 font-mono block">
                Audio Source
              </label>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex-1 p-3 rounded-xl border border-dashed border-white/20 hover:border-fuchsia-400 bg-white/5 flex flex-col items-center justify-center cursor-pointer text-center transition-colors">
                  <Upload className="w-5 h-5 text-fuchsia-400 mb-1" />
                  <span className="text-xs font-semibold text-white">Upload MP3 / Audio</span>
                  <span className="text-[10px] text-white/40 mt-0.5">
                    {audioUrl ? 'Custom Audio Attached ✓' : 'Click to select audio file'}
                  </span>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} className="hidden" />
                </label>

                <div className="flex-1 space-y-1.5">
                  <span className="text-xs text-white/60">Or use Built-in Synth Vibe:</span>
                  <select
                    value={synthVibe}
                    onChange={(e) => setSynthVibe(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="synthwave">Synthwave Neon (118 BPM)</option>
                    <option value="lofi">Lo-Fi Chill Sunset (86 BPM)</option>
                    <option value="cyberpunk">Cyberpunk Bass Drop (130 BPM)</option>
                    <option value="pastel">Ethereal Pastel Dream (95 BPM)</option>
                  </select>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-xs text-white/50">Duration (sec):</span>
                    <input
                      type="number"
                      min="10"
                      max="300"
                      value={audioDuration}
                      onChange={(e) => setAudioDuration(parseInt(e.target.value) || 30)}
                      className="w-18 bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Lyrics & Auto Sync */}
        {activeTab === 'lyrics' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs uppercase tracking-wider text-white/50 font-mono">
                  Paste Lyrics (One line per row)
                </label>
                <button
                  onClick={handleAutoGenerateTimers}
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-semibold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Auto-Estimate Timestamps
                </button>
              </div>
              <textarea
                value={rawLyrics}
                onChange={(e) => setRawLyrics(e.target.value)}
                rows={5}
                className="w-full bg-white/5 border border-white/15 rounded-2xl p-3 text-sm text-white font-mono focus:outline-none focus:border-fuchsia-400"
                placeholder="Type or paste lyrics here..."
              />
            </div>

            {/* Parsed Word List Preview */}
            <div className="border border-white/10 rounded-2xl p-3 bg-black/40">
              <span className="text-xs uppercase font-mono text-white/40 block mb-2">
                Parsed Sync Preview ({parsedLines.length} lines, {parsedLines.reduce((acc, l) => acc + l.words.length, 0)} words)
              </span>
              <div className="max-h-44 overflow-y-auto space-y-2">
                {parsedLines.map((line, lIdx) => (
                  <div key={lIdx} className="p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div className="flex justify-between text-white/50 font-mono mb-1">
                      <span>Line {lIdx + 1}</span>
                      <span>{line.startTime}s → {line.endTime}s</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {line.words.map((w, wIdx) => (
                        <span key={wIdx} className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono">
                          {w.text} ({w.startTime}s)
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Tap to Sync (Live recording) */}
        {activeTab === 'tap-sync' && (
          <div className="flex-1 flex flex-col justify-between py-2 space-y-4">
            <div className="text-center">
              <span className="text-xs uppercase tracking-widest text-fuchsia-400 font-mono font-semibold">
                Interactive Lyric Sync Studio
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Tap In Sync With Music</h3>
              <p className="text-xs text-white/60 mt-1 max-w-md mx-auto">
                Press the big button (or Spacebar) right as each word is sung to record micro-accurate timestamps!
              </p>
            </div>

            {/* Live Word Preview Display */}
            <div className="p-6 rounded-3xl glass-panel text-center flex flex-col items-center justify-center min-h-[140px] border border-white/20">
              <div className="text-xs font-mono text-white/40 mb-2">
                Timer: {syncCurrentTime.toFixed(1)}s / {audioDuration}s | Word {currentSyncIndex} / {syncWordsList.length}
              </div>

              {currentSyncIndex < syncWordsList.length ? (
                <div className="text-3xl sm:text-4xl font-black text-white text-glow-lg">
                  {syncWordsList[currentSyncIndex]?.text}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-lg">
                  <CheckCircle2 className="w-6 h-6" /> All Words Synchronized!
                </div>
              )}

              {/* Upcoming words */}
              <div className="flex gap-2 mt-3 text-xs text-white/40 font-mono overflow-hidden">
                {syncWordsList.slice(currentSyncIndex + 1, currentSyncIndex + 5).map((w, idx) => (
                  <span key={idx}>{w.text}</span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {!isSyncRecording ? (
                <button
                  onClick={startTapSync}
                  className="flex-1 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-base flex items-center justify-center gap-2 shadow-xl transition-all"
                >
                  <Play className="w-5 h-5 fill-current" /> Start Recording Sync
                </button>
              ) : (
                <>
                  <button
                    onClick={handleTapWord}
                    className="flex-1 py-5 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-xl flex items-center justify-center gap-2 shadow-2xl transition-all active:scale-95"
                  >
                    👉 TAP FOR NEXT WORD
                  </button>
                  <button
                    onClick={stopTapSync}
                    className="py-5 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-xs text-white/60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-fuchsia-500 to-indigo-500 text-white hover:opacity-90 transition-opacity shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save & Launch Song
          </button>
        </div>
      </div>
    </div>
  );
};
