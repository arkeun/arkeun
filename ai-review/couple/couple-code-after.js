const COUPLE_COLORS = [['rose', '#d9667a'], ['coral', '#e0835a'], ['plum', '#8a5a9e'], ['sky', '#4f86b8'], ['mint', '#3f9a85'], ['lilac', '#8f7bd0']];
const COUPLE_COLOR_NAME = { rose: '장미', coral: '살구', plum: '자두', sky: '하늘', mint: '민트', lilac: '라일락' };
const coupleColor = c => (COUPLE_COLORS.find(x => x[0] === c.color) || COUPLE_COLORS[0])[1];
const dPlus = since => Math.round((parse(today()) - parse(since)) / 86400000) + 1;
const duoPlays = (st, c) => st.plays.filter(p => p.people.length === 1 && p.people[0] === c.partner);
// 둘을 잇는 표시: 하트 · 미플 둘 · 주사위 (커플 공간 안에서만, 밖은 늘 작은 하트)
const C_MARKS = [['heart', '하트'], ['meeple', '미플'], ['dice', '주사위']];
const cMark = c => (c && c.mark) === 'meeple' ? html`<svg className="cmk" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.2a3.3 3.3 0 0 1 3.3 3.3c0 1-.4 1.8-1 2.4 2.6.6 6 1.6 6 3.6 0 1.3-1.6 1.7-3.3 1.6l2.6 5.2c.3.6-.1 1.3-.8 1.3h-3.6L12 16.4l-3.2 4.2H5.2c-.7 0-1.1-.7-.8-1.3L7 14.1c-1.7.1-3.3-.3-3.3-1.6 0-2 3.4-3 6-3.6a3.3 3.3 0 0 1 2.3-5.7z"/></svg>`
  : (c && c.mark) === 'dice' ? html`<svg className="cmk" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" fill="currentColor"/><g fill="#fff"><circle cx="8.3" cy="8.3" r="1.6"/><circle cx="15.7" cy="15.7" r="1.6"/><circle cx="12" cy="12" r="1.6"/></g></svg>`
  : html`<span className="cmk h">♥</span>`;
