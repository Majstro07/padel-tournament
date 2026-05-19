import { useState, useEffect, useRef } from "react";


// ── dCOS brand palette ────────────────────────────────────────────────────────
const C = {
  orange:     "#f97316",
  orangeHov:  "#ea6c0a",
  navy:       "#1a2236",
  navyLight:  "#2c3a52",
  white:      "#ffffff",
  bg:         "#f5f6f8",
  bgCard:     "#ffffff",
  border:     "#e2e6ed",
  text:       "#1a2236",
  textMid:    "#4b5a6e",
  textLight:  "#8a96a6",
  green:      "#22c55e",
  red:        "#ef4444",
};

// ── Play-window engine ────────────────────────────────────────────────────────
const TOURNAMENT_START = new Date("2026-05-04T00:00:00");
const WINDOW_DAYS = 14;
const JOKERS_PER_TEAM = 1;

function windowOf(date) {
  const ms = new Date(date).getTime() - TOURNAMENT_START.getTime();
  if (ms < 0) return -1;
  return Math.floor(ms / (WINDOW_DAYS * 86400000));
}
function windowBounds(idx) {
  const start = new Date(TOURNAMENT_START.getTime() + idx * WINDOW_DAYS * 86400000);
  const end   = new Date(start.getTime() + WINDOW_DAYS * 86400000 - 1);
  return { start, end };
}
function currentWindow() { return windowOf(new Date()); }
function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { day:"numeric", month:"short" });
}

function teamsPlayedInWindow(matches, wIdx) {
  const { start, end } = windowBounds(wIdx);
  const played = new Set();
  matches.forEach(m => {
    if (m.scoreA === null) return;
    const ts = m.scoreTs ? new Date(m.scoreTs) : null;
    const inWindow = ts ? (ts >= start && ts <= end) : wIdx === 0;
    if (inWindow) { played.add(m.teamA); played.add(m.teamB); }
  });
  return played;
}

function teamCompliance(teamId, matches, jokers, numWindows) {
  const cur = currentWindow();
  const usedJokerWindows = jokers[teamId] || [];
  const result = [];
  for (let w = 0; w < numWindows; w++) {
    const bounds = windowBounds(w);
    const isPast    = w < cur;
    const isCurrent = w === cur;
    const played    = teamsPlayedInWindow(matches, w).has(teamId);
    const jokered   = usedJokerWindows.includes(w);
    const missed    = isPast && !played && !jokered;
    result.push({ window:w, bounds, isPast, isCurrent, played, jokered, missed });
  }
  return result;
}

// ── Real teams ────────────────────────────────────────────────────────────────
const SEED_TEAMS = [
  { id:"t1", name:"Sparťanská šlechta",    players:["Vendy Kalita",    "Josef Loužecký"], password:"sparta123",  color:"#f97316" },
  { id:"t2", name:"Beak Team",             players:["Petr Klika",      "Daniel Janča"],   password:"beak123",   color:"#3b82f6" },
  { id:"t3", name:"EWP",                   players:["Alex Vološin",    "Ján Nikodem"],    password:"ewp123",    color:"#8b5cf6", isAdmin:true },
  { id:"t4", name:"Zrádci",                players:["Zbyňek Stuchlík","David Říháček"],  password:"zradci123", color:"#22c55e" },
  { id:"t5", name:"P(a/r)DEL PENETRÁTORS", players:["Tomáš Engel",    "Radek Pich"],     password:"pardel123", color:"#ec4899" },
  { id:"t6", name:"Síťoví Gangsteři",      players:["Tomáš Plesník",  "Filip Dovalil"],  password:"sitovi123", color:"#eab308" },
  { id:"t7", name:"IBM Elders",            players:["Kuba Dorfl",     "Petr Holomeček"], password:"ibm123",    color:"#06b6d4" },
  { id:"t8", name:"Dřeváci",               players:["Jirka Bucek",    "Zdeněk Šubr"],  password:"drevaci123",color:"#ef4444" },
];

