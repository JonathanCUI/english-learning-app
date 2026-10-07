(function (root) {
  const key = (grade, semester, unit, mode) => [grade, semester, unit, mode].join('|');
  const valid = (record, total) => record && Number.isFinite(record.ms) && record.ms > 0 && record.total === total;
  function format(ms) {
    const seconds = (ms % 60000 / 1000).toFixed(1);
    return ms >= 60000 ? Math.floor(ms / 60000) + '分' + seconds + '秒' : seconds + '秒';
  }
  function settle(records, run, score, total, now) {
    if (!run || run.done) return null;
    run.done = true;
    const ms = Math.round(((run.endedAt || now) - run.startedAt) / 100) * 100;
    if (!run.key || total <= 0 || total !== run.total || score !== total || ms <= 0) return null;
    const previous = records[run.key];
    const established = valid(previous, total);
    if (established && ms >= previous.ms) return { ms, reward: 0, changed: false, message: '全对用时 ' + format(ms) + '，继续挑战最快纪录！' };
    return {
      ms, reward: established ? 50 : 0, changed: true,
      records: Object.assign({}, records, { [run.key]: { ms, total } }),
      message: established ? '打破全对纪录！' + format(ms) + '，额外获得 50 星光币！' : '首次全对纪录：' + format(ms) + '，下次打破可奖励 50 星光币！'
    };
  }
  const api = { key, valid, format, settle };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PerfectRecords = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
