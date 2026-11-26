/* ---------- 커플 ---------- */
const COUPLE_COLORS = [['rose', '#d9667a'], ['coral', '#e0835a'], ['plum', '#8a5a9e'], ['sky', '#4f86b8']];
const coupleColor = c => (COUPLE_COLORS.find(x => x[0] === c.color) || COUPLE_COLORS[0])[1];
const dPlus = since => Math.round((parse(today()) - parse(since)) / 86400000) + 1;
const duoPlays = (st, c) => st.plays.filter(p => p.people.length === 1 && p.people[0] === c.partner);
function nextAnniv(since) {
  const d = dPlus(since); const next = Math.ceil((d + 1) / 100) * 100;
  const s = parse(since); const yrs = parse(today()).getFullYear() - s.getFullYear();
  let ann = new Date(s); ann.setFullYear(s.getFullYear() + yrs); if (ann < parse(today())) ann.setFullYear(ann.getFullYear() + 1);
  const annDays = Math.round((ann - parse(today())) / 86400000);
  const hundredDays = next - d;
  return hundredDays <= annDays ? [`${next}일`, hundredDays] : [`${ann.getFullYear() - s.getFullYear()}주년`, annDays];
}
function CoupleCard({ c, st, onOpen }) {
  const ps = duoPlays(st, c); const vs = ps.filter(p => modeOf(p) !== 'coop' && decided(p));
  return html`<button className="ccard" style=${{ '--cc': coupleColor(c) }} onClick=${onOpen}>
    <div className="cpair"><${Avatar} name=${st.me} size=${26}/><span className="heart">♥</span><${Avatar} name=${c.partner} size=${26}/></div>
    <div className="gn">${c.name || `${ME.name} ♥ ${c.partner}`}</div>
    <div className="gm">${c.since ? `D+${dPlus(c.since)} · ` : ''}${ps.length ? `둘이 ${nf(ps.length)}판` : '아직 둘이 한 기록 없음'}</div>
    ${(() => { const nx = c.next && (!c.next.date || c.next.date >= today()) ? c.next : null; const both = wishOf(c).filter(w => GAME[w.id] && w.me && w.them).length; const nw = wishNew(c).length;
      return nx ? html`<div className="gm2">다음에 같이 할 날 ${nx.date ? evDay(nx.date) : '날짜 미정'}</div>` : nw ? html`<div className="gm2">${c.partner}님이 새로 찜한 게임 ${nf(nw)}개</div>` : both ? html`<div className="gm2">둘 다 찜한 게임 ${nf(both)}개</div>` : ps.length ? html`<div className="gm2">마지막 ${relDay(ps.map(p => p.date).sort().pop())}</div>` : null; })()}
  </button>`;
}
function CoupleSheet({ st, c, close, onSave, onDelete }) {
  const [partner, setPartner] = useState(c ? c.partner : '');
  const [since, setSince] = useState(c ? c.since || '' : '');
  const [name, setName] = useState(c ? c.name || '' : '');
  const [color, setColor] = useState(c ? c.color || 'rose' : 'rose');
  const [photo, setPhoto] = useState(c ? c.photo || null : null);
  const [photoThem, setPhotoThem] = useState(c ? c.photoThem || null : null);
  const [pphoto, setPphoto] = useState(c ? c.partnerPhoto || null : null);
  const [ask, setAsk] = useState(false);
  const [typed, setTyped] = useState(''); const [need, setNeed] = useState(false);
  const cands = [...new Set([...Object.keys(st.friends), ...st.people])].filter(n => !(st.blocked || {})[n] && (!(st.couples || []).some(x => x.partner === n) || (c && c.partner === n)));
  return html`<${Sheet} title=${c ? '커플 설정' : '커플 만들기'} close=${close}>
    <div className="cprev" style=${{ '--cc': coupleColor({ color }), ...(photo || photoThem ? { backgroundImage: `linear-gradient(rgba(0,0,0,.1), rgba(0,0,0,.45)), url(${photo || photoThem})${photo && photoThem ? `, url(${photoThem})` : ''}`, backgroundSize: photo && photoThem ? 'cover, 50% 100%, 50% 100%' : 'cover', backgroundPosition: photo && photoThem ? 'center, left, right' : 'center', backgroundRepeat: 'no-repeat', color: '#fff' } : {}) }}><${Avatar} name=${st.me} size=${44}/><span className="heart">♥</span>${partner ? html`<${Avatar} name=${partner} size=${44}/>` : html`<span className="avatar ghost" style=${{ width: 44, height: 44 }}>?</span>`}
      <div className="t">${name || (partner ? `${ME.name} ♥ ${partner}` : '누구랑?')}</div>${since ? html`<div className="d">${dLabel(since)}부터 · D+${dPlus(since)}</div>` : null}</div>
    ${c ? null : html`<div className="field"><span className="lb">누구랑?</span>
      <input className=${'input' + (need && !partner ? ' bad' : '')} placeholder="상대 닉네임이나 이름" maxLength="12" value=${typed} onInput=${e => { const v = e.target.value; setTyped(v); setNeed(false); setPartner(v.trim()); }}/>
      ${cands.length ? html`<div className="dates" style=${{ marginTop: 8 }}>${cands.slice(0, 12).map(n => html`<button key=${n} className="pill sm" aria-pressed=${partner === n} onClick=${() => { setPartner(n); setTyped(n); setNeed(false); }}>${n}</button>`)}</div>` : null}
      ${need && !partner ? html`<div className="cmk-err">누구랑인지 이름을 적어 주세요</div>` : null}
      <div className="note">지금은 미리보기라 이 기기에서만 커플 공간을 써요. 정식 버전에서는 앱을 쓰는 상대에게 요청이 가고, 수락하면 둘 다 같은 공간을 봐요. 앱을 안 쓰는 상대도 이름만으로 만들 수 있어요.</div></div>`}
    <div className="field"><span className="lb">사귄 날<span className="hint">선택 · 이날을 1일로 100일·주년을 세요</span></span>
      <input className="input" type="date" max=${today()} value=${since} onChange=${e => setSince(e.target.value)}/></div>
    <div className="field"><span className="lb">둘만 부르는 이름<span className="hint">선택</span></span>
      <input className="input" placeholder=${partner ? `예: ${ME.name} ♥ ${partner}, 우리 집 보드게임` : '예: 우리 집 보드게임'} maxLength="16" value=${name} onInput=${e => setName(e.target.value)}/></div>
    ${partner ? html`<div className="field"><span className="lb">커플 사진<span className="hint">선택 · 각자 한 장씩 넣으면 반반 합쳐져요</span></span>
      <div className="cph2">${[[photo, setPhoto, '내 사진'], [photoThem, setPhotoThem, `${partner}님 사진`]].map(([v, set, lab], i) => html`<div key=${i} className="cph-slot">
        <label className="cph-box">${v ? html`<img src=${v} alt=${lab}/>` : html`<span>${I.plus}</span>`}<input type="file" accept="image/*" onChange=${async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { try { set(await shrinkImage(f)); } catch (er) {} } }}/></label>
        <span className="cph-l">${lab}</span>${v ? html`<button className="linkbtn muted" onClick=${() => set(null)}>지우기</button>` : null}</div>`)}</div>
      ${st.friends[partner] ? html`<div className="hint">정식 앱에서는 ${partner}님이 직접 자기 사진을 넣어요. 지금은 미리보기라 여기서 넣어 볼 수 있어요.</div>` : null}</div>` : null}
    ${partner ? html`<div className="field"><span className="lb">얼굴 사진<span className="hint">선택 · 커플 화면에서 캐릭터 대신 나와요</span></span>
      <div className="dates faces"><span className="facef">${st.mePhoto ? html`<img src=${st.mePhoto} alt=""/>` : html`<${Avatar} name=${st.me} size=${56}/>`}<span>${st.me}</span><span className="hint">${st.mePhoto ? '' : '닉네임 탭에서 넣어요'}</span></span>
        <label className="facef">${pphoto ? html`<img src=${pphoto} alt=""/>` : html`<${Avatar} name=${partner} size=${56}/>`}<span>${partner}</span><span className="linkbtn">${pphoto ? '바꾸기' : '+ 사진'}</span><input type="file" accept="image/*" onChange=${async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { try { setPphoto(await shrinkImage(f)); } catch (er) {} } }}/></label></div></div>` : null}
    <div className="field"><span className="lb">색</span>
      <div className="dates">${COUPLE_COLORS.map(([k, v]) => html`<button key=${k} className="swatch" aria-pressed=${color === k} aria-label=${k} style=${{ background: v }} onClick=${() => setColor(k)}></button>`)}</div></div>
    <div className="sheet-foot"><button className="btn primary" onClick=${() => !partner ? setNeed(true) : onSave({ ...(c || {}), id: c ? c.id : 'c' + uid(), partner, since: since || null, name: name.trim(), color, photo, photoThem, partnerPhoto: pphoto })}>${c ? '저장' : '만들기'}</button>
</div>
    ${c ? html`<div className="cunlink"><button className="linkbtn muted" onClick=${() => setAsk(true)}>커플 끊기</button></div>` : null}
    ${ask ? html`<div className="confirm"><span>커플을 끊을까요? 둘이 한 기록은 ${ME.name} 기록장에 그대로 남아요. 같이 할 게임 찜, 다음에 같이 할 날, 커플 사진은 지워져요.</span><div className="r"><button className="btn danger" onClick=${() => onDelete(c.id)}>끊기</button><button className="btn" onClick=${() => setAsk(false)}>취소</button></div></div>` : null}
  <//>`;
}
/* ---------- v27: 모임 약속·대화·소개, 커플 추억, 사고 싶은, 선반 이미지 ---------- */
// 예시 사진: 실제 사진 대신 색 면 위에 말·박스 모양