// ── 28 RR matches with WhatsApp links ─────────────────────────────────────────
const SEED_RR = [
  { id:"rr1",  teamA:"t1", teamB:"t2", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/Lrk8yvCktMyG2KgWEFXq0I" },
  { id:"rr2",  teamA:"t1", teamB:"t3", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/LprvytGBOSR357hd59I3FF" },
  { id:"rr3",  teamA:"t1", teamB:"t4", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/K5cmNqNumJ41srYf50uXOP" },
  { id:"rr4",  teamA:"t1", teamB:"t5", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/LBVaq9NX9atDaUIzDmO82B" },
  { id:"rr5",  teamA:"t1", teamB:"t6", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/LeuYkAD87pX8eGNrnA0D1v" },
  { id:"rr6",  teamA:"t1", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/GAvCSrfbcq5HuToOKNcakH" },
  { id:"rr7",  teamA:"t1", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/Lt1tSrgu1Kf82ZMkPX8MwF" },
  { id:"rr8",  teamA:"t2", teamB:"t3", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/BhbNgdGDAlc5KggTq9JHqZ" },
  { id:"rr9",  teamA:"t2", teamB:"t4", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/FGqJtAjXSC34nQNTrb7QPi" },
  { id:"rr10", teamA:"t2", teamB:"t5", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/IGswRk3VBrA8cvZqR5VQdE" },
  { id:"rr11", teamA:"t2", teamB:"t6", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/DRlWO5EsbRB5QVFUcznicc" },
  { id:"rr12", teamA:"t2", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/DTuAEMXAtPwHCRPRmH5tm2" },
  { id:"rr13", teamA:"t2", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/E0tcymrA5iCCukVua5Ct5T" },
  { id:"rr14", teamA:"t3", teamB:"t4", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/KKYCBWk3sPA6mRJDggAf9s" },
  { id:"rr15", teamA:"t3", teamB:"t5", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/LFE7TTirGQpLZ2gOWsLlxV" },
  { id:"rr16", teamA:"t3", teamB:"t6", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/K7LPzNWO0VjJeEGrQ6p9zB" },
  { id:"rr17", teamA:"t3", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/JvZ8eaDpaW5Jn2RMNvVs64" },
  { id:"rr18", teamA:"t3", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/GxaOOstNqXH4KhETbrvnOl" },
  { id:"rr19", teamA:"t4", teamB:"t5", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/CTxtHqyXWu4D7CGLNY3zAb" },
  { id:"rr20", teamA:"t4", teamB:"t6", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/ComeH6ZpNfX27JnNnHhguf" },
  { id:"rr21", teamA:"t4", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/IF1oP4u7Dm3JMqiX2QacDS" },
  { id:"rr22", teamA:"t4", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/L9bBcWEtP6mG0VdAq3832Z" },
  { id:"rr23", teamA:"t5", teamB:"t6", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/DaOiN71Fzbj9PMi52SCTSD" },
  { id:"rr24", teamA:"t5", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/BBmhspbxNz18u3RHrXxFBZ" },
  { id:"rr25", teamA:"t5", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/IZv4s2PLAFCI1quXmRPWAC" },
  { id:"rr26", teamA:"t6", teamB:"t7", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/D3Sz4MBitWd2hiXeVLCAn6" },
  { id:"rr27", teamA:"t6", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/Kpu95syLORBHVzOUvC1jtv" },
  { id:"rr28", teamA:"t7", teamB:"t8", scoreA:null, scoreB:null, wa:"https://chat.whatsapp.com/FI2fGCcHOaXJVkYXUDD1ZK" },
];

const SEED_KNOCKOUT = [
  { id:"sf1", label:"Semi-Final 1", teamA:null, teamB:null, scoreA:null, scoreB:null },
  { id:"sf2", label:"Semi-Final 2", teamA:null, teamB:null, scoreA:null, scoreB:null },
  { id:"tp",  label:"3rd Place",    teamA:null, teamB:null, scoreA:null, scoreB:null },
  { id:"f1",  label:"Final",        teamA:null, teamB:null, scoreA:null, scoreB:null },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function computeStandings(teams, rr, penalties = {}) {
  const s = {};
  teams.forEach(t => { s[t.id] = { w:0, l:0, d:0, pts:0, gf:0, ga:0 }; });
  rr.forEach(m => {
    if (m.scoreA === null) return;
    const [a, b] = [m.scoreA, m.scoreB];
    s[m.teamA].gf += a; s[m.teamA].ga += b;
    s[m.teamB].gf += b; s[m.teamB].ga += a;
    if (a > b)      { s[m.teamA].w++; s[m.teamA].pts += 3; s[m.teamB].l++; }
    else if (b > a) { s[m.teamB].w++; s[m.teamB].pts += 3; s[m.teamA].l++; }
    else            { s[m.teamA].d++; s[m.teamA].pts++; s[m.teamB].d++; s[m.teamB].pts++; }
  });
  return teams
    .map(t => {
      const pen = penalties[t.id] || 0;
      return { ...t, ...s[t.id], played: s[t.id].w + s[t.id].l + s[t.id].d, penalty: pen, pts: Math.max(0, s[t.id].pts - pen) };
    })
    .sort((a, b) => b.pts - a.pts || b.w - a.w);
}
function rrComplete(rr) { return rr.every(m => m.scoreA !== null); }
function syncKnockout(ko, standings) {
  const top4 = standings.slice(0, 4);
  return ko.map(m => {
    if (m.id === "sf1") return { ...m, teamA: top4[0]?.id||null, teamB: top4[3]?.id||null };
    if (m.id === "sf2") return { ...m, teamA: top4[1]?.id||null, teamB: top4[2]?.id||null };
    if (m.id === "tp") {
      const sf1 = ko.find(x=>x.id==="sf1"), sf2 = ko.find(x=>x.id==="sf2");
      return { ...m,
        teamA: sf1?.scoreA!==null ? (sf1.scoreA<sf1.scoreB?sf1.teamA:sf1.teamB) : null,
        teamB: sf2?.scoreA!==null ? (sf2.scoreA<sf2.scoreB?sf2.teamA:sf2.teamB) : null,
      };
    }
    if (m.id === "f1") {
      const sf1 = ko.find(x=>x.id==="sf1"), sf2 = ko.find(x=>x.id==="sf2");
      return { ...m,
        teamA: sf1?.scoreA!==null ? (sf1.scoreA>sf1.scoreB?sf1.teamA:sf1.teamB) : null,
        teamB: sf2?.scoreA!==null ? (sf2.scoreA>sf2.scoreB?sf2.teamA:sf2.teamB) : null,
      };
    }
    return m;
  });
}

// ── WhatsApp icon ─────────────────────────────────────────────────────────────
function WAIcon({ size=16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fill="#25D366"/>
      <path d="M17.006 14.53c-.273-.137-1.617-.797-1.867-.887-.25-.091-.432-.137-.614.137-.182.273-.705.887-.864 1.069-.159.182-.318.205-.591.068-.273-.136-1.152-.424-2.194-1.353-.811-.723-1.358-1.616-1.517-1.889-.159-.273-.017-.42.12-.556.122-.122.273-.318.41-.477.136-.16.181-.273.272-.455.091-.182.046-.341-.023-.477-.068-.137-.614-1.48-.841-2.026-.222-.532-.447-.46-.614-.468l-.523-.009c-.182 0-.477.068-.727.341-.25.273-.955.933-.955 2.275 0 1.343.978 2.639 1.114 2.821.137.182 1.925 2.939 4.664 4.122.652.281 1.16.449 1.557.574.654.208 1.25.179 1.72.109.525-.079 1.617-.661 1.844-1.3.228-.638.228-1.185.16-1.3-.068-.113-.25-.181-.523-.318z" fill="#fff"/>
    </svg>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [teams,     setTeams]     = useState(SEED_TEAMS);
  const [rrMatches, setRRMatches] = useState(SEED_RR);
  const [knockout,  setKnockout]  = useState(SEED_KNOCKOUT);
  const [messages,  setMessages]  = useState([
    { id:1, teamId:"t1", text:"Připraveni na zápas! 🎾", ts:Date.now()-120000 },
    { id:2, teamId:"t4", text:"Hodně štěstí všem 💪",    ts:Date.now()-60000  },
  ]);
  const [jokers,    setJokers]    = useState({});
  const [penalties, setPenalties] = useState({});
  const [session, setSession] = useState(null);
  const [tab,     setTab]     = useState("leaderboard");
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    fetch('/api/state').then(r => r.json()).then(s => {
      if (s.teams)     setTeams(s.teams);
      if (s.rr)        setRRMatches(s.rr);
      if (s.ko)        setKnockout(s.ko);
      if (s.messages)  setMessages(s.messages);
      if (s.jokers)    setJokers(s.jokers);
      if (s.penalties) setPenalties(s.penalties);
      setLoaded(true);
    }).catch(() => setLoaded(true));
  }, []);

  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teams, rr: rrMatches, ko: knockout, messages, jokers, penalties }),
      });
    }, 500);
  }, [teams, rrMatches, knockout, messages, jokers, penalties, loaded]);

  const standings = computeStandings(teams, rrMatches, penalties);
  const teamMap   = Object.fromEntries(teams.map(t => [t.id, t]));
  const groupDone = rrComplete(rrMatches);
  const isAdmin   = session?.id === "t3";

  function submitRR(id, sA, sB) {
    setRRMatches(p => p.map(m => m.id===id ? {...m, scoreA:sA, scoreB:sB, scoreTs: new Date().toISOString()} : m));
  }
  function submitKO(id, sA, sB) {
    setKnockout(p => { const u=p.map(m=>m.id===id?{...m,scoreA:sA,scoreB:sB}:m); return syncKnockout(u,standings); });
  }
  useEffect(() => {
    if (groupDone) setKnockout(p => syncKnockout(p, standings));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupDone, rrMatches]);

  function updateTeamPlayers(teamId, newPlayers) {
    setTeams(p => p.map(t => t.id === teamId ? { ...t, players: newPlayers } : t));
  }
  function updateTeamName(teamId, newName) {
    setTeams(p => p.map(t => t.id === teamId ? { ...t, name: newName } : t));
  }

  function changePassword(teamId, newPw) {
    setTeams(p => p.map(t => t.id===teamId ? {...t, password:newPw} : t));
    setSession(p => p ? {...p, password:newPw} : p);
  }
  function sendMessage(text) {
    if (!session||!text.trim()) return;
    setMessages(p => [...p, { id:Date.now(), teamId:session.id, text:text.trim(), ts:Date.now() }]);
  }
  function useJoker(teamId, windowIdx) {
    const used = jokers[teamId] || [];
    if (used.length >= JOKERS_PER_TEAM) return;
    setJokers(p => ({ ...p, [teamId]: [...used, windowIdx] }));
  }

  if (!loaded) return (
    <div style={{ background:C.bg, height:"100vh", display:"flex", alignItems:"center", justifyContent:"center", color:C.navy, fontFamily:"sans-serif", fontSize:18 }}>
      Loading…
    </div>
  );

  const tabs = [
    ["leaderboard","🏆 Standings"],
    ["matches",    "⚽ Group Stage"],
    ["schedule",   "📅 Schedule"],
    ["bracket",    groupDone ? "🥊 Bracket" : "🔒 Bracket"],
    ["teams",      "👥 Teams"],
    ["chat",       "💬 Chat"],
    ["courts",     "🏟️ Courts"],
    ["rules",      "📖 Rules"],
    ...(isAdmin ? [["admin", "⚙️ Admin"]] : []),
  ];

  return (
    <div style={{ fontFamily:"'Inter','Segoe UI',sans-serif", background:C.bg, minHeight:"100vh", color:C.text, display:"flex", flexDirection:"column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#f0f2f5}::-webkit-scrollbar-thumb{background:#c8d0dc;border-radius:3px}
        .btn{cursor:pointer;border:none;border-radius:6px;font-family:'Inter',sans-serif;font-weight:600;transition:all .15s}
        .btn:hover{filter:brightness(.93);transform:translateY(-1px)}
        .btn:active{transform:translateY(0)}
        .card{background:${C.bgCard};border:1px solid ${C.border};border-radius:10px;box-shadow:0 1px 4px rgba(26,34,54,.06)}
        input,select{background:${C.white};border:1.5px solid ${C.border};border-radius:7px;color:${C.text};padding:9px 13px;font-family:'Inter',sans-serif;font-size:14px;outline:none;transition:border .15s}
        input:focus,select:focus{border-color:${C.orange};box-shadow:0 0 0 3px ${C.orange}18}
        .tab-btn{background:none;border:none;cursor:pointer;font-family:'Inter',sans-serif;font-weight:600;font-size:13px;letter-spacing:.01em;padding:10px 16px;border-radius:7px;transition:all .15s;color:${C.textMid};white-space:nowrap}
        .tab-btn.active{background:${C.orange}15;color:${C.orange}}
        .tab-btn:hover:not(.active){background:${C.bg};color:${C.navy}}
        .pulse{animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
        .fade-in{animation:fadeIn .25s ease}@keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        .wa-btn{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;background:#e8faf0;border:1.5px solid #b3eacb;cursor:pointer;transition:all .15s;text-decoration:none;flex-shrink:0}
        .wa-btn:hover{background:#d0f5e3;border-color:#25D366;transform:scale(1.1)}
        .pill{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.03em}
      `}</style>

      {/* ── Top bar ── */}
      <div style={{ background:C.navy, height:4 }} />
      <header style={{ background:C.white, borderBottom:`1px solid ${C.border}`, padding:"0 28px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64, position:"sticky", top:0, zIndex:99, boxShadow:"0 1px 6px rgba(26,34,54,.08)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:C.orange, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🎾</div>
          <div>
            <div style={{ fontWeight:800, fontSize:16, color:C.navy, lineHeight:1.2 }}>Padel Cup</div>
            <div style={{ fontSize:11, color:C.textLight, letterSpacing:".05em", textTransform:"uppercase" }}>Tournament Portal</div>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {session
            ? <>
                <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 12px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                  <div style={{ width:9, height:9, borderRadius:"50%", background:session.color }} />
                  <span style={{ fontSize:13, fontWeight:600, color:C.navy }}>{session.name}</span>
                </div>
                <ChangePasswordModal session={session} onSave={changePassword} />
                <button className="btn" onClick={()=>setSession(null)} style={{ background:C.bg, color:C.textMid, padding:"7px 14px", fontSize:13, border:`1px solid ${C.border}` }}>Logout</button>
              </>
            : <LoginModal teams={teams} onLogin={setSession} />
          }
        </div>
      </header>

      {/* ── Tabs ── */}
      <div style={{ background:C.white, borderBottom:`1px solid ${C.border}` }}>
        <div style={{ maxWidth:940, margin:"0 auto", padding:"0 20px", display:"flex", gap:2, overflowX:"auto" }}>
          {tabs.map(([k,l]) => (
            <button key={k} className={`tab-btn ${tab===k?"active":""}`} onClick={()=>setTab(k)}>{l}</button>
          ))}
        </div>
      </div>

      {/* ── Page content ── */}
      <main style={{ maxWidth:940, margin:"0 auto", padding:"28px 20px", flex:1, width:"100%" }} className="fade-in" key={tab}>
        {tab==="leaderboard" && <Leaderboard standings={standings} groupDone={groupDone} />}
        {tab==="matches"     && <Matches rrMatches={rrMatches} teamMap={teamMap} session={session} onSubmit={submitRR} />}
        {tab==="schedule"    && <Schedule rrMatches={rrMatches} teams={teams} teamMap={teamMap} session={session} jokers={jokers} onJoker={useJoker} />}
        {tab==="bracket"     && <Bracket knockout={knockout} teamMap={teamMap} session={session} onSubmit={submitKO} groupDone={groupDone} standings={standings} />}
        {tab==="teams"       && <Teams teams={teams} rrMatches={rrMatches} />}
        {tab==="chat"        && <Chat messages={messages} teamMap={teamMap} session={session} onSend={sendMessage} />}
        {tab==="courts"      && <CourtsTab />}
        {tab==="rules"       && <Rules />}
        {tab==="admin"       && isAdmin && <Admin teams={teams} rrMatches={rrMatches} jokers={jokers} penalties={penalties} onUpdatePlayers={updateTeamPlayers} onUpdateName={updateTeamName} onPenalty={(id, pts) => setPenalties(p => ({...p, [id]: pts}))} />}
      </main>

      {/* ── Footer ── */}
      <footer style={{ borderTop:`1px solid ${C.border}`, background:C.white, padding:"18px 28px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20 }}>🎾</span>
          <span style={{ color:C.textLight, fontSize:13 }}>Padel Cup 2026</span>
        </div>
        <div style={{ fontSize:12, color:C.textLight }}>Good luck to all teams!</div>
      </footer>
    </div>
  );
}

// ── Shared modal shell ────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(26,34,54,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(2px)" }} onClick={onClose}>
      <div className="card" style={{ width:340, padding:"28px 26px" }} onClick={e=>e.stopPropagation()}>
        <div style={{ fontWeight:800, fontSize:18, color:C.navy, marginBottom: subtitle?4:20 }}>{title}</div>
        {subtitle && <div style={{ fontSize:13, color:C.textMid, marginBottom:20 }}>{subtitle}</div>}
        {children}
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function LoginModal({ teams, onLogin }) {
  const [open,setOpen]=useState(false);
  const [sel,setSel]=useState("");
  const [pw,setPw]=useState("");
  const [err,setErr]=useState("");
  function attempt() {
    const t=teams.find(x=>x.id===sel);
    if (!t) { setErr("Please select a team"); return; }
    if (t.password!==pw) { setErr("Incorrect password"); return; }
    onLogin(t); setOpen(false); setPw(""); setErr("");
  }
  return (
    <>
      <button className="btn" onClick={()=>setOpen(true)} style={{ background:C.orange, color:C.white, padding:"8px 20px", fontSize:13 }}>Team Login</button>
      {open && (
        <Modal title="Team Login" subtitle="Select your team and enter the password to access your matches." onClose={()=>{setOpen(false);setPw("");setErr("");}}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            <select value={sel} onChange={e=>setSel(e.target.value)} style={{ width:"100%" }}>
              <option value="">— Select your team —</option>
              {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <input type="password" placeholder="Password" value={pw} style={{ width:"100%" }}
              onChange={e=>{setPw(e.target.value);setErr("");}}
              onKeyDown={e=>e.key==="Enter"&&attempt()} />
            {err && <div style={{ color:C.red, fontSize:13, display:"flex", alignItems:"center", gap:5 }}>⚠ {err}</div>}
            <div style={{ display:"flex", gap:8, marginTop:4 }}>
              <button className="btn" onClick={()=>{setOpen(false);setPw("");setErr("");}} style={{ flex:1, background:C.bg, color:C.textMid, padding:10, fontSize:13, border:`1px solid ${C.border}` }}>Cancel</button>
              <button className="btn" onClick={attempt} style={{ flex:2, background:C.orange, color:C.white, padding:10, fontSize:14 }}>Login</button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}

// ── Change Password ───────────────────────────────────────────────────────────
function ChangePasswordModal({ session, onSave }) {
  const [open,setOpen]=useState(false);
  const [cur,setCur]=useState(""); const [next,setNext]=useState(""); const [conf,setConf]=useState("");
  const [err,setErr]=useState(""); const [ok,setOk]=useState(false);
  function reset(){ setCur(""); setNext(""); setConf(""); setErr(""); setOk(false); }
  function attempt() {
    if (cur!==session.password) { setErr("Current password is incorrect"); return; }
    if (next.length<4)          { setErr("New password must be at least 4 characters"); return; }
    if (next!==conf)            { setErr("Passwords don't match"); return; }
    onSave(session.id, next); setOk(true); setErr("");
    setTimeout(()=>{ setOpen(false); reset(); }, 1400);
  }
  return (
    <>
      <button className="btn" title="Change password" onClick={()=>{setOpen(true);reset();}}
        style={{ background:C.bg, color:C.textMid, padding:"7px 10px", fontSize:14, border:`1px solid ${C.border}` }}>🔑</button>
      {open && (
        <Modal title="Change Password" subtitle={`Team: ${session.name}`} onClose={()=>{setOpen(false);reset();}}>
          {ok
            ? <div style={{ textAlign:"center", padding:"16px 0" }}>
                <div style={{ fontSize:38, marginBottom:8 }}>✅</div>
                <div style={{ fontWeight:600, color:C.green, fontSize:15 }}>Password updated!</div>
              </div>
            : <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[["Current Password","Enter current password",cur,setCur,"password"],
                  ["New Password","At least 4 characters",next,setNext,"password"],
                  ["Confirm New Password","Repeat new password",conf,setConf,"password"]].map(([label,ph,val,set,type])=>(
                  <div key={label}>
                    <div style={{ fontSize:11, fontWeight:600, color:C.textMid, letterSpacing:".06em", textTransform:"uppercase", marginBottom:5 }}>{label}</div>
                    <input type={type} placeholder={ph} value={val} style={{ width:"100%" }}
                      onChange={e=>{set(e.target.value);setErr("");}}
                      onKeyDown={e=>e.key==="Enter"&&attempt()} />
                  </div>
                ))}
                {err && <div style={{ color:C.red, fontSize:13 }}>⚠ {err}</div>}
                <div style={{ display:"flex", gap:8, marginTop:4 }}>
                  <button className="btn" onClick={()=>{setOpen(false);reset();}} style={{ flex:1, background:C.bg, color:C.textMid, padding:10, fontSize:13, border:`1px solid ${C.border}` }}>Cancel</button>
                  <button className="btn" onClick={attempt} style={{ flex:2, background:C.orange, color:C.white, padding:10, fontSize:14 }}>Save Password</button>
                </div>
              </div>
          }
        </Modal>
      )}
    </>
  );
}

// ── Section heading ───────────────────────────────────────────────────────────
function SectionHead({ title, sub }) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:sub?4:0 }}>
        <div style={{ width:4, height:20, background:C.orange, borderRadius:2 }} />
        <h2 style={{ fontSize:18, fontWeight:800, color:C.navy }}>{title}</h2>
      </div>
      {sub && <div style={{ fontSize:13, color:C.textMid, marginLeft:14 }}>{sub}</div>}
    </div>
  );
}

// ── Schedule & Play Windows ───────────────────────────────────────────────────
function Schedule({ rrMatches, teams, teamMap, session, jokers, onJoker }) {
  const cur = currentWindow();
  const numWindows = Math.max(cur + 3, 4);
  const windows = Array.from({ length: numWindows }, (_, i) => i);

  return (
    <div>
      <SectionHead title="Play Windows" sub="Each team must play at least 1 match every 2 weeks" />

      <div style={{ display:"flex", gap:16, marginBottom:20, flexWrap:"wrap" }}>
        {[
          ["#e0f2fe","#0369a1","Current window"],
          ["#f8fafc", C.border,"Upcoming"],
          ["#f0fdf4","#166534","Compliant ✓"],
          ["#fef2f2","#b91c1c","Missed ⚠"],
          ["#fefce8","#a16207","Joker used 🃏"],
        ].map(([bg,col,label]) => (
          <div key={label} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:col }}>
            <div style={{ width:12, height:12, borderRadius:3, background:bg, border:`1px solid ${col}55` }} />
            {label}
          </div>
        ))}
      </div>

      {session && (
        <MyWindowStatus
          session={session} rrMatches={rrMatches} jokers={jokers}
          onJoker={onJoker} numWindows={numWindows}
        />
      )}

      <div className="card" style={{ overflowX:"auto", marginBottom:24 }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.navy }}>
              <th style={{ padding:"10px 16px", textAlign:"left", color:"rgba(255,255,255,.75)", fontSize:11, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", whiteSpace:"nowrap" }}>Team</th>
              {windows.map(w => {
                const b = windowBounds(w);
                const isCur = w === cur;
                return (
                  <th key={w} style={{ padding:"10px 12px", textAlign:"center", color: isCur ? "#7dd3fc" : "rgba(255,255,255,.6)", fontSize:10, fontWeight:600, letterSpacing:".05em", textTransform:"uppercase", minWidth:80 }}>
                    W{w+1}{isCur ? " ▶" : ""}<br/>
                    <span style={{ fontWeight:400, opacity:.7 }}>{fmtDate(b.start)}–{fmtDate(b.end)}</span>
                  </th>
                );
              })}
              <th style={{ padding:"10px 12px", textAlign:"center", color:"rgba(255,255,255,.75)", fontSize:11, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" }}>🃏</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(t => {
              const compliance = teamCompliance(t.id, rrMatches, jokers, numWindows);
              const jokerUsed  = (jokers[t.id] || []).length > 0;
              const hasMissed  = compliance.some(c => c.missed);
              return (
                <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}` }}
                  onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                  onMouseLeave={e=>e.currentTarget.style.background=C.white}>
                  <td style={{ padding:"11px 16px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:9, height:9, borderRadius:"50%", background:t.color }} />
                      <span style={{ fontWeight:600, fontSize:13, color:C.navy }}>{t.name}</span>
                      {hasMissed && <span style={{ fontSize:11, color:"#b91c1c", fontWeight:600 }}>⚠</span>}
                    </div>
                  </td>
                  {compliance.map(c => {
                    let icon, bg, title;
                    if (c.jokered)      { icon="🃏"; bg="#fefce8"; title="Joker used — window excused"; }
                    else if (c.played)  { icon="✅"; bg="#f0fdf4"; title="Played this window"; }
                    else if (c.missed)  { icon="❌"; bg="#fef2f2"; title="Missed — admin to decide"; }
                    else if (c.isCurrent){ icon="⏳"; bg="#e0f2fe"; title="In progress"; }
                    else                { icon="📅"; bg="transparent"; title="Upcoming"; }
                    return (
                      <td key={c.window} title={title} style={{ padding:"11px 12px", textAlign:"center", background:bg }}>
                        <span style={{ fontSize:16 }}>{icon}</span>
                      </td>
                    );
                  })}
                  <td style={{ padding:"11px 12px", textAlign:"center" }}>
                    <span style={{ fontSize:12, fontWeight:600, color: jokerUsed ? C.textLight : C.green }}>
                      {jokerUsed ? "Used" : "Ready"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(() => {
        const missedNow = teams.filter(t => teamCompliance(t.id, rrMatches, jokers, numWindows).some(c => c.missed));
        if (!missedNow.length) return null;
        return (
          <div style={{ padding:"14px 18px", background:"#fef2f2", border:"1.5px solid #fca5a5", borderRadius:10, display:"flex", gap:12, alignItems:"flex-start" }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight:700, color:"#b91c1c", fontSize:14, marginBottom:6 }}>Teams with missed windows</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {missedNow.map(t => (
                  <span key={t.id} className="pill" style={{ background:t.color+"20", color:t.color }}>{t.name}</span>
                ))}
              </div>
              <div style={{ fontSize:12, color:"#b91c1c", marginTop:8, opacity:.8 }}>Admin to decide penalty for each case.</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

// ── My window status + joker card ─────────────────────────────────────────────
function MyWindowStatus({ session, rrMatches, jokers, onJoker, numWindows }) {
  const [jokerModal, setJokerModal] = useState(false);
  const [targetWin,  setTargetWin]  = useState("");

  const cur        = currentWindow();
  const myJokers   = jokers[session.id] || [];
  const hasJoker   = myJokers.length < JOKERS_PER_TEAM;
  const compliance = teamCompliance(session.id, rrMatches, jokers, numWindows);
  const curStatus  = compliance.find(c => c.isCurrent);
  const missedWindows = compliance.filter(c => c.missed);
  const jokerableWindows = compliance.filter(c => c.isPast && !c.played && !c.jokered);

  function submitJoker() {
    if (targetWin === "") return;
    onJoker(session.id, parseInt(targetWin));
    setJokerModal(false); setTargetWin("");
  }

  return (
    <div className="card" style={{ marginBottom:20, border:`1.5px solid ${session.color}55`, overflow:"hidden" }}>
      <div style={{ background:`${session.color}12`, padding:"12px 18px", borderBottom:`1px solid ${session.color}33`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:"50%", background:session.color }} />
          <span style={{ fontWeight:700, fontSize:14, color:C.navy }}>{session.name} — My Status</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:13, fontWeight:600, color: hasJoker ? C.green : C.textLight }}>
            🃏 Joker: {hasJoker ? "Available" : "Used"}
          </span>
          {hasJoker && jokerableWindows.length > 0 && (
            <button className="btn" onClick={()=>setJokerModal(true)}
              style={{ background:C.navy, color:C.white, padding:"6px 14px", fontSize:12 }}>
              Use Joker 🃏
            </button>
          )}
        </div>
      </div>

      <div style={{ padding:"14px 18px", display:"flex", gap:24, flexWrap:"wrap" }}>
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.textLight, letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>Current Window</div>
          {curStatus
            ? curStatus.played
              ? <div style={{ color:C.green, fontWeight:600, fontSize:14 }}>✅ You've played this window — well done!</div>
              : curStatus.jokered
              ? <div style={{ color:"#a16207", fontWeight:600, fontSize:14 }}>🃏 Joker used — this window is excused</div>
              : <div style={{ color:C.orange, fontWeight:600, fontSize:14 }}>⏳ Play at least 1 match before <strong>{fmtDate(curStatus.bounds.end)}</strong></div>
            : <div style={{ color:C.textLight, fontSize:13 }}>Tournament hasn't started yet</div>
          }
        </div>
        {missedWindows.length > 0 && (
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#b91c1c", letterSpacing:".08em", textTransform:"uppercase", marginBottom:6 }}>Missed ⚠</div>
            {missedWindows.map(c => (
              <div key={c.window} style={{ fontSize:13, color:"#b91c1c" }}>
                Window {c.window+1} ({fmtDate(c.bounds.start)} – {fmtDate(c.bounds.end)})
              </div>
            ))}
          </div>
        )}
      </div>

      {jokerModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(26,34,54,.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(2px)" }} onClick={()=>setJokerModal(false)}>
          <div className="card" style={{ width:380, padding:"28px 26px" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:18, color:C.navy, marginBottom:4 }}>Use Joker Card 🃏</div>
            <div style={{ fontSize:13, color:C.textMid, marginBottom:20 }}>
              Select a missed window to excuse. Your joker waives the penalty for that window. You only get <strong>1 joker</strong> for the whole tournament.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:".08em", textTransform:"uppercase", marginBottom:5 }}>Excuse which window?</div>
                <select value={targetWin} onChange={e=>setTargetWin(e.target.value)} style={{ width:"100%" }}>
                  <option value="">— Select a window —</option>
                  {jokerableWindows.map(c => (
                    <option key={c.window} value={c.window}>
                      Window {c.window+1}: {fmtDate(c.bounds.start)} – {fmtDate(c.bounds.end)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ background:"#fffbf5", border:`1px solid ${C.orange}55`, borderRadius:8, padding:"10px 14px", fontSize:12, color:C.textMid }}>
                ⚠ This is permanent. Once used, your joker cannot be recovered.
              </div>
              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button className="btn" onClick={()=>{setJokerModal(false);setTargetWin("");}} style={{ flex:1, background:C.bg, color:C.textMid, padding:10, fontSize:13, border:`1px solid ${C.border}` }}>Cancel</button>
                <button className="btn" onClick={submitJoker} disabled={targetWin===""} style={{ flex:2, background:targetWin===""?C.border:C.navy, color:C.white, padding:10, fontSize:14 }}>
                  Confirm 🃏
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────────────────
function Leaderboard({ standings, groupDone }) {
  return (
    <div>
      <SectionHead title="Group Stage Standings" sub="Round robin — all 8 teams play each other once" />
      {groupDone && (
        <div style={{ marginBottom:18, padding:"12px 16px", background:"#f0fdf4", border:`1px solid #bbf7d0`, borderRadius:8, color:"#166534", fontSize:13, display:"flex", alignItems:"center", gap:8 }}>
          ✅ All group matches complete! Top 4 teams advance to the knockout bracket.
        </div>
      )}
      <div className="card" style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:C.navy }}>
              {["#","Team","Players","P","W","L","Pts","Pen"].map(h=>(
                <th key={h} style={{ padding:"11px 14px", textAlign:h==="Team"||h==="Players"?"left":"center", color:"rgba(255,255,255,.75)", fontSize:11, fontWeight:600, letterSpacing:".08em", textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((t,i)=>(
              <tr key={t.id} style={{ borderBottom:`1px solid ${C.border}`, transition:"background .12s", background: groupDone && i<4 ? "#fffbf5" : C.white }}
                onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                onMouseLeave={e=>e.currentTarget.style.background= groupDone&&i<4?"#fffbf5":C.white}>
                <td style={{ padding:"13px 14px", textAlign:"center" }}>
                  {i<3 ? ["🥇","🥈","🥉"][i] : <span style={{ color:C.textLight, fontWeight:600, fontSize:13 }}>{i+1}</span>}
                </td>
                <td style={{ padding:"13px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:10, height:10, borderRadius:"50%", background:t.color, flexShrink:0 }} />
                    <span style={{ fontWeight:700, fontSize:14, color:C.navy }}>{t.name}</span>
                    {groupDone && i<4 && <span className="pill" style={{ background:C.orange+"18", color:C.orange }}>ADVANCES</span>}
                  </div>
                </td>
                <td style={{ padding:"13px 14px", color:C.textMid, fontSize:13 }}>{t.players.join(" & ")}</td>
                {[t.played,t.w,t.l].map((v,j)=>(
                  <td key={j} style={{ padding:"13px 14px", textAlign:"center", fontSize:13, color:C.textMid }}>{v}</td>
                ))}
                <td style={{ padding:"13px 14px", textAlign:"center" }}>
                  <span style={{ background:C.orange, color:C.white, borderRadius:6, padding:"3px 11px", fontWeight:700, fontSize:14 }}>{t.pts}</span>
                </td>
                <td style={{ padding:"13px 14px", textAlign:"center" }}>
                  {t.penalty > 0
                    ? <span style={{ background:"#fef2f2", color:"#b91c1c", borderRadius:6, padding:"3px 10px", fontWeight:700, fontSize:13 }}>−{t.penalty}</span>
                    : <span style={{ color:C.textLight, fontSize:13 }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop:10, display:"flex", gap:16, flexWrap:"wrap", color:C.textLight, fontSize:11 }}>
        {["P=Played","W=Win","L=Loss","Pts=Points","Pen=Penalty deduction"].map(l=><span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

// ── Group Stage Matches ───────────────────────────────────────────────────────
function Matches({ rrMatches, teamMap, session, onSubmit }) {
  const mine = session ? rrMatches.filter(m=>m.teamA===session.id||m.teamB===session.id) : [];
  const done = rrMatches.filter(m=>m.scoreA!==null).length;
  return (
    <div>
      <SectionHead title="Group Stage Matches" sub={`${done} of ${rrMatches.length} matches played`} />
      {session && mine.length>0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ fontSize:12, fontWeight:700, color:C.orange, letterSpacing:".08em", textTransform:"uppercase", marginBottom:10 }}>Your Matches</div>
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {mine.map(m=><MatchCard key={m.id} match={m} teamMap={teamMap} session={session} onSubmit={onSubmit} highlight />)}
          </div>
          <div style={{ margin:"24px 0 12px", height:1, background:C.border }} />
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {rrMatches.map(m=><MatchCard key={m.id} match={m} teamMap={teamMap} session={session} onSubmit={onSubmit} />)}
      </div>
    </div>
  );
}

function MatchCard({ match, teamMap, session, onSubmit, highlight }) {
  const [editing,setEditing]=useState(false);
  const [sA,setSA]=useState(""); const [sB,setSB]=useState("");
  const tA=teamMap[match.teamA], tB=teamMap[match.teamB];
  const canEdit=session&&(session.id===match.teamA||session.id===match.teamB);
  const played=match.scoreA!==null;
  function submit(){ const a=parseInt(sA),b=parseInt(sB); if(isNaN(a)||isNaN(b)||a<0||b<0)return; onSubmit(match.id,a,b); setEditing(false); }

  return (
    <div className="card" style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:10, borderLeft: highlight?`3px solid ${C.orange}`:"3px solid transparent" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
        <span style={{ fontWeight:600, fontSize:13, color:C.navy, textAlign:"right" }}>{tA?.name}</span>
        <div style={{ width:9, height:9, borderRadius:"50%", background:tA?.color||C.border, flexShrink:0 }} />
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:112, justifyContent:"center" }}>
        {editing ? (
          <>
            <input type="number" min="0" max="99" value={sA} onChange={e=>setSA(e.target.value)} style={{ width:44, textAlign:"center", padding:"5px 4px" }} />
            <span style={{ color:C.border, fontWeight:600 }}>–</span>
            <input type="number" min="0" max="99" value={sB} onChange={e=>setSB(e.target.value)} style={{ width:44, textAlign:"center", padding:"5px 4px" }} />
          </>
        ) : played ? (
          <div style={{ display:"flex", gap:6, alignItems:"center", background:C.bg, borderRadius:8, padding:"4px 12px" }}>
            <span style={{ fontSize:18, fontWeight:800, color: match.scoreA>match.scoreB?C.orange:match.scoreA<match.scoreB?C.textLight:C.textMid }}>{match.scoreA}</span>
            <span style={{ color:C.border }}>–</span>
            <span style={{ fontSize:18, fontWeight:800, color: match.scoreB>match.scoreA?C.orange:match.scoreB<match.scoreA?C.textLight:C.textMid }}>{match.scoreB}</span>
          </div>
        ) : (
          <div style={{ background:C.bg, borderRadius:8, padding:"5px 16px", color:C.textLight, fontSize:12, fontWeight:500 }} className="pulse">vs</div>
        )}
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
        <div style={{ width:9, height:9, borderRadius:"50%", background:tB?.color||C.border, flexShrink:0 }} />
        <span style={{ fontWeight:600, fontSize:13, color:C.navy }}>{tB?.name}</span>
      </div>

      {match.wa && (
        <a href={match.wa} target="_blank" rel="noopener noreferrer" className="wa-btn" title="Open WhatsApp group">
          <WAIcon size={16} />
        </a>
      )}

      {canEdit && (
        editing
          ? <div style={{ display:"flex", gap:6, flexShrink:0 }}>
              <button className="btn" onClick={submit} style={{ background:C.green, color:C.white, padding:"6px 12px", fontSize:12 }}>✓ Save</button>
              <button className="btn" onClick={()=>setEditing(false)} style={{ background:C.bg, color:C.textMid, padding:"6px 10px", fontSize:12, border:`1px solid ${C.border}` }}>✕</button>
            </div>
          : <button className="btn" onClick={()=>{setEditing(true);setSA(match.scoreA??"");setSB(match.scoreB??"");}}
              style={{ background: played?C.orange+"18":C.orange, color: played?C.orange:C.white, padding:"6px 13px", fontSize:12, border: played?`1px solid ${C.orange}40`:"none", flexShrink:0 }}>
              {played?"Edit":"Post Score"}
            </button>
      )}
    </div>
  );
}

// ── Bracket ───────────────────────────────────────────────────────────────────
function Bracket({ knockout, teamMap, session, onSubmit, groupDone, standings }) {
  if (!groupDone) {
    const fin=standings.filter(t=>t.played===7).length;
    return (
      <div style={{ textAlign:"center", padding:"48px 20px" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>🔒</div>
        <div style={{ fontWeight:800, fontSize:20, color:C.navy, marginBottom:8 }}>Bracket Locked</div>
        <div style={{ color:C.textMid, fontSize:14, marginBottom:28 }}>Complete all 28 group matches to unlock the knockout stage.</div>
        <div className="card" style={{ display:"inline-flex", flexDirection:"column", alignItems:"center", padding:"18px 40px" }}>
          <div style={{ color:C.textLight, fontSize:11, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>Teams finished</div>
          <div style={{ fontSize:36, fontWeight:800, color:C.orange }}>{fin}<span style={{ color:C.textLight }}>/8</span></div>
        </div>
      </div>
    );
  }
  const sf1=knockout.find(m=>m.id==="sf1"), sf2=knockout.find(m=>m.id==="sf2");
  const tp=knockout.find(m=>m.id==="tp"),   fin=knockout.find(m=>m.id==="f1");
  return (
    <div>
      <SectionHead title="Knockout Bracket" sub="Top 4 from group stage advance" />

      <div className="card" style={{ padding:"24px 20px", marginBottom:24, overflowX:"auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 52px 1fr", alignItems:"center", minWidth:500 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <BracketSlot match={sf1} teamMap={teamMap} title="Semi-Final 1" sub="1st vs 4th" />
            <BracketSlot match={sf2} teamMap={teamMap} title="Semi-Final 2" sub="2nd vs 3rd" />
          </div>
          <div style={{ position:"relative", alignSelf:"stretch" }}>
            <svg width="52" height="100%" style={{ position:"absolute", inset:0, overflow:"visible" }}>
              <line x1="0" y1="25%" x2="26" y2="25%" stroke={C.border} strokeWidth="2"/>
              <line x1="26" y1="25%" x2="26" y2="75%" stroke={C.border} strokeWidth="2"/>
              <line x1="0" y1="75%" x2="26" y2="75%" stroke={C.border} strokeWidth="2"/>
              <line x1="26" y1="50%" x2="52" y2="50%" stroke={C.orange} strokeWidth="2"/>
            </svg>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <BracketSlot match={fin} teamMap={teamMap} title="🏆 Final" sub="Winners" gold />
            <BracketSlot match={tp}  teamMap={teamMap} title="3rd Place" sub="Losers" />
          </div>
        </div>
      </div>

      <SectionHead title="Post Knockout Scores" />
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[sf1,sf2,tp,fin].map(m=>m&&<KOCard key={m.id} match={m} teamMap={teamMap} session={session} onSubmit={onSubmit} />)}
      </div>
    </div>
  );
}

function BracketSlot({ match, teamMap, title, sub, gold }) {
  const tA=teamMap[match?.teamA], tB=teamMap[match?.teamB];
  const played=match?.scoreA!==null;
  const winA=played&&match.scoreA>match.scoreB, winB=played&&match.scoreB>match.scoreA;
  return (
    <div>
      <div style={{ fontSize:11, fontWeight:700, color: gold?C.orange:C.textLight, letterSpacing:".08em", textTransform:"uppercase", marginBottom:6, textAlign:"center" }}>
        {title} <span style={{ color:C.border }}>·</span> <span style={{ color:C.textLight, fontWeight:400 }}>{sub}</span>
      </div>
      <div style={{ background: gold?"#fffbf5":C.bg, border:`1.5px solid ${gold?C.orange+"44":C.border}`, borderRadius:10, padding:"12px 16px" }}>
        {[{t:tA,s:match?.scoreA,win:winA},{t:tB,s:match?.scoreB,win:winB}].map(({t,s,win},i)=>(
          <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"7px 0", borderBottom:i===0?`1px solid ${C.border}`:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:t?.color||C.border }} />
              <span style={{ fontSize:13, fontWeight:600, color:t?C.navy:C.textLight }}>{t?.name||"TBD"}</span>
            </div>
            {played && <span style={{ fontSize:18, fontWeight:800, color:win?(gold?C.orange:C.green):C.textLight }}>{s}</span>}
          </div>
        ))}
        {!played && <div style={{ textAlign:"center", marginTop:8, fontSize:11, color:C.textLight }} className={match?.teamA&&match?.teamB?"pulse":""}>{match?.teamA&&match?.teamB?"Awaiting score":"Awaiting teams"}</div>}
      </div>
    </div>
  );
}

function KOCard({ match, teamMap, session, onSubmit }) {
  const [editing,setEditing]=useState(false);
  const [sA,setSA]=useState(""); const [sB,setSB]=useState("");
  const tA=teamMap[match.teamA], tB=teamMap[match.teamB];
  const canEdit=session&&(session.id===match.teamA||session.id===match.teamB);
  const ready=match.teamA&&match.teamB, played=match.scoreA!==null;
  function submit(){ const a=parseInt(sA),b=parseInt(sB); if(isNaN(a)||isNaN(b)||a<0||b<0||a===b)return; onSubmit(match.id,a,b); setEditing(false); }
  return (
    <div className="card" style={{ padding:"12px 16px", display:"flex", alignItems:"center", gap:10, opacity:ready?1:0.4 }}>
      <div style={{ fontSize:11, fontWeight:700, color:C.textLight, letterSpacing:".08em", textTransform:"uppercase", minWidth:80 }}>{match.label}</div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, justifyContent:"flex-end" }}>
        <span style={{ fontWeight:600, fontSize:13, color:C.navy }}>{tA?.name||"TBD"}</span>
        <div style={{ width:8, height:8, borderRadius:"50%", background:tA?.color||C.border }} />
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6, minWidth:112, justifyContent:"center" }}>
        {editing ? (
          <>
            <input type="number" min="0" max="99" value={sA} onChange={e=>setSA(e.target.value)} style={{ width:44, textAlign:"center", padding:"5px 4px" }} />
            <span style={{ color:C.border }}>–</span>
            <input type="number" min="0" max="99" value={sB} onChange={e=>setSB(e.target.value)} style={{ width:44, textAlign:"center", padding:"5px 4px" }} />
          </>
        ) : played ? (
          <div style={{ display:"flex", gap:6, alignItems:"center", background:C.bg, borderRadius:8, padding:"4px 12px" }}>
            <span style={{ fontSize:18, fontWeight:800, color:match.scoreA>match.scoreB?C.orange:C.textLight }}>{match.scoreA}</span>
            <span style={{ color:C.border }}>–</span>
            <span style={{ fontSize:18, fontWeight:800, color:match.scoreB>match.scoreA?C.orange:C.textLight }}>{match.scoreB}</span>
          </div>
        ) : (
          <div style={{ background:C.bg, borderRadius:8, padding:"5px 16px", color:C.textLight, fontSize:12 }} className={ready?"pulse":""}>vs</div>
        )}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
        <div style={{ width:8, height:8, borderRadius:"50%", background:tB?.color||C.border }} />
        <span style={{ fontWeight:600, fontSize:13, color:C.navy }}>{tB?.name||"TBD"}</span>
      </div>
      {canEdit&&ready&&(
        editing
          ?<div style={{ display:"flex", gap:6, flexShrink:0, alignItems:"center" }}>
              <span style={{ fontSize:11, color:C.textLight }}>No draws</span>
              <button className="btn" onClick={submit} style={{ background:C.green, color:C.white, padding:"6px 12px", fontSize:12 }}>✓</button>
              <button className="btn" onClick={()=>setEditing(false)} style={{ background:C.bg, color:C.textMid, padding:"6px 10px", fontSize:12, border:`1px solid ${C.border}` }}>✕</button>
            </div>
          :<button className="btn" onClick={()=>{setEditing(true);setSA(match.scoreA??"");setSB(match.scoreB??"");}}
              style={{ background:played?C.orange+"18":C.orange, color:played?C.orange:C.white, padding:"6px 13px", fontSize:12, border:played?`1px solid ${C.orange}40`:"none", flexShrink:0 }}>
              {played?"Edit":"Post Score"}
            </button>
      )}
    </div>
  );
}

// ── Teams ─────────────────────────────────────────────────────────────────────
function Teams({ teams, rrMatches }) {
  return (
    <div>
      <SectionHead title="Registered Teams" sub="8 teams competing in the Padel Cup" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:14 }}>
        {teams.map(t=>{
          const tm=rrMatches.filter(m=>(m.teamA===t.id||m.teamB===t.id)&&m.scoreA!==null);
          const wins=tm.filter(m=>(m.teamA===t.id&&m.scoreA>m.scoreB)||(m.teamB===t.id&&m.scoreB>m.scoreA)).length;
          return (
            <div key={t.id} className="card" style={{ padding:18, borderTop:`3px solid ${t.color}`, transition:"box-shadow .15s" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 16px rgba(26,34,54,.1)"}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=""}>
              <div style={{ fontWeight:700, fontSize:15, color:C.navy, marginBottom:4 }}>{t.name}</div>
              <div style={{ color:C.textMid, fontSize:12, marginBottom:16 }}>{t.players.join(" & ")}</div>
              <div style={{ display:"flex", gap:0, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                {[["Played",tm.length,C.textMid],["Wins",wins,t.color],["Pts",wins*3,C.orange]].map(([l,v,col])=>(
                  <div key={l} style={{ flex:1, textAlign:"center" }}>
                    <div style={{ fontSize:20, fontWeight:800, color:col }}>{v}</div>
                    <div style={{ fontSize:11, color:C.textLight, textTransform:"uppercase", letterSpacing:".06em" }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────────────────────
function Chat({ messages, teamMap, session, onSend }) {
  const [text,setText]=useState("");
  const endRef=useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  return (
    <div>
      <SectionHead title="Team Chat" sub="Only logged-in teams can send messages" />
      <div className="card" style={{ height:380, overflowY:"auto", padding:16, display:"flex", flexDirection:"column", gap:12, marginBottom:12 }}>
        {messages.map(m=>{
          const t=teamMap[m.teamId];
          return (
            <div key={m.id} style={{ display:"flex", gap:10 }}>
              <div style={{ width:32, height:32, borderRadius:"50%", background:t?.color||C.border, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:C.white }}>
                {t?.name?.[0]}
              </div>
              <div style={{ background:C.bg, borderRadius:"0 10px 10px 10px", padding:"10px 14px", maxWidth:"80%" }}>
                <div style={{ display:"flex", gap:8, alignItems:"baseline", marginBottom:4 }}>
                  <span style={{ fontWeight:700, fontSize:13, color:t?.color||C.navy }}>{t?.name}</span>
                  <span style={{ fontSize:10, color:C.textLight }}>{new Date(m.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
                </div>
                <div style={{ fontSize:14, color:C.text, lineHeight:1.5 }}>{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {session
        ?<div style={{ display:"flex", gap:10 }}>
            <input value={text} onChange={e=>setText(e.target.value)} style={{ flex:1 }}
              onKeyDown={e=>{if(e.key==="Enter"){onSend(text);setText("");}}}
              placeholder="Say something to the group…" />
            <button className="btn" onClick={()=>{onSend(text);setText("");}}
              style={{ background:C.orange, color:C.white, padding:"9px 20px", fontSize:14, flexShrink:0 }}>Send</button>
          </div>
        :<div style={{ textAlign:"center", color:C.textLight, fontSize:13, padding:14, background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
            Login as your team to participate in the chat
          </div>
      }
    </div>
  );
}

// ── Rules ─────────────────────────────────────────────────────────────────────
const RULES = [
  {
    icon: "🏟️",
    en: { title: "The Court", body: "The court is a rectangle 10 m wide by 20 m long, divided in half by a net. Service lines run parallel to the net at 6.95 m on each side, with a central service line dividing each service box in two. The court is enclosed by walls and metallic fencing, which are part of play." },
    cs: { title: "Hřiště", body: "Hřiště je obdélník šířky 10 m a délky 20 m, rozdělený sítí na dvě poloviny. Servisní čáry jsou rovnoběžné se sítí ve vzdálenosti 6,95 m, středová servisní čára pak dělí každé servisní pole na dvě části. Hřiště je ohrazeno stěnami a kovovým pletivem, které jsou součástí hry." },
  },
  {
    icon: "👥",
    en: { title: "Players & Sides", body: "Padel is always played in pairs (doubles). Each pair occupies one side of the court. Players change ends after every odd-numbered game. Maximum rest time between games is 90 seconds; after the first game of each set and during a tie-break, play is continuous with no rest." },
    cs: { title: "Hráči a strany", body: "Padel se hraje vždy ve čtyřhře (debl). Každý pár obsazuje jednu stranu hřiště. Hráči střídají strany po každé liché hře. Maximální pauza mezi hrami je 90 sekund; po první hře každého setu a během tie-breaku se hraje bez přerušení." },
  },
  {
    icon: "🎯",
    en: { title: "Scoring", body: "Scoring follows tennis: 15, 30, 40, Game. At deuce (40–40) a pair must win two consecutive points to take the game. Sets are won by the first pair to reach 6 games with a 2-game lead; at 6–6 a tie-break is played. Matches are best of 3 sets." },
    cs: { title: "Počítání", body: "Skóre se počítá jako v tenise: 15, 30, 40, hra. Při rovnosti (40–40) musí pár získat dvě po sobě jdoucí body. Set vyhraje pár, který jako první dosáhne 6 her s rozdílem 2 her; při stavu 6–6 se hraje tie-break. Zápasy se hrají na dva vítězné sety ze tří." },
  },
  {
    icon: "🏓",
    en: { title: "The Serve", body: "The server stands behind the service line, between the central service line and the side wall. The ball must be dropped and struck below waist height. It must bounce in the diagonally opposite service box. One fault is allowed; two faults (double fault) loses the point. At deuce a single serve is used (no second chance)." },
    cs: { title: "Podání", body: "Podávající stojí za servisní čárou mezi středovou servisní čárou a boční stěnou. Míč musí být upuštěn a odehrán pod úrovní pasu. Musí dopadnout do diagonálně protilehlého servisního pole. Jedna chyba je povolena; dvě chyby (dvojchyba) znamenají ztrátu bodu. Při rovnosti platí jediné podání." },
  },
  {
    icon: "🔄",
    en: { title: "Ball in Play — Walls", body: "After the serve, the ball may be played off the back and side walls on your own side before it bounces a second time. A return is valid if the ball passes over the net and lands in the opponent's court, and may then hit their walls. The ball must not bounce twice on the floor before being returned." },
    cs: { title: "Míč ve hře — stěny", body: "Po podání lze míč odehrávat od zadních a bočních stěn na vlastní straně, dokud neskočí podruhé na zemi. Odpal je platný, pokud míč přeletí přes síť a dopadne na stranu soupeře, kde pak může narážet do stěn. Míč nesmí skočit dvakrát na zemi, než jej hráč odehraje." },
  },
  {
    icon: "🚪",
    en: { title: "Out-of-Court Play", body: "A player may exit the court through the access gates to retrieve a ball that has passed through or over the fencing, and play it back into the court. Both players on the same team may leave the court. The point continues normally." },
    cs: { title: "Hra mimo hřiště", body: "Hráč může opustit hřiště přes přístupové brány, aby dosáhl na míč, který prošel nebo přelétl přes oplocení, a vrátit jej zpět do hřiště. Oba hráči stejného páru mohou hřiště opustit. Hra pokračuje normálně." },
  },
  {
    icon: "❌",
    en: { title: "Losing a Point", body: "A point is lost if: the ball bounces twice on your side; you hit the ball into the net or out of bounds; the ball touches your body or clothing; you touch the net or your opponent's court; the ball hits a player before crossing the net; or you deliberately distract your opponents." },
    cs: { title: "Ztráta bodu", body: "Bod se ztrácí, pokud: míč dvakrát odskočí na vaší straně; odehrajete míč do sítě nebo mimo hřiště; míč se dotkne vašeho těla nebo oblečení; dotknete se sítě nebo hřiště soupeře; míč zasáhne hráče dříve, než přelétne síť; nebo záměrně rušíte soupeře." },
  },
  {
    icon: "🎾",
    en: { title: "Equipment", body: "The padel racket may not exceed 45.5 cm in total length. The hitting surface must be perforated with cylindrical holes of 9–13 mm. The ball is a rubber sphere 6.35–6.77 cm in diameter, weighing 56–59.4 g, approved by the FIP. Players must wear appropriate sportswear at all times." },
    cs: { title: "Vybavení", body: "Padelová raketa nesmí přesáhnout celkovou délku 45,5 cm. Hrací plocha musí být perforována válcovými otvory průměru 9–13 mm. Míč je gumová koule průměru 6,35–6,77 cm a hmotnosti 56–59,4 g, schválená FIP. Hráči musí mít po celou dobu vhodné sportovní oblečení." },
  },
  {
    icon: "🤝",
    en: { title: "Conduct & Fair Play", body: "All players must compete to the best of their ability at all times. Aggressive behaviour, verbal abuse, or unsportsmanlike conduct towards opponents, partners, or officials is strictly prohibited and may be penalised. Players must be ready to play within 10 minutes of the scheduled start time or risk a walkover." },
    cs: { title: "Chování a fair play", body: "Všichni hráči musí po celou dobu soutěžit co nejlépe. Agresivní chování, slovní napadení nebo nesportovní jednání vůči soupeřům, spoluhráčům nebo rozhodčím je přísně zakázáno a může být potrestáno. Hráči musí být připraveni k hrát do 10 minut od plánovaného začátku, jinak hrozí kontumace." },
  },
  {
    icon: "⏱️",
    en: { title: "Time Between Points", body: "A maximum of 20 seconds is allowed between points. A maximum of 90 seconds is allowed when changing ends. At the end of each set, a maximum rest period of 120 seconds is granted. Matches must be played continuously — no stoppages to receive coaching or recover energy." },
    cs: { title: "Čas mezi body", body: "Mezi body je povoleno maximálně 20 sekund. Při střídání stran je povoleno maximálně 90 sekund. Na konci každého setu je poskytnuta maximální přestávka 120 sekund. Zápasy musí probíhat bez přerušení — není dovoleno zastavovat hru pro přijímání rad nebo regeneraci." },
  },
];

// ── Courts (availability) ─────────────────────────────────────────────────────
function CourtsTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [duration, setDuration] = useState(90);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);

  async function load(d, dur) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/availability?date=${d}&duration=${dur}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setVenues(await res.json());
      setLoaded(true);
    } catch {
      setError("Could not load availability. Make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  }

  function handleDateChange(e) {
    setDate(e.target.value);
    if (loaded) load(e.target.value, duration);
  }

  function handleDurationChange(d) {
    setDuration(d);
    if (loaded) load(date, d);
  }

  function bookingUrl(venue) {
    if (venue.todayOnly) return venue.url;
    let url = venue.url.includes('?')
      ? `${venue.url}&date=${date}`
      : `${venue.url}?date=${date}`;
    if (venue.id === 'padel-powers-smichov') url += `&playingTimes=${duration}`;
    return url;
  }

  function filteredSlots(venue) {
    const isToday = date === today;
    const now = isToday
      ? `${String(new Date().getHours()).padStart(2,'0')}:${String(new Date().getMinutes()).padStart(2,'0')}`
      : null;

    if (venue.todayOnly) {
      return venue.slots.filter(s => !isToday || s.time > now);
    }
    const seen = new Set();
    return venue.slots.filter(s => {
      if (s.duration !== duration) return false;
      if (isToday && s.time <= now) return false;
      if (seen.has(s.time)) return false;
      seen.add(s.time);
      return true;
    });
  }

  return (
    <div>
      <SectionHead title="Court Availability" sub="Check open padel slots in Prague arenas" />

      {/* Controls */}
      <div className="card" style={{ padding:"16px 20px", marginBottom:20, display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>Date</div>
          <input type="date" value={date} onChange={handleDateChange} style={{ fontSize:14, width:160 }} />
        </div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMid, textTransform:"uppercase", letterSpacing:".06em", marginBottom:5 }}>Duration</div>
          <div style={{ display:"flex", gap:6 }}>
            {[60, 90, 120].map(d => (
              <button key={d} className="btn" onClick={() => handleDurationChange(d)} style={{
                background: duration === d ? C.orange : C.bg,
                color: duration === d ? C.white : C.textMid,
                padding:"7px 14px", fontSize:13,
                border:`1px solid ${duration === d ? C.orange : C.border}`,
              }}>{d} min</button>
            ))}
          </div>
        </div>
        <button className="btn" onClick={() => load(date, duration)} style={{ background:C.navy, color:C.white, padding:"8px 18px", fontSize:13 }}>
          {loading ? "Loading…" : "↻ Check"}
        </button>
      </div>

      {error && (
        <div className="card" style={{ padding:"16px 20px", marginBottom:16, borderLeft:`4px solid ${C.red}` }}>
          <div style={{ color:C.red, fontWeight:600, fontSize:14 }}>Error</div>
          <div style={{ color:C.textMid, fontSize:13, marginTop:4 }}>{error}</div>
        </div>
      )}

      {!loaded && !loading && !error && (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.textLight, fontSize:14 }}>
          Select a date and press <strong>Check</strong> to load availability.
        </div>
      )}

      {loading && (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.textMid, fontSize:14 }}>
          <span className="pulse">Checking courts…</span>
        </div>
      )}

      {!loading && loaded && venues.map(venue => {
        const slots = filteredSlots(venue);
        return (
          <div key={venue.id} className="card" style={{ marginBottom:14, overflow:"hidden" }}>
            <div style={{ padding:"13px 18px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <div style={{ fontWeight:700, fontSize:15, color:C.navy }}>{venue.name}</div>
                {venue.todayOnly && (
                  <div style={{ fontSize:11, color:C.textLight, marginTop:2 }}>Today's availability only · can't select other dates</div>
                )}
              </div>
              <a href={bookingUrl(venue)} target="_blank" rel="noreferrer"
                style={{ fontSize:13, color:C.orange, fontWeight:600, textDecoration:"none", padding:"6px 14px", background:C.orange+"12", borderRadius:6, border:`1px solid ${C.orange}30` }}>
                Book →
              </a>
            </div>
            <div style={{ padding:"14px 18px" }}>
              {slots.length === 0 ? (
                <div style={{ color:C.textLight, fontSize:13 }}>No available slots</div>
              ) : (
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {slots.map((slot, i) => (
                    <a key={i} href={bookingUrl(venue)} target="_blank" rel="noreferrer" style={{ textDecoration:"none" }}>
                      <div style={{
                        background:C.green+"18", border:`1.5px solid ${C.green}50`,
                        borderRadius:8, padding:"7px 14px",
                        fontSize:13, fontWeight:600, color:C.green,
                        cursor:"pointer", transition:"all .15s",
                        display:"flex", alignItems:"center", gap:6,
                      }}>
                        {slot.time}
                        {slot.price
                          ? <span style={{ fontSize:11, color:C.textMid, fontWeight:400 }}>{slot.price}</span>
                          : slot.courts > 1
                            ? <span style={{ fontSize:11, color:C.textMid, fontWeight:400 }}>{slot.courts} courts free</span>
                            : null
                        }
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Rules() {
  const [lang, setLang] = useState("both");

  return (
    <div>
      <SectionHead title="Rules of Padel" sub="Official rules based on the International Padel Federation (FIP) — updated 2026" />

      <div style={{ display:"flex", gap:8, marginBottom:24, alignItems:"center" }}>
        <span style={{ fontSize:13, color:C.textMid, fontWeight:600 }}>Display:</span>
        {[["both","🇬🇧 EN + 🇨🇿 CS"],["en","🇬🇧 English only"],["cs","🇨🇿 Česky only"]].map(([val,label])=>(
          <button key={val} className="btn" onClick={()=>setLang(val)}
            style={{ padding:"6px 14px", fontSize:13, background: lang===val ? C.orange : C.bg, color: lang===val ? C.white : C.textMid, border:`1px solid ${lang===val ? C.orange : C.border}` }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {RULES.map((rule, i) => (
          <div key={i} className="card" style={{ padding:0, overflow:"hidden" }}>
            <div style={{ background:C.navy, padding:"12px 18px", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>{rule.icon}</span>
              {(lang==="en"||lang==="both") && (
                <span style={{ fontWeight:700, fontSize:15, color:C.white }}>{rule.en.title}</span>
              )}
              {lang==="both" && <span style={{ color:"rgba(255,255,255,.3)", fontSize:13 }}>/</span>}
              {(lang==="cs"||lang==="both") && (
                <span style={{ fontWeight:700, fontSize:15, color: lang==="both" ? "rgba(255,255,255,.65)" : C.white }}>{rule.cs.title}</span>
              )}
            </div>

            <div style={{ display:"grid", gridTemplateColumns: lang==="both" ? "1fr 1fr" : "1fr", gap:0 }}>
              {(lang==="en"||lang==="both") && (
                <div style={{ padding:"14px 18px", borderRight: lang==="both" ? `1px solid ${C.border}` : "none" }}>
                  {lang==="both" && (
                    <div style={{ fontSize:10, fontWeight:700, color:C.orange, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>🇬🇧 English</div>
                  )}
                  <p style={{ fontSize:14, color:C.text, lineHeight:1.65 }}>{rule.en.body}</p>
                </div>
              )}
              {(lang==="cs"||lang==="both") && (
                <div style={{ padding:"14px 18px", background: lang==="both" ? "#fafbfc" : C.white }}>
                  {lang==="both" && (
                    <div style={{ fontSize:10, fontWeight:700, color:C.navy, letterSpacing:".1em", textTransform:"uppercase", marginBottom:6 }}>🇨🇿 Česky</div>
                  )}
                  <p style={{ fontSize:14, color:C.text, lineHeight:1.65 }}>{rule.cs.body}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:20, padding:"12px 16px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:8, fontSize:12, color:C.textLight, display:"flex", gap:8, alignItems:"center" }}>
        <span>📋</span>
        <span>Based on the official FIP Rules of Padel (2026 revision). For the complete rulebook visit <strong style={{ color:C.navy }}>padelfip.com</strong>.</span>
      </div>
    </div>
  );
}

// ── Admin ─────────────────────────────────────────────────────────────────────
function Admin({ teams, rrMatches, jokers, penalties, onUpdatePlayers, onUpdateName, onPenalty }) {
  const [editing, setEditing] = useState(null);
  const [draft,   setDraft]   = useState({});
  const [saved,   setSaved]   = useState(null);
  const numWindows = Math.max(currentWindow() + 3, 4);

  function startEdit(t) {
    setEditing(t.id);
    setDraft({ name: t.name, p0: t.players[0] || "", p1: t.players[1] || "" });
    setSaved(null);
  }
  function save(t) {
    if (draft.name.trim())  onUpdateName(t.id, draft.name.trim());
    onUpdatePlayers(t.id, [draft.p0.trim(), draft.p1.trim()].filter(Boolean));
    setSaved(t.id);
    setEditing(null);
    setTimeout(() => setSaved(null), 2000);
  }

  return (
    <div>
      <SectionHead title="Admin Panel" sub="Logged in as EWP — edit team names, rosters and penalties" />

      {/* ── Penalties ── */}
      <div className="card" style={{ padding:"18px 20px", marginBottom:24 }}>
        <div style={{ fontWeight:700, fontSize:15, color:C.navy, marginBottom:4 }}>Point Deductions</div>
        <div style={{ fontSize:13, color:C.textMid, marginBottom:16 }}>Set penalty points per team. Deducted from standings automatically.</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {teams.map(t => {
            const compliance = teamCompliance(t.id, rrMatches, jokers, numWindows);
            const missed = compliance.filter(c => c.missed);
            return (
              <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:C.bg, borderRadius:8, border:`1px solid ${C.border}` }}>
                <div style={{ width:9, height:9, borderRadius:"50%", background:t.color, flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <span style={{ fontWeight:600, fontSize:13, color:C.navy }}>{t.name}</span>
                  {missed.length > 0 && (
                    <span style={{ marginLeft:8, fontSize:11, color:"#b91c1c", fontWeight:600 }}>
                      ⚠ {missed.length} missed window{missed.length>1?"s":""}
                    </span>
                  )}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <span style={{ fontSize:13, color:C.textMid }}>−</span>
                  <input
                    type="number" min="0" max="99"
                    value={penalties[t.id] || 0}
                    onChange={e => onPenalty(t.id, Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ width:60, textAlign:"center", padding:"6px 8px" }}
                  />
                  <span style={{ fontSize:13, color:C.textMid }}>pts</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Team Editor ── */}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {teams.map(t => {
          const isEditing = editing === t.id;
          const justSaved = saved === t.id;
          return (
            <div key={t.id} className="card" style={{ padding:"14px 18px", borderLeft:`4px solid ${t.color}` }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>

                {isEditing ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:10, flex:1 }}>
                    <div>
                      <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Team Name</div>
                      <input value={draft.name} onChange={e=>setDraft(d=>({...d, name:e.target.value}))} style={{ width:"100%", maxWidth:320 }} />
                    </div>
                    <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                      <div style={{ flex:1, minWidth:160 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Player 1</div>
                        <input value={draft.p0} onChange={e=>setDraft(d=>({...d, p0:e.target.value}))} style={{ width:"100%" }} />
                      </div>
                      <div style={{ flex:1, minWidth:160 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:".06em", textTransform:"uppercase", marginBottom:4 }}>Player 2</div>
                        <input value={draft.p1} onChange={e=>setDraft(d=>({...d, p1:e.target.value}))} style={{ width:"100%" }} />
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn" onClick={()=>save(t)} style={{ background:C.green, color:C.white, padding:"7px 18px", fontSize:13 }}>✓ Save</button>
                      <button className="btn" onClick={()=>setEditing(null)} style={{ background:C.bg, color:C.textMid, padding:"7px 14px", fontSize:13, border:`1px solid ${C.border}` }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                      <div style={{ width:10, height:10, borderRadius:"50%", background:t.color }} />
                      <span style={{ fontWeight:700, fontSize:15, color:C.navy }}>{t.name}</span>
                      {t.isAdmin && <span style={{ fontSize:11, background:C.navy+"15", color:C.navy, padding:"2px 8px", borderRadius:20, fontWeight:600 }}>ADMIN</span>}
                      {justSaved && <span style={{ fontSize:12, color:C.green, fontWeight:600 }}>✓ Saved</span>}
                    </div>
                    <div style={{ fontSize:13, color:C.textMid }}>{t.players.join(" & ")}</div>
                  </div>
                )}

                {!isEditing && (
                  <button className="btn" onClick={()=>startEdit(t)}
                    style={{ background:C.orange+"18", color:C.orange, padding:"7px 16px", fontSize:13, border:`1px solid ${C.orange}40`, flexShrink:0 }}>
                    Edit
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
