const speechMap = require('../data/audio.js');

let audio = null;
let activeFinish = null;
let currentScope = '';
let lastNoticeAt = 0;

function setScope(grade, semester, unit) {
  currentScope = [grade || '', semester || '', unit || ''].join('|');
}

function showSpeechNotice(error) {
  const now = Date.now();
  if (now - lastNoticeAt < 1500) return;
  lastNoticeAt = now;
  const details = error && (error.errMsg || error.message || error);
  wx.showModal({
    title: '语音播放失败',
    content: '没有找到当前单元的语音资源，请返回首页重新进入该单元。' + (details ? '\n' + String(details) : ''),
    showCancel: false,
    confirmText: '知道了'
  });
}

function ensureAudio() {
  if (!audio) {
    audio = wx.createInnerAudioContext();
    audio.obeyMuteSwitch = false;
  }
  return audio;
}

function playSource(source) {
  return new Promise((resolve) => {
    const player = ensureAudio();
    if (activeFinish) activeFinish(false);

    let settled = false;
    let playbackTimer = null;
    const finish = (played, playbackError) => {
      if (settled) return;
      settled = true;
      if (playbackTimer) clearTimeout(playbackTimer);
      if (typeof player.offEnded === 'function') player.offEnded(handleEnded);
      if (typeof player.offError === 'function') player.offError(handleError);
      if (activeFinish === finish) activeFinish = null;
      if (playbackError) showSpeechNotice(playbackError);
      resolve(played);
    };
    const handleEnded = () => finish(true);
    const handleError = (error) => finish(false, error);

    activeFinish = finish;
    player.stop();
    player.onEnded(handleEnded);
    player.onError(handleError);
    player.src = source;
    playbackTimer = setTimeout(() => finish(false, new Error('语音播放超时')), 15000);
    player.play();
  });
}

async function speak(text, lang, kind) {
  if (!text) return false;
  const resolvedKind = kind || (lang === 'zh_CN' ? 'meaning-zh' : 'word-en');
  const unitMap = speechMap[currentScope];
  const source = unitMap && unitMap[resolvedKind] && unitMap[resolvedKind][text];
  if (!source) {
    showSpeechNotice(new Error('当前课本单元中没有“' + text + '”'));
    return false;
  }
  return playSource(source);
}

async function speakPair(word) {
  if (!word) return false;
  const englishPlayed = await speak(word.english, 'en_US', 'word-en');
  if (!englishPlayed) return false;
  return speak(word.chinese, 'zh_CN', 'meaning-zh');
}

function stop() {
  if (activeFinish) activeFinish(false);
  if (audio) audio.stop();
}

module.exports = { setScope, speak, speakPair, stop };