const fmtDot = s => { const x = parse(s); return `${x.getFullYear()}. ${x.getMonth() + 1}. ${x.getDate()}. (${DOW[x.getDay()]})`; };
const MILES = [10, 50, 100, 200, 300, 500, 1000, 2000, 3000, 5000];
// 기념일: 사귄 날 기준 100일 단위·매년, 둘이 처음 한 판, 둘이 N판째, 직접 넣은 날(매년 반복 가능)
function coupleDays(c, ps) {
  const t = today(); const out = [];
  if (c.since) {
    out.push({ k: 'since', label: '사귄 날', date: c.since, kind: 'love' });
    const d = dPlus(c.since); const upto = Math.max(1000, Math.ceil((d + 400) / 100) * 100);
    for (let n = 100; n <= upto; n += 100) out.push({ k: 'h' + n, label: `${nf(n)}일`, date: addDays(c.since, n - 1), kind: 'love' });
    const s = parse(c.since); const yNow = parse(t).getFullYear() - s.getFullYear() + 1;
    for (let y = 1; y <= yNow + 1; y++) { const a = new Date(s); a.setFullYear(s.getFullYear() + y); out.push({ k: 'y' + y, label: `${nf(y)}주년`, date: ymd(a), kind: 'love' }); }
  }
  const sorted = [...ps].sort((x, y) => x.date.localeCompare(y.date) || (x.at || 0) - (y.at || 0));
  if (sorted.length) out.push({ k: 'first', label: '둘이 처음 한 판', sub: GAME[sorted[0].gameId] ? GAME[sorted[0].gameId].ko : '', date: sorted[0].date, kind: 'game' });
  MILES.forEach(n => { if (sorted.length >= n) out.push({ k: 'm' + n, label: `둘이 ${nf(n)}판째`, sub: GAME[sorted[n - 1].gameId] ? GAME[sorted[n - 1].gameId].ko : '', date: sorted[n - 1].date, kind: 'game' }); });
  (c.days || []).forEach(x => { if (!x.date) return; if (x.yearly) { const s = parse(x.date); let a = new Date(s); a.setFullYear(parse(t).getFullYear()); if (ymd(a) < t) a.setFullYear(a.getFullYear() + 1); out.push({ k: 'u' + x.id, id: x.id, label: x.name, sub: '매년', date: ymd(a), kind: 'mine' }); }
    else out.push({ k: 'u' + x.id, id: x.id, label: x.name, date: x.date, kind: 'mine' }); });
  const next = MILES.find(n => n > sorted.length);
  return { list: out, nextMile: next ? { n: next, left: next - sorted.length } : null };
}
const dTo = ds => Math.round((parse(ds) - parse(today())) / 86400000);
function nextAnniv(c, ps) {
  const up = coupleDays(c, ps || []).list.filter(x => x.date >= today() && x.k !== 'since').sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'love' ? -1 : 1))[0];
  return up ? [up.label, dTo(up.date)] : null;
}
// 커플 사진 반반: 두 장이면 반반, 한 장이면 그 한 장, 없으면 null
const cssUrl = u => `url("${String(u).replace(/"/g, '%22')}")`;
const cPhotoStyle = c => c.photo && c.photoThem ? { backgroundImage: `${cssUrl(c.photo)}, ${cssUrl(c.photoThem)}`, backgroundSize: '50% 100%, 50% 100%', backgroundPosition: 'left, right', backgroundRepeat: 'no-repeat' } : (c.photo || c.photoThem) ? { backgroundImage: cssUrl(c.photo || c.photoThem), backgroundSize: 'cover', backgroundPosition: 'center' } : null;
// 사진 반반은 칸마다 따로 채워요(사진이 늘어나 보이지 않게)
const CPhoto = ({ c }) => c.photo && c.photoThem ? html`<span className="cp-phs">${[c.photo, c.photoThem].map((u, i) => html`<span key=${i}><img src=${u} alt=""/></span>`)}</span>` : html`<span className="cp-phs one"><span><img src=${c.photo || c.photoThem} alt=""/></span></span>`;
function CoupleCard({ c, st, onOpen }) {
  const ps = duoPlays(st, c); const ann = c.since ? nextAnniv(c, ps) : null; const ph = cPhotoStyle(c);
  return html`<button className="cp-me" style=${{ '--cc': coupleColor(c) }} onClick=${onOpen}>
    <span className="cp-me-ph">${ph ? html`<${CPhoto} c=${c}/>` : html`<${Avatar} name=${st.me} size=${26}/><${Avatar} name=${c.partner} size=${26}/>`}</span>
    <span className="cp-me-t"><b><span className="nm">${ME.name}</span> <span className="hrt">♥</span> <span className="nm">${c.partner}</span></b>
      <span>${[c.since ? `${nf(dPlus(c.since))}일째` : '커플 공간', ann ? (ann[1] ? `${ann[0]}까지 ${nf(ann[1])}일` : `오늘 ${ann[0]}`) : wishNew(c).length ? `${c.partner}님이 새로 찜한 게임 ${nf(wishNew(c).length)}개` : null].filter(Boolean).join(' · ')}</span></span>
    <span className="go">›</span></button>`;
}
function CoupleSheet({ st, c, close, onSave, onDelete }) {
const C_TABS = [['home', '홈'], ['wish', '같이 할 게임'], ['rec', ''], ['log', '기록'], ['stat', '통계']];
const C_IC = {
  wish: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10z"/></svg>`,
  log: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><rect x="4" y="5" width="16" height="15" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16"/></svg>`,
  stat: html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 20V12M12 20V5M19 20v-6"/></svg>`,
};
function CoupleScreen({ cid, st, back, open, editDay, removeFromId, shareDay, editCouple, updCouple, upCouple, startPlay }) {
  const recC = id => startPlay(id, false, { people: ['나', (st.couples || []).find(x => x.id === cid).partner], grp: null });
  const c = (st.couples || []).find(x => x.id === cid);
  const [cglim, setCglim] = useState(8);
  // 커플 공간 안의 탭은 하루 화면을 열었다 돌아와도 그대로
  const [tab, setTab0] = useState(() => { let t = NAV.cTab; NAV.cTab = null; if (!t) { try { t = sessionStorage.getItem('bg-ctab-' + cid); } catch (e) {} } return t || 'home'; });
  const setTab = t => { setTab0(t); setAnnOpen(false); try { sessionStorage.setItem('bg-ctab-' + cid, t); } catch (e) {} window.scrollTo(0, 0); };
  const [annOpen, setAnnOpen] = useState(false);
  const [wf, setWf] = useState('all');
  const [newIds, setNewIds] = useState([]);
  const [wq, setWq] = useState(''); const [wOwn, setWOwn] = useState(false); const [wlim, setWlim] = useState(50);
  useEffect(() => { if (tab !== 'wish' || !c) return; const f = wishNew(c); if (f.length) { setNewIds(f.map(w => w.id)); upCouple(c.id, x => ({ ...x, wish: wishOf(x).map(w => w.them ? { ...w, seen: true } : w) })); } }, [tab]);
  const [logv, setLogv] = useState('log');
  const [adding, setAdding] = useState(false);
  const [openW, setOpenW] = useState(null);
  const [planning, setPlanning] = useState(false);
  const [pDate, setPDate] = useState(''); const [pGames, setPGames] = useState([]);
  const [mlim, setMlim] = useState(4);
  const [pickI, setPickI] = useState(0);
  const [alim, setAlim] = useState(12);
  const [addDay, setAddDay] = useState(null);
  const ps = useMemo(() => c ? duoPlays(st, c) : [], [st.plays, c]);
  const media = useMemo(() => { const out = []; const by = {}; ps.forEach(p => (by[p.date] = by[p.date] || []).push(p));
    Object.keys(by).sort().reverse().forEach(d => { ((st.photos || {})[d] || []).forEach(m => out.push({ m, d })); by[d].forEach(p => (p.media || []).forEach(m => out.push({ m, d }))); }); return out; }, [ps, st.photos]);
  const days = useMemo(() => c ? coupleDays(c, ps) : { list: [] }, [c, ps]);
  if (!c) return html`<div className="screen"><button className="backbtn" onClick=${back}>${I.back}뒤로</button><${Empty} title="커플 공간이 없어요">끊은 커플이에요.<//></div>`;
  const vs = ps.filter(p => modeOf(p) !== 'coop' && decided(p));
  const a = vs.filter(p => wonBy(p, '나')).length, b = vs.filter(p => wonBy(p, c.partner)).length;
  const co = ps.filter(p => modeOf(p) === 'coop' && p.coop);
  const by = {}; ps.forEach(p => { const x = by[p.gameId] = by[p.gameId] || { n: 0, a: 0, b: 0, last: '' }; x.n++; if (p.date > x.last) x.last = p.date; if (modeOf(p) !== 'coop') { if (wonBy(p, '나')) x.a++; if (wonBy(p, c.partner)) x.b++; } });
  const games = Object.entries(by).sort((x, y) => y[1].n - x[1].n);
  const first = [...ps].sort((x, y) => x.date.localeCompare(y.date))[0];
  const dates = new Set(ps.map(p => p.date)).size;
  const ann = nextAnniv(c, ps);
  const ago = daysAgo(365); const yearAgo = media.filter(x => x.d === ago);
  const months = []; media.forEach(x => { const k = x.d.slice(0, 7); if (!months.length || months[months.length - 1].k !== k) months.push({ k, items: [] }); months[months.length - 1].items.push(x.m); });
  const thisY = today().slice(0, 4);
  const papp = !!st.friends[c.partner];
  const wish = wishOf(c);
  const setWish = (fn, msg) => upCouple(c.id, x => ({ ...x, wish: fn(wishOf(x)) }), msg);
  const wl = wish.filter(w => GAME[w.id]);
  const both = wl.filter(w => w.me && w.them);
  const fresh = wl.filter(w => w.them && !w.seen);
  const star = id => { const w = wish.find(x => x.id === id);
    if (w && w.me) { setWish(l => l.map(x => x.id === id ? { ...x, me: false } : x).filter(x => x.me || x.them), '찜을 풀었어요'); return; }
    setWish(l => w ? l.map(x => x.id === id ? { ...x, me: true, at: today() } : x) : [{ id, me: true, them: false, seen: true, at: today() }, ...l], papp ? `찜했어요. 정식 앱에서는 ${c.partner}님에게 알림이 가요` : '찜했어요'); };
  const starThem = id => setWish(l => l.map(x => x.id === id ? { ...x, them: !x.them, seen: true } : x).filter(x => x.me || x.them));
  const addWish = id => { const w = wish.find(x => x.id === id); if (!w || !w.me) star(id); setAdding(false); };
  const nx = c.next && (!c.next.date || c.next.date >= today()) ? c.next : null;
  const savePlan = () => { upCouple(c.id, x => ({ ...x, next: { date: pDate || null, games: pGames } }), '다음에 같이 할 날을 적어 뒀어요'); setPlanning(false); };
  const startPlan = () => { setPDate(nx ? nx.date || '' : ''); setPGames(nx ? nx.games || [] : both.slice(0, 2).map(w => w.id)); setPlanning(true); setTab('home'); };
  const d30 = daysAgo(30); const recentN = ps.filter(p => p.date >= d30).length, yearN = ps.filter(p => p.date.startsWith(thisY)).length;
  // 오늘 이거 어때요: 둘 다 찜한 게임(없으면 찜한 게임) 중 오래 안 한 것부터
  const pool = (both.length ? both : wl).map(w => w.id).sort((x, y) => String((by[x] || {}).last || '').localeCompare(String((by[y] || {}).last || '')));
  const pick = pool.length ? pool[pickI % pool.length] : null;
  const wrow = w => { const on = openW === w.id; const g = GAME[w.id]; const nw = newIds.includes(w.id);
    return html`<div key=${w.id} className=${'cw' + (on ? ' on' : '')}>
      <div className="cw-top"><button className="cw-g" onClick=${() => open(w.id)}><${Cover} g=${g} size="sm"/><span className="n"><span className="nm">${g.ko}</span><span className="d">${players(g)} · ${playtime(g)}${by[w.id] ? ` · 둘이 ${nf(by[w.id].n)}판` : ''}</span>
          <span className="cw-who">${w.me && w.them ? html`<span className="b both">♥ 둘 다 찜</span>` : html`<span className="b"><span className="bn">${w.me ? ME.name : c.partner}</span> 찜</span>`}${(st.collection[w.id] && (st.collection[w.id].status || 'own') === 'own') ? html`<span className="b">${ME.name}님 보관함</span>` : null}${nw ? html`<span className="b new">새로</span>` : null}</span></span></button>
        <button className=${'cw-heart' + (w.me ? ' on' : '')} aria-pressed=${w.me} aria-label=${w.me ? '찜 풀기' : '나도 찜하기'} onClick=${() => star(w.id)}>${w.me ? '♥' : '♡'}</button>
        <button className="dots" aria-label="더 보기" aria-expanded=${on} onClick=${() => setOpenW(on ? null : w.id)}>⋯</button></div>
      ${on ? html`<div className="cw-menu"><button className="btn sm" onClick=${() => { setPGames([...new Set([...(nx ? nx.games || [] : []), w.id])]); setPDate(nx ? nx.date || '' : ''); setPlanning(true); setTab('home'); setOpenW(null); }}>다음에 할 게임으로</button>
        <button className="btn sm" onClick=${() => { recC(w.id); setOpenW(null); }}>지금 기록하기</button>
        ${!papp ? html`<button className="btn sm ghost" onClick=${() => { starThem(w.id); setOpenW(null); }}>${w.them ? `${c.partner}님 찜 풀기` : `${c.partner}님도 찜으로 표시`}</button>` : null}</div>` : null}
    </div>`; };
  const wt = normName(wq.trim());
  const wlist = [...wl].filter(w => wf === 'all' || (wf === 'both' ? w.me && w.them : wf === 'me' ? w.me : w.them))
    .filter(w => (!wOwn || st.collection[w.id]) && (!wt || normName(GAME[w.id].ko).includes(wt) || normName(GAME[w.id].en || '').includes(wt)))
    .sort((x, y) => ((y.me && y.them) - (x.me && x.them)) || (newIds.includes(y.id) - newIds.includes(x.id)) || String(y.at || '').localeCompare(String(x.at || '')));
  const ph = cPhotoStyle(c);
  const names = html`<span className="nm">${ME.name}</span> <span className="cp-mk">${cMark(c)}</span> <span className="nm">${c.partner}</span>`;
  const annTxt = ann ? (ann[1] ? html`${ann[0]}까지 <b className="num">${nf(ann[1])}</b>일` : html`오늘 <b>${ann[0]}</b>이에요`) : null;
  // 위: 홈은 큰 사진, 다른 탭은 얇은 머리줄
  const head = tab === 'home' && !annOpen ? html`<div className=${'cp-hero' + (ph ? ' ph' : '')}>
      ${ph ? html`<div className="cp-hero-ph"><${CPhoto} c=${c}/></div>` : html`<div className="cp-halves">${[['photo', st.mePhoto, st.me, '내 사진'], ['photoThem', c.partnerPhoto, c.partner, `${c.partner}님 사진`]].map(([k, face, n, lab]) => html`<label key=${k} className="cp-half"><input type="file" accept="image/*" onChange=${async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { try { updCouple(c.id, { [k]: await shrinkImage(f) }); } catch (er) {} } }}/>
          <span className="cp-face">${face ? html`<img src=${face} alt=""/>` : html`<${Avatar} name=${n} size=${64}/>`}</span><span className="cp-addph">${I.plus}${lab}</span></label>`)}</div>`}
      ${ph && !(c.photo && c.photoThem) ? html`<label className="cp-more-ph"><input type="file" accept="image/*" onChange=${async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { try { updCouple(c.id, { [c.photo ? 'photoThem' : 'photo']: await shrinkImage(f) }); } catch (er) {} } }}/>${I.plus}${c.photo ? `${c.partner}님 사진` : '내 사진'}</label>` : null}
      <div className="cp-top"><button className="cp-ib" onClick=${back} aria-label="커플 공간 나가기">${I.back}</button><button className="cp-ib txt" onClick=${() => editCouple(c)}>꾸미기</button></div>
      <div className="cp-hero-t"><div className="cp-names">${c.name ? c.name : names}</div>
        ${c.since ? html`<div className="cp-dday num">${nf(dPlus(c.since))}<span>일째</span></div>` : html`<button className="cp-noday" onClick=${() => editCouple(c)}>사귄 날을 넣으면 함께한 날을 세어 줘요 ›</button>`}
        ${annTxt ? html`<button className="cp-ann" onClick=${() => setAnnOpen(true)}><span>${annTxt}</span><span className="go">›</span></button>` : !c.since && ps.length ? html`<button className="cp-ann" onClick=${() => setAnnOpen(true)}>기념일 보기<span className="go">›</span></button>` : null}</div>
    </div>` : html`<div className="cp-bar"><button className="cp-ib plain" onClick=${annOpen ? () => setAnnOpen(false) : back} aria-label=${annOpen ? '뒤로' : '커플 공간 나가기'}>${I.back}</button>
      <span className="cp-bar-t">${annOpen ? html`<b>기념일</b>` : html`<span className="cp-bar-ph">${ph ? html`<${CPhoto} c=${c}/>` : html`<${Avatar} name=${c.partner} size=${28}/>`}</span><b className="cp-bar-n">${c.name || html`<span className="cp-mk">${cMark(c)}</span> ${c.partner}`}</b>${c.since ? html`<span className="num cp-bar-d">${nf(dPlus(c.since))}일째</span>` : null}`}</span>
      ${annOpen ? html`<span className="cp-ib plain"></span>` : html`<button className="cp-ib plain" onClick=${() => editCouple(c)} aria-label="꾸미기·설정">${I.gear}</button>`}</div>`;

  const homeTab = html`
      ${planning ? html`<div className="cnext edit"><div className="lb">다음에 같이 할 날</div>
          <input className="input" type="date" min=${today()} value=${pDate} onChange=${e => setPDate(e.target.value)}/>
          <div className="lb" style=${{ marginTop: 10 }}>할 게임<span className="hint"> · 찜한 게임에서 골라요</span></div>
          <div className="dates">${[...new Set([...both, ...wl])].filter((w, i) => pGames.includes(w.id) || i < 12).map(w => html`<button key=${w.id} className="pill sm" aria-pressed=${pGames.includes(w.id)} onClick=${() => setPGames(pGames.includes(w.id) ? pGames.filter(x => x !== w.id) : [...pGames, w.id])}>${GAME[w.id].ko}</button>`)}
            ${!wl.length ? html`<span className="hint">아직 찜한 게임이 없어요. 날짜만 적어도 돼요.</span>` : null}</div>
          <div className="r"><button className="btn primary cpbtn" disabled=${!pDate && !pGames.length} onClick=${savePlan}>적어 두기</button><button className="btn" onClick=${() => setPlanning(false)}>취소</button>
            ${nx ? html`<button className="linkbtn muted" onClick=${() => { upCouple(c.id, x => ({ ...x, next: null }), '지웠어요'); setPlanning(false); }}>지우기</button>` : null}</div></div>` :
        nx ? html`<div className="cp-card cp-next"><span className="cp-k">다음 보드게임 데이트</span><b className="cp-nt">${nx.date ? evDay(nx.date) : '날짜는 아직'}</b><span className="cp-ng">${[nx.date ? fmtDot(nx.date) : null, ...(nx.games || []).filter(id => GAME[id]).map(id => GAME[id].ko)].filter(Boolean).join(' · ')}</span>
          <span className="cp-r">${nx.date && nx.date <= today() ? html`<button className="btn sm primary cpbtn" onClick=${() => recC(nx.games && nx.games[0] || null)}>오늘 한 거 기록하기</button>` : null}<button className="btn sm" onClick=${startPlan}>바꾸기</button></span></div>` :
        html`<button className="cp-row" onClick=${startPlan}><span className="cp-ri">${C_IC.log}</span><span className="cp-rt"><b>다음 보드게임 데이트 정하기</b><span>날짜와 할 게임을 적어 두면 여기 보여요</span></span><span className="go">›</span></button>`}
      ${fresh.length ? html`<button className="cp-row new" onClick=${() => setTab('wish')}><${Avatar} name=${c.partner} size=${32}/><span className="cp-rt"><b>${c.partner}님이 새로 찜했어요</b><span>${fresh.slice(0, 2).map(w => GAME[w.id].ko).join(', ')}${fresh.length > 2 ? ` 외 ${nf(fresh.length - 2)}개` : ''}</span></span><span className="go">›</span></button>` : null}
      ${pick ? html`<div className="cp-card cp-pick"><div className="cp-k">오늘 이거 어때요?${pool.length > 1 ? html`<button className="linkbtn" onClick=${() => setPickI(pickI + 1)}>다른 거</button>` : null}</div>
          <button className="cp-pg" onClick=${() => open(pick)}><${Cover} g=${GAME[pick]}/><span className="cp-pgt"><b>${GAME[pick].ko}</b><span>${[both.some(w => w.id === pick) ? '둘 다 찜' : `${wish.find(w => w.id === pick).me ? ME.name : c.partner}님이 찜`, by[pick] ? `마지막 ${relDay(by[pick].last)}` : '둘이 아직 안 해 봤어요'].join(' · ')}</span></span></button>
          <div className="cp-r"><button className="btn sm primary cpbtn" onClick=${() => recC(pick)}>이걸로 기록하기</button>${NAV.what ? html`<button className="btn sm" onClick=${() => NAV.what([c.partner])}>조건으로 고르기</button>` : null}</div></div>` :
        html`<button className="cp-row" onClick=${() => { setTab('wish'); setAdding(true); }}><span className="cp-ri">${C_IC.wish}</span><span className="cp-rt"><b>같이 하고 싶은 게임 찜하기</b><span>둘 다 찜한 게임을 여기서 골라 줘요</span></span><span className="go">›</span></button>`}
      ${(() => { const t = today(); const hit = [1, 2, 3, 4, 5].map(y => [y, `${+t.slice(0, 4) - y}${t.slice(4)}`]).map(([y, d]) => [y, d, ps.filter(p => p.date === d)]).find(x => x[2].length);
        if (!hit) return null; const [y, d, dps] = hit; const gn = [...new Set(dps.map(p => GAME[p.gameId] ? GAME[p.gameId].ko : ''))].filter(Boolean); const m = media.find(x => x.d === d);
        return html`<button className="cp-memo" onClick=${() => NAV.day && NAV.day(d)}>${m ? html`<span className="cp-memo-ph"><${MediaView} items=${[m.m]} small/></span>` : null}<span className="cp-rt"><span className="cp-k">${nf(y)}년 전 오늘</span><b>둘이 ${gn.slice(0, 2).join(', ')}${gn.length > 2 ? ` 외 ${nf(gn.length - 2)}개` : ''} 했어요</b></span><span className="go">›</span></button>`; })()}
      ${ps.length ? html`<h2 className="sec">최근에 둘이 한 게임<button className="more" onClick=${() => setTab('log')}>전체 ›</button></h2>` : null}
      ${ps.length ? (() => { const gs = []; [...ps].sort((x, y) => y.date.localeCompare(x.date) || (y.at || 0) - (x.at || 0)).forEach(p => { const g = gs.find(x => x.date === p.date && x.gameId === p.gameId); if (g) g.ps.push(p); else gs.push({ date: p.date, gameId: p.gameId, ps: [p] }); });
        return gs.slice(0, 3).map(g => { const p = g.ps[0]; const n = g.ps.length; const dec = g.ps.filter(x => modeOf(x) !== 'coop' && decided(x)); const a = dec.filter(x => wonBy(x, '나')).length, b = dec.filter(x => wonBy(x, c.partner)).length;
          return html`<button key=${g.date + g.gameId} className="crecent" onClick=${() => NAV.day && NAV.day(g.date)}><span className="dt">${relDay(g.date)}</span><span className="g">${GAME[p.gameId] ? GAME[p.gameId].ko : ''}${n > 1 ? html` <span className="num cn">${nf(n)}판</span>` : null}</span><span className="r">${n === 1 ? joinBits(roundSummary({ ...p, memo: '', scores: {} }, false)) : dec.length ? html`${a !== b ? html`<span className="crown">${a > b ? ME.name : c.partner} ${nf(Math.max(a, b))}승</span>` : `${ME.name} ${nf(a)} : ${nf(b)} ${c.partner}`}` : null}</span></button>`; }); })() :
        html`<div className="cfirst"><b>둘이 한 첫 게임을 남겨 볼까요?</b><span>${c.partner}님이 들어간 채로 열려요. 둘이 한 판은 여기 모여요.</span><button className="btn primary cpbtn" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button></div>`}
      ${media.length ? html`<h2 className="sec">추억<button className="more" onClick=${() => { setTab('log'); setLogv('mem'); }}>전체 ›</button></h2><div className="cmem">${media.slice(0, 4).map((x, i) => html`<button key=${i} className="cmem-b" onClick=${() => NAV.day && NAV.day(x.d)} aria-label=${`${dLabel(x.d)} 기록 보기`}><${MediaView} items=${[x.m]} small/><span className="cmem-d">${dLabel(x.d)}</span></button>`)}</div>` : null}`;

  const annView = (() => { const t = today(); const up = days.list.filter(x => x.date >= t && x.k !== 'since').sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
    const past = days.list.filter(x => x.date < t || x.k === 'since').sort((a, b) => b.date.localeCompare(a.date));
    const row = x => { const n = dTo(x.date); return html`<div key=${x.k} className=${'cp-day ' + x.kind + (n === 0 ? ' td' : '')}><span className="cp-day-i">${x.kind === 'game' ? I.dice : x.kind === 'mine' ? '★' : cMark(c)}</span>
      <span className="cp-rt"><b>${x.label}</b><span>${fmtDot(x.date)}${x.sub ? ` · ${x.sub}` : ''}</span></span><span className="cp-dn num">${n === 0 ? '오늘' : n > 0 ? `D-${nf(n)}` : ''}</span>
      ${x.kind === 'mine' ? html`<button className="dots" aria-label="지우기" onClick=${() => upCouple(c.id, y => ({ ...y, days: (y.days || []).filter(d => d.id !== x.id) }), '기념일을 지웠어요')}>⋯</button>` : null}</div>`; };
    return html`<div className="cp-annv">
      ${!c.since ? html`<button className="cp-row" onClick=${() => editCouple(c)}><span className="cp-ri">${cMark(c)}</span><span className="cp-rt"><b>사귄 날 넣기</b><span>100일·200일·주년을 알아서 세어 줘요</span></span><span className="go">›</span></button>` : null}
      <h2 className="sec">다가오는 날</h2>
      ${up.map(row)}
      ${days.nextMile ? html`<div className="cp-day game soon"><span className="cp-day-i">${I.dice}</span><span className="cp-rt"><b>둘이 ${nf(days.nextMile.n)}판째</b><span>앞으로 ${nf(days.nextMile.left)}판 더 하면 돼요</span></span><span className="cp-dn"></span></div>` : null}
      ${addDay ? html`<form className="cp-addday" onSubmit=${e => { e.preventDefault(); if (!addDay.name.trim() || !addDay.date) return; upCouple(c.id, y => ({ ...y, days: [...(y.days || []), { id: uid(), name: addDay.name.trim(), date: addDay.date, yearly: addDay.yearly }] }), '기념일을 넣었어요'); setAddDay(null); }}>
          <input className="input" placeholder="이름 (예: 지민 생일, 첫 여행)" maxLength="16" value=${addDay.name} onInput=${e => setAddDay({ ...addDay, name: e.target.value })} autoFocus/>
          <input className="input" type="date" value=${addDay.date} onChange=${e => setAddDay({ ...addDay, date: e.target.value })}/>
          <label className="cp-chk"><input type="checkbox" checked=${addDay.yearly} onChange=${e => setAddDay({ ...addDay, yearly: e.target.checked })}/>매년 챙기기</label>
          <div className="cp-r"><button className="btn primary cpbtn" disabled=${!addDay.name.trim() || !addDay.date}>넣기</button><button type="button" className="btn" onClick=${() => setAddDay(null)}>취소</button></div></form>` :
        html`<button className="btn block" style=${{ marginTop: 10 }} onClick=${() => setAddDay({ name: '', date: '', yearly: true })}>${I.plus}기념일 직접 넣기</button>`}
      <h2 className="sec">지나온 날</h2>
      ${past.slice(0, alim).map(row)}
      ${past.length > alim ? html`<${MoreBtn} left=${past.length - alim} unit="개" onClick=${() => setAlim(alim + 30)}/>` : null}
    </div>`; })();

  const best = games.map(([id]) => { let m = null; ps.filter(p => p.gameId === +id).forEach(p => Object.entries(p.scores || {}).forEach(([n, v]) => { const x = +v; if (v !== '' && !isNaN(x) && (!m || x > m.v)) m = { v: x, n, date: p.date }; })); return m ? [id, m] : null; }).filter(Boolean).slice(0, 5);

  return html`<div className="screen couple cpspace" style=${{ '--cc': coupleColor(c) }}>
    ${head}
    ${annOpen ? annView : null}
    ${!annOpen && tab === 'home' ? homeTab : null}

    ${!annOpen && tab === 'wish' ? html`
      <h1 className="cp-h1">같이 할 게임</h1>
      ${(() => { const tp = theirPicks(c, papp); if (!tp) return null;
        const items = [...tp.buy.map(id => [id, 'buy']), ...tp.fav.filter(id => !tp.buy.includes(id)).map(id => [id, 'fav'])].filter(([id]) => GAME[id]);
        if (!items.length) return null; const gifts = c.gifts || [];
        return html`<section className="tp"><h2 className="sec">${c.partner}님이 요즘 관심 있는 게임</h2>
          <div className="note" style=${{ marginTop: -4 }}>${c.partner}님 보관함의 즐겨찾기와 사고 싶은 게임이에요.</div>
          <div className="tp-row">${items.slice(0, 12).map(([id, k]) => { const g = GAME[id]; const mine = wish.find(w => w.id === id && w.me); const gift = gifts.includes(id); const own = !!st.collection[id];
            return html`<div key=${id} className="tp-c"><button className="tp-art" onClick=${() => open(id)} aria-label=${g.ko}><${Cover} g=${g}/>${k === 'buy' ? html`<span className="tp-tag">사고 싶어 해요</span>` : null}</button>
              <span className="tp-n">${g.ko}</span>
              <span className="tp-act"><button className=${'pill sm' + (mine ? ' on' : '')} aria-pressed=${!!mine} onClick=${() => mine ? null : star(id)}>${mine ? '♥ 같이 하자고 함' : '같이 하자'}</button>
                ${k === 'buy' && !own ? html`<button className="pill sm" aria-pressed=${gift} onClick=${() => upCouple(c.id, x => ({ ...x, gifts: gift ? (x.gifts || []).filter(i => i !== id) : [...(x.gifts || []), id] }), gift ? '선물 후보에서 뺐어요' : `선물 후보에 담았어요. ${c.partner}님에게는 안 보여요`)}>${gift ? '선물 후보' : '선물'}</button>` : null}</span></div>`; })}</div></section>`; })()}
      ${adding ? html`<div className="cwadd"><${GamePicker} onPick=${id => addWish(id)} favs=${st.favs} np=${2} onCustom=${() => {}}/><button className="btn block" style=${{ marginTop: 8 }} onClick=${() => setAdding(false)}>닫기</button></div>` :
        html`<button className="btn block primary cpbtn" onClick=${() => setAdding(true)}>${I.plus}같이 할 게임 찜하기</button>`}
      ${wl.length ? html`<div className="cp-chips" role="tablist">${[['all', '전체', wl.length], ['both', '둘 다', both.length], ['me', ME.name, wl.filter(w => w.me).length], ['them', c.partner, wl.filter(w => w.them).length]].map(([k, l, n]) => html`<button key=${k} role="tab" className="pill sm" aria-pressed=${wf === k} onClick=${() => setWf(k)}><span className="fl">${l}</span> <span className="num">${nf(n)}</span></button>`)}</div>
        ${wl.length > 12 ? html`<div className="cw-find"><div className="search">${I.games}<input type="search" placeholder="찜한 게임 찾기" value=${wq} onInput=${e => { setWq(e.target.value); setWlim(50); }}/></div><button className="pill sm" aria-pressed=${wOwn} onClick=${() => { setWOwn(!wOwn); setWlim(50); }}>보관함에 있는 것</button></div>` : null}
        ${wlist.slice(0, wlim).map(wrow)}
        ${wlist.length > wlim ? html`<${MoreBtn} left=${wlist.length - wlim} unit="개" onClick=${() => setWlim(wlim + 50)}/>` : null}
        ${!wlist.length ? html`<div className="note">${wt ? `'${wq.trim()}' 찜한 게임이 없어요.` : wOwn ? '보관함에 있는 찜한 게임이 없어요.' : wf === 'both' ? '아직 둘 다 찜한 게임이 없어요.' : wf === 'me' ? `${ME.name}님이 찜한 게임이 없어요.` : `${c.partner}님이 찜한 게임이 없어요.`}</div>` : null}` :
        html`<${Empty} title="아직 찜한 게임이 없어요">같이 하고 싶은 게임을 찜하면 ${c.partner}님도 볼 수 있어요. 둘 다 찜한 게임은 맨 위에 와요.<//>`}
      ${wl.length && !papp ? html`<div className="note">${c.partner}님은 앱을 안 써서, ⋯에서 대신 찜을 표시할 수 있어요.</div>` : null}
      ${wish.some(w => w.sample) ? html`<div className="note">처음 둘러보기용 예시 목록이에요. 예시 데이터를 지우면 같이 지워져요.</div>` : null}
    ` : null}

    ${!annOpen && tab === 'log' ? html`<h1 className="cp-h1">둘이 한 기록</h1><div className="seg tabs ltabs" role="tablist">${[['log', '기록'], ['mem', '사진']].map(([k, l]) => html`<button key=${k} role="tab" aria-pressed=${logv === k} onClick=${() => setLogv(k)}>${l}</button>`)}</div>` : null}
    ${!annOpen && tab === 'log' && logv === 'mem' ? html`
      ${yearAgo.length ? html`<div className="yago"><${MediaView} items=${yearAgo.map(x => x.m).slice(0, 1)} label="1년 전 오늘"/><div className="ya-t"><b>1년 전 오늘</b><span>${(() => { const p = ps.find(x => x.date === ago); return p && GAME[p.gameId] ? GAME[p.gameId].ko + (p.memo ? ` · ${p.memo}` : '') : ''; })()}</span></div>${NAV.share ? html`<button className="ya-share" onClick=${() => NAV.share(ago)}>공유하기</button>` : null}</div>` : null}
      ${months.length ? html`${months.slice(0, mlim).map(m => html`<section key=${m.k}><div className="mhd">${m.k.slice(0, 4) === thisY ? '' : m.k.slice(0, 4) + '년 '}${+m.k.slice(5)}월 <span className="muted num">${nf(m.items.length)}</span></div><${MediaView} grid items=${m.items} label=${`${+m.k.slice(5)}월 사진`}/></section>`)}
        ${months.length > mlim ? html`<${MoreBtn} left=${months.length - mlim} unit="달" onClick=${() => setMlim(mlim + 6)}/>` : null}` :
        html`<${Empty} title="아직 사진이 없어요">둘이 기록할 때 사진을 넣으면 여기에 쌓여요.<//>`}` : null}
    ${!annOpen && tab === 'log' && logv === 'log' ? html`<${DayList} inGroupView plays=${ps} st=${st} open=${open} editDay=${editDay} removeFromId=${removeFromId} shareDay=${shareDay} variant="couple" empty=${html`<${Empty} title="아직 둘이 한 판이 없어요" action=${html`<button className="btn primary cpbtn" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button>`}>기록할 때 ${c.partner}님만 넣으면 여기에 모여요.<//>`}/>
      <div className="note">${c.partner}님하고 둘이서만 한 판이 모여요. 여럿이 한 판은 모임이나 친구 전적에서 보여요.</div>` : null}

    ${!annOpen && tab === 'stat' ? html`<h1 className="cp-h1">통계</h1>` : null}
    ${!annOpen && tab === 'stat' && !ps.length ? html`<${Empty} title="둘이 한 판이 쌓이면 여기 보여요" action=${html`<button className="btn primary cpbtn" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button>`}>자주 한 게임, 같이 논 날이 모여요.<//>` : null}
    ${!annOpen && tab === 'stat' && ps.length ? html`
      <div className="cstat4"><div><b className="num">${nf(ps.length)}</b><span>함께한 판</span></div><div><b className="num">${nf(games.length)}</b><span>해 본 게임</span></div><div><b className="num">${nf(dates)}</b><span>같이 논 날</span></div><div><b className="num">${nf(recentN)}</b><span>최근 30일</span></div></div>
      <div className="cmeta">
        ${games.length && GAME[games[0][0]] ? html`<span>가장 많이 한 게임 <b>${GAME[games[0][0]].ko}</b> ${nf(games[0][1].n)}판</span>` : null}
        <span>올해 <b>${nf(yearN)}판</b></span>
        ${first ? html`<span>첫 판 <b>${relDay(first.date)}</b> ${GAME[first.gameId] ? GAME[first.gameId].ko : ''}</span>` : null}
        ${co.length ? html`<span>협력 게임 <b>${nf(co.filter(p => p.coop === 'win').length)}승 ${nf(co.filter(p => p.coop !== 'win').length)}패</b></span>` : null}</div>
      ${vs.length ? html`<h2 className="sec">둘의 승부</h2><div className="cscore"><div><${Avatar} name=${st.me} size=${30}/><b className="num">${nf(a)}</b></div><span className="vs">승패가 갈린 ${nf(vs.length)}판</span><div><b className="num">${nf(b)}</b><${Avatar} name=${c.partner} size=${30}/></div></div>
      <div className="cbar"><i style=${{ width: `${a / Math.max(1, a + b) * 100}%` }}></i></div>` : null}
      ${best.length ? html`<h2 className="sec">둘의 최고 점수</h2>${best.map(([id, m]) => html`<button key=${id} className="cgame" onClick=${() => open(+id)}><${Cover} g=${GAME[id]} size="sm"/><span className="n">${GAME[id].ko}<span className="d">${m.n === '나' ? ME.name : m.n} · ${relDay(m.date)}</span></span><span className="v num">${nf(m.v)}점</span></button>`)}` : null}
      ${games.length ? html`<h2 className="sec">게임별</h2>${games.slice(0, cglim).map(([id, x]) => html`<button key=${id} className="cgame" onClick=${() => open(+id)}><${Cover} g=${GAME[id]} size="sm"/>
        <span className="n">${GAME[id].ko}<span className="d">${nf(x.n)}판</span></span>${COOP.has(+id) ? html`<span className="v">협력</span>` : html`<span className="v num"><span className=${x.a > x.b ? 'w' : ''}>${nf(x.a)}</span> : <span className=${x.b > x.a ? 'w' : ''}>${nf(x.b)}</span></span>`}</button>`)}${games.length > cglim ? html`<${MoreBtn} left=${games.length - cglim} unit="개" onClick=${() => setCglim(cglim + 30)}/>` : null}` : null}` : null}

    <nav className="tabbar cpnav" aria-label="커플 공간 메뉴">${C_TABS.map(([k, l]) => k === 'rec' ? html`<button key=${k} className="cp-rec" onClick=${() => recC(null)} aria-label=${`${c.partner}님과 한 게임 기록하기`}><span className="rc">${I.plus}</span></button>` :
      html`<button key=${k} aria-current=${tab === k && !annOpen ? 'page' : undefined} onClick=${() => setTab(k)}>${k === 'home' ? I.home : C_IC[k]}<span>${l}</span></button>`)}</nav>
  </div>`;
}
