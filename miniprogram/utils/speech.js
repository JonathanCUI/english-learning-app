let plugin = null;
let audio = null;

try {
  const accountInfo = wx.getAccountInfoSync();
  const appId = accountInfo && accountInfo.miniProgram && accountInfo.miniProgram.appId;
  if (appId && appId !== 'touristappid') plugin = requirePlugin('WechatSI');
} catch (error) {
  plugin = null;
}

function ensureAudio() {
  if (!audio) audio = wx.createInnerAudioContext();
  return audio;
}

function speak(text, lang) {
  return new Promise((resolve) => {
    if (!text) {
      resolve(false);
      return;
    }
    if (!plugin || typeof plugin.textToSpeech !== 'function') {
      wx.showToast({ title: '游客模式暂不支持发音', icon: 'none' });
      resolve(false);
      return;
    }

    plugin.textToSpeech({
      lang: lang || 'en_US',
      tts: true,
      content: text,
      success(result) {
        const player = ensureAudio();
        let settled = false;
        const finish = (played) => {
          if (settled) return;
          settled = true;
          if (typeof player.offEnded === 'function') player.offEnded(handleEnded);
          if (typeof player.offError === 'function') player.offError(handleError);
          resolve(played);
        };
        const handleEnded = () => finish(true);
        const handleError = () => finish(false);
        player.stop();
        player.src = result.filename;
        player.onEnded(handleEnded);
        player.onError(handleError);
        player.play();
        setTimeout(() => finish(false), 12000);
      },
      fail() {
        resolve(false);
      }
    });
  });
}

async function speakPair(word) {
  if (!word) return false;
  await speak(word.english, 'en_US');
  await speak(word.chinese, 'zh_CN');
  return true;
}

function stop() {
  if (audio) audio.stop();
}

module.exports = { speak, speakPair, stop };