function CoupleScreen({ cid, st, back, open, editDay, removeFromId, shareDay, editCouple, updCouple, upCouple, startPlay }) {
  const recC = id => startPlay(id, false, { people: ['나', (st.couples || []).find(x => x.id === cid).partner], grp: null });
  const c = (st.couples || []).find(x => x.id === cid);
  const [cglim, setCglim] = useState(8);
  const [tab, setTab] = useState(() => { const t = NAV.cTab || 'home'; NAV.cTab = null; return t; });
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
  const ps = useMemo(() => c ? duoPlays(st, c) : [], [st.plays, c]);
  const media = useMemo(() => { const out = []; const by = {}; ps.forEach(p => (by[p.date] = by[p.date] || []).push(p));
    Object.keys(by).sort().reverse().forEach(d => { ((st.photos || {})[d] || []).forEach(m => out.push({ m, d })); by[d].forEach(p => (p.media || []).forEach(m => out.push({ m, d }))); }); return out; }, [ps, st.photos]);
  if (!c) return html`<div className="screen"><button className="back" onClick=${back}>${I.left}뒤로</button><${Empty} title="커플이 없어요">끊은 커플이에요.<//></div>`;
  const vs = ps.filter(p => modeOf(p) !== 'coop' && decided(p));
  const a = vs.filter(p => wonBy(p, '나')).length, b = vs.filter(p => wonBy(p, c.partner)).length;
  const co = ps.filter(p => modeOf(p) === 'coop' && p.coop);
  const by = {}; ps.forEach(p => { const x = by[p.gameId] = by[p.gameId] || { n: 0, a: 0, b: 0 }; x.n++; if (modeOf(p) !== 'coop') { if (wonBy(p, '나')) x.a++; if (wonBy(p, c.partner)) x.b++; } });
  const games = Object.entries(by).sort((x, y) => y[1].n - x[1].n);
  const first = [...ps].sort((x, y) => x.date.localeCompare(y.date))[0];
  const dates = new Set(ps.map(p => p.date)).size;
  const ann = c.since ? nextAnniv(c.since) : null;
  const month = today().slice(0, 7); const mp = vs.filter(p => p.date.startsWith(month));
  const ma = mp.filter(p => wonBy(p, '나')).length, mb = mp.filter(p => wonBy(p, c.partner)).length;
  const ago = daysAgo(365); const yearAgo = media.filter(x => x.d === ago);
  const months = []; media.forEach(x => { const k = x.d.slice(0, 7); if (!months.length || months[months.length - 1].k !== k) months.push({ k, items: [] }); months[months.length - 1].items.push(x.m); });
  const thisY = today().slice(0, 4);
  const papp = !!st.friends[c.partner];
  const wish = wishOf(c);
  const setWish = (fn, msg) => upCouple(c.id, x => ({ ...x, wish: fn(wishOf(x)) }), msg);
  const wl = wish.filter(w => GAME[w.id]);
  const both = wl.filter(w => w.me && w.them);
  const kinds = { both };
  const fresh = wl.filter(w => w.them && !w.seen);
  const star = id => { const w = wish.find(x => x.id === id);
    if (w && w.me) { setWish(l => l.map(x => x.id === id ? { ...x, me: false } : x).filter(x => x.me || x.them), '찜을 풀었어요'); return; }
    setWish(l => w ? l.map(x => x.id === id ? { ...x, me: true, at: today() } : x) : [{ id, me: true, them: false, seen: true, at: today() }, ...l], papp ? `찜했어요. 정식 앱에서는 ${c.partner}님에게 알림이 가요` : '찜했어요'); };
  const starThem = id => setWish(l => l.map(x => x.id === id ? { ...x, them: !x.them, seen: true } : x).filter(x => x.me || x.them));
  const addWish = id => { const w = wish.find(x => x.id === id); if (!w || !w.me) star(id); setAdding(false); };
  const nx = c.next && (!c.next.date || c.next.date >= today()) ? c.next : null;
  const savePlan = () => { upCouple(c.id, x => ({ ...x, next: { date: pDate || null, games: pGames } }), '다음에 같이 할 날을 적어 뒀어요'); setPlanning(false); };
  const startPlan = () => { setPDate(nx ? nx.date || '' : ''); setPGames(nx ? nx.games || [] : kinds.both.slice(0, 2).map(w => w.id)); setPlanning(true); setTab('home'); };
  const d30 = daysAgo(30); const recentN = ps.filter(p => p.date >= d30).length, yearN = ps.filter(p => p.date.startsWith(thisY)).length;
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
  return html`<div className="screen couple" style=${{ '--cc': coupleColor(c) }}>
    <div className=${'chero2' + (c.photo || c.photoThem ? ' ph' : '')}>
      <div className="ch-halves">${[['photo', c.photo, st.mePhoto, st.me, '내 사진'], ['photoThem', c.photoThem, c.partnerPhoto, c.partner, `${c.partner}님 사진`]].map(([k, src, face, n, lab]) => src ? html`<div key=${k} className="ch-half"><img src=${src} alt=${lab}/></div>` :
        html`<label key=${k} className="ch-half empty"><input type="file" accept="image/*" onChange=${async e => { const f = e.target.files[0]; e.target.value = ''; if (f) { try { updCouple(c.id, { [k]: await shrinkImage(f) }); } catch (er) {} } }}/>
          <span className="ch-slot">${face ? html`<img src=${face} alt=""/>` : html`<${Avatar} name=${n} size=${48}/>`}<span className="ch-addt">${I.plus}<span className="ch-lab">${lab}</span></span></span></label>`)}</div>
      <span className="ch-seam" aria-hidden="true">♥</span>
      <button className="ch-back" onClick=${back} aria-label="뒤로">${I.back}</button><button className="ch-set" onClick=${() => editCouple(c)}>설정</button>
      <div className="ch-txt"><div className="t">${c.name || html`${ME.name} <span className="heart">♥</span> ${c.partner}`}</div>
        ${c.since ? html`<div className="dday num">D+${dPlus(c.since)}</div>` : html`<button className="linkbtn" onClick=${() => editCouple(c)}>사귄 날 넣기</button>`}</div></div>
    ${ann ? html`<div className="annpill">${ann[0]}까지 ${ann[1] ? `${ann[1]}일` : '오늘이에요'}</div>` : null}
    <div className="csum">${ps.length ? html`둘이 함께한 <b className="num">${nf(ps.length)}</b>판 · 같이 논 날 <b className="num">${nf(dates)}</b>일` : '둘이 한 판을 모아 두는 곳이에요'}</div>
    <div className="seg tabs ctabs" role="tablist">${[['home', '홈'], ['wish', '같이 할 게임'], ['log', '기록'], ['stat', '모아 보기']].map(([k, l]) => html`<button key=${k} role="tab" aria-pressed=${tab === k} onClick=${() => setTab(k)}>${l}</button>`)}</div>

    ${tab === 'home' ? html`
      ${planning ? html`<div className="cnext edit"><div className="lb">다음에 같이 할 날</div>
          <input className="input" type="date" min=${today()} value=${pDate} onChange=${e => setPDate(e.target.value)}/>
          <div className="lb" style=${{ marginTop: 10 }}>할 게임<span className="hint"> · 찜한 게임에서 골라요</span></div>
          <div className="dates">${[...new Set([...both, ...wl, ...wl.filter(w => pGames.includes(w.id))])].filter(w => pGames.includes(w.id) || [...both, ...wl].indexOf(w) < 12).map(w => html`<button key=${w.id} className="pill sm" aria-pressed=${pGames.includes(w.id)} onClick=${() => setPGames(pGames.includes(w.id) ? pGames.filter(x => x !== w.id) : [...pGames, w.id])}>${GAME[w.id].ko}</button>`)}
            ${!wl.length ? html`<span className="hint">아직 찜한 게임이 없어요. 날짜만 적어도 돼요.</span>` : null}</div>
          <div className="r"><button className="btn primary" disabled=${!pDate && !pGames.length} onClick=${savePlan}>적어 두기</button><button className="btn" onClick=${() => setPlanning(false)}>취소</button>
            ${nx ? html`<button className="linkbtn muted" onClick=${() => { upCouple(c.id, x => ({ ...x, next: null }), '지웠어요'); setPlanning(false); }}>지우기</button>` : null}</div></div>` :
        nx ? html`<div className="cnext"><div className="lb">다음에 같이 할 날</div><div className="t">${nx.date ? evDay(nx.date) : '날짜 미정'}</div>${nx.games && nx.games.filter(id => GAME[id]).length ? html`<div className="g">${nx.games.filter(id => GAME[id]).map(id => GAME[id].ko).join(' · ')}</div>` : null}
          <div className="r">${nx.date && nx.date <= today() ? html`<button className="btn primary" onClick=${() => recC(nx.games && nx.games[0] || null)}>오늘 한 거 기록하기</button>` : null}<button className="btn" onClick=${startPlan}>바꾸기</button></div>
          ${papp ? html`<div className="hint">미리보기라 ${c.partner}님에게는 아직 안 보여요.</div>` : null}</div>` :
        html`<button className="cnext empty" onClick=${startPlan}><span className="t">다음에 같이 할 날 정하기</span><span className="d">날짜와 할 게임을 적어 두면 여기 맨 위에 보여요</span></button>`}
      <div className="cacts"><button className="btn" onClick=${() => NAV.what && NAV.what([c.partner])}>둘이 할 게임 고르기</button><button className="btn" onClick=${() => { setTab('wish'); setAdding(true); }}>같이 할 게임 찜하기</button></div>
      ${fresh.length ? html`<button className="cwait" onClick=${() => setTab('wish')}><span><b>${c.partner}님이 새로 찜한 게임 ${nf(fresh.length)}개</b></span><span>${fresh.slice(0, 2).map(w => GAME[w.id].ko).join(', ')}${nf(fresh.length > 2 ? ' 외' : '')}</span><span className="go">›</span></button>` : null}
      ${wl.length ? html`<h2 className="sec">${both.length ? '둘 다 찜한 게임' : '찜한 게임'}<button className="more" onClick=${() => setTab('wish')}>전체 ›</button></h2>
        <div className="ntrow">${(both.length ? both : wl).slice(0, 4).map(w => html`<button key=${w.id} className="ms-b" onClick=${() => open(w.id)} aria-label=${GAME[w.id].ko}><span className="ms-art"><${Cover} g=${GAME[w.id]}/></span><span className="ntn">${GAME[w.id].ko}</span></button>`)}</div>` : null}
      ${(() => { const t = today(); const hit = [1, 2, 3, 4, 5].map(y => [y, `${+t.slice(0, 4) - y}${t.slice(4)}`]).map(([y, d]) => [y, d, ps.filter(p => p.date === d)]).find(x => x[2].length);
        if (!hit) return null; const [y, d, dps] = hit; const gn = [...new Set(dps.map(p => GAME[p.gameId] ? GAME[p.gameId].ko : ''))].filter(Boolean);
        return html`<button className="cmemo" onClick=${() => NAV.day && NAV.day(d)}><span className="lb">${nf(y)}년 전 오늘</span><span className="t">둘이 ${gn.slice(0, 2).join(', ')}${gn.length > 2 ? ` 외 ${nf(gn.length - 2)}개` : ''} 했어요</span><span className="chev">›</span></button>`; })()}
      ${ps.length ? html`<h2 className="sec">최근에 둘이 한 게임<button className="more" onClick=${() => setTab('log')}>전체 ›</button></h2>` : null}
      ${ps.length ? (() => { const gs = []; [...ps].sort((x, y) => y.date.localeCompare(x.date) || (y.at || 0) - (x.at || 0)).forEach(p => { const g = gs.find(x => x.date === p.date && x.gameId === p.gameId); if (g) g.ps.push(p); else gs.push({ date: p.date, gameId: p.gameId, ps: [p] }); });
        // 같은 날 같은 게임은 한 줄: '패치워크 2판 · 에릭 1 : 1 지민'
        return gs.slice(0, 3).map(g => { const p = g.ps[0]; const n = g.ps.length; const dec = g.ps.filter(x => modeOf(x) !== 'coop' && decided(x)); const a = dec.filter(x => wonBy(x, '나')).length, b = dec.filter(x => wonBy(x, c.partner)).length;
          return html`<button key=${g.date + g.gameId} className="crecent" onClick=${() => NAV.day && NAV.day(g.date)}><span className="dt">${relDay(g.date)}</span><span className="g">${GAME[p.gameId] ? GAME[p.gameId].ko : ''}${n > 1 ? html` <span className="num cn">${nf(n)}판</span>` : null}</span><span className="r">${n === 1 ? joinBits(roundSummary({ ...p, memo: '', scores: {} }, false)) : dec.length ? html`${a !== b ? html`<span className="crown">${a > b ? ME.name : c.partner} ${nf(Math.max(a, b))}승</span>` : `${ME.name} ${nf(a)} : ${nf(b)} ${c.partner}`}` : null}</span></button>`; }); })() :
        html`<div className="cfirst"><b>둘이 한 첫 게임을 남겨 볼까요?</b><span>${c.partner}님이 들어간 채로 열려요. 둘이 한 판은 여기 모여요.</span><button className="btn primary" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button></div>`}
      ${media.length ? html`<h2 className="sec">추억<button className="more" onClick=${() => { setTab('log'); setLogv('mem'); }}>전체 ›</button></h2><div className="cmem">${media.slice(0, 4).map((x, i) => html`<button key=${i} className="cmem-b" onClick=${() => NAV.day && NAV.day(x.d)} aria-label=${`${dLabel(x.d)} 기록 보기`}><${MediaView} items=${[x.m]} small/><span className="cmem-d">${dLabel(x.d)}</span></button>`)}</div>` : null}
    ` : null}

    ${tab === 'wish' ? html`
      ${(() => { const tp = theirPicks(c, papp); if (!tp) return null;
        const items = [...tp.buy.map(id => [id, 'buy']), ...tp.fav.filter(id => !tp.buy.includes(id)).map(id => [id, 'fav'])].filter(([id]) => GAME[id]);
        if (!items.length) return null; const gifts = c.gifts || [];
        return html`<section className="tp"><h2 className="sec">${c.partner}님이 요즘 관심 있는 게임</h2>
          <div className="note" style=${{ marginTop: -4 }}>${c.partner}님 보관함의 즐겨찾기와 사고 싶은 게임이에요.</div>
          <div className="tp-row">${items.slice(0, 12).map(([id, k]) => { const g = GAME[id]; const mine = wish.find(w => w.id === id && w.me); const gift = gifts.includes(id); const own = !!st.collection[id];
            return html`<div key=${id} className="tp-c"><button className="tp-art" onClick=${() => open(id)} aria-label=${g.ko}><${Cover} g=${g}/>${k === 'buy' ? html`<span className="tp-tag">사고 싶어 해요</span>` : null}</button>
              <span className="tp-n">${g.ko}</span>
              <span className="tp-act"><button className=${'pill sm' + (mine ? ' on' : '')} aria-pressed=${!!mine} onClick=${() => mine ? null : star(id)}>${mine ? '♥ 같이 하자고 함' : '같이 하자'}</button>
                ${k === 'buy' && !own ? html`<button className="pill sm" aria-pressed=${gift} onClick=${() => upCouple(c.id, x => ({ ...x, gifts: gift ? (x.gifts || []).filter(i => i !== id) : [...(x.gifts || []), id] }), gift ? '선물 후보에서 뺐어요' : `선물 후보에 담았어요. ${c.partner}님에게는 안 보여요`)}>${gift ? '🎁 선물 후보' : '🎁 선물'}</button>` : null}</span></div>`; })}</div></section>`; })()}
      ${adding ? html`<div className="cwadd"><${GamePicker} onPick=${id => addWish(id)} favs=${st.favs} np=${2} onCustom=${() => {}}/><button className="btn block" style=${{ marginTop: 8 }} onClick=${() => setAdding(false)}>닫기</button></div>` :
        html`<button className="btn block primary" onClick=${() => setAdding(true)}>${I.plus}같이 할 게임 찜하기</button>`}
      ${wl.length ? html`<div className="seg cwf" role="tablist">${[['all', '전체', wl.length], ['both', '둘 다', both.length], ['me', ME.name, wl.filter(w => w.me).length], ['them', c.partner, wl.filter(w => w.them).length]].map(([k, l, n]) => html`<button key=${k} role="tab" aria-pressed=${wf === k} onClick=${() => setWf(k)}><span className="fl">${l}</span> <span className="num">${nf(n)}</span></button>`)}</div>
        ${wl.length > 12 ? html`<div className="cw-find"><div className="search">${I.games}<input type="search" placeholder="찜한 게임 찾기" value=${wq} onInput=${e => { setWq(e.target.value); setWlim(50); }}/></div><button className="pill sm" aria-pressed=${wOwn} onClick=${() => { setWOwn(!wOwn); setWlim(50); }}>보관함에 있는 것</button></div>` : null}
        ${wlist.slice(0, wlim).map(wrow)}
        ${wlist.length > wlim ? html`<${MoreBtn} left=${wlist.length - wlim} unit="개" onClick=${() => setWlim(wlim + 50)}/>` : null}
        ${!wlist.length ? html`<div className="note">${wt ? `'${wq.trim()}' 찜한 게임이 없어요.` : wOwn ? '보관함에 있는 찜한 게임이 없어요.' : wf === 'both' ? '아직 둘 다 찜한 게임이 없어요.' : wf === 'me' ? `${ME.name}님이 찜한 게임이 없어요.` : `${c.partner}님이 찜한 게임이 없어요.`}</div>` : null}` :
        html`<${Empty} title="아직 찜한 게임이 없어요">같이 하고 싶은 게임을 찜하면 ${c.partner}님도 볼 수 있어요. 둘 다 찜한 게임은 맨 위에 와요.<//>`}
      ${wl.length && !papp ? html`<div className="note">${c.partner}님은 앱을 안 써서, ⋯에서 대신 찜을 표시할 수 있어요.</div>` : null}
      ${wish.some(w => w.sample) ? html`<div className="note">처음 둘러보기용 예시 목록이에요. 예시 데이터를 지우면 같이 지워져요.</div>` : null}
    ` : null}

    ${tab === 'log' ? html`<div className="seg ltabs" role="tablist">${[['log', '기록'], ['mem', '추억']].map(([k, l]) => html`<button key=${k} role="tab" aria-pressed=${logv === k} onClick=${() => setLogv(k)}>${l}</button>`)}</div>` : null}
    ${tab === 'log' && logv === 'mem' ? html`
      ${yearAgo.length ? html`<div className="yago"><${MediaView} items=${yearAgo.map(x => x.m).slice(0, 1)} label="1년 전 오늘"/><div className="ya-t"><b>1년 전 오늘</b><span>${(() => { const p = ps.find(x => x.date === ago); return p && GAME[p.gameId] ? GAME[p.gameId].ko + (p.memo ? ` · ${p.memo}` : '') : ''; })()}</span></div>${NAV.share ? html`<button className="ya-share" onClick=${() => NAV.share(ago)}>공유하기</button>` : null}</div>` : null}
      ${months.length ? html`${months.slice(0, mlim).map(m => html`<section key=${m.k}><div className="mhd">${m.k.slice(0, 4) === thisY ? '' : m.k.slice(0, 4) + '년 '}${+m.k.slice(5)}월 <span className="muted num">${nf(m.items.length)}</span></div><${MediaView} grid items=${m.items} label=${`${+m.k.slice(5)}월 사진`}/></section>`)}
        ${months.length > mlim ? html`<${MoreBtn} left=${months.length - mlim} unit="달" onClick=${() => setMlim(mlim + 6)}/>` : null}` :
        html`<${Empty} title="아직 사진이 없어요">둘이 기록할 때 사진을 넣으면 여기에 쌓여요.<//>`}` : null}

    ${tab === 'log' && logv === 'log' ? html`<${DayList} inGroupView plays=${ps} st=${st} open=${open} editDay=${editDay} removeFromId=${removeFromId} shareDay=${shareDay} variant="couple" empty=${html`<${Empty} title="아직 둘이 한 판이 없어요" action=${html`<button className="btn primary" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button>`}>기록할 때 ${c.partner}님만 넣으면 여기에 모여요.<//>`}/>
      <div className="note">${c.partner}님하고 둘이서만 한 판이 모여요. 여럿이 한 판은 모임이나 친구 전적에서 보여요.</div>` : null}

    ${tab === 'stat' && !ps.length ? html`<${Empty} title="둘이 한 판이 쌓이면 여기 보여요" action=${html`<button className="btn primary" onClick=${() => recC(null)}>둘이 한 게임 기록하기</button>`}>자주 한 게임, 같이 논 날이 모여요.<//>` : null}
    ${tab === 'stat' && ps.length ? html`

  // 다가오는 일정: 가요 누른 일정 + 일주일 안에 있는데 아직 답 안 한 일정
  const myEvs = useMemo(() => upcomingEvs(st), [st.groups]);
  return html`<div className="screen">
    <div className="topbar">${back ? html`<button className="backbtn" onClick=${back}>${I.back}뒤로</button>` : html`<h1>모임</h1>`}<span className="tbr">${sec === 'grp' ? html`<button className="btn" onClick=${newGroup}>+ 모임 만들기</button>` : sec === 'cpl' ? html`<button className="btn" onClick=${() => editCouple(null)}>+ 커플 만들기</button>` : null}</span></div>
    ${back ? html`<h1 style=${{ margin: '0 0 10px' }}>모임</h1>` : null}
    <div className="seg hubseg" role="tablist">${[['cpl', '커플'], ['fr', '친구'], ['grp', '모임']].map(([k, l]) => html`<button key=${k} role="tab" aria-pressed=${sec === k} onClick=${() => pickSec(k)}>${l}</button>`)}</div>
    ${sec === 'cpl' ? html`${(st.couples || []).length ? html`<div className="cpllist">${st.couples.map(c => html`<${CoupleCard} key=${c.id} c=${c} st=${st} onOpen=${() => openCouple(c.id)}/>`)}</div>` :
        html`<${Empty} title="커플 공간이 아직 없어요" action=${html`<button className="btn primary" onClick=${() => editCouple(null)}>커플 만들기</button>`}>둘이 한 게임과 함께한 날을 따로 모아 봐요. 모임과는 따로 있어요.<//>`}` : null}
    ${sec === 'fr' ? html`<${PeopleList} st=${st} openPerson=${openPerson}/>` : null}
