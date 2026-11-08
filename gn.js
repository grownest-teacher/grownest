// GrowNest shared settings and helpers
const GN_URL = "https://gvhzbxpgebgjnegdiijp.supabase.co";
const GN_KEY = "sb_publishable_aEQ4MVt00kNu8PaVtrNnqQ_9guhxPYM";
const sb = window.supabase.createClient(GN_URL, GN_KEY);
const SITE = location.origin + location.pathname.replace(/[^/]*$/, "");
const $ = id => document.getElementById(id);
function esc(s){return String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function showMsg(el, text, type="info"){el.className="msg "+type; el.textContent=text; el.classList.remove("hide");}
function friendly(err){
  const m = (err && err.message) || String(err);
  if (/Invalid login/i.test(m)) return "The email or password is not correct.";
  if (/already registered|already been registered/i.test(m)) return "An account with this email already exists. Please sign in instead.";
  if (/Password should be/i.test(m)) return "Please choose a password with at least 8 characters.";
  if (/rate limit/i.test(m)) return "Too many emails were sent in a short time. Please wait a few minutes and try again.";
  if (/Email not confirmed/i.test(m)) return "Please confirm your email first using the link we sent you.";
  return m;
}

// Make sure the person is signed in, approved and their school is active. Returns {user, staff, school}.
async function requireStaff(){
  const {data:{session}} = await sb.auth.getSession();
  if(!session){ location.href = "login.html"; return null; }
  const {data:staff} = await sb.from("staff").select("*, schools(*)").eq("id", session.user.id).maybeSingle();
  if(!staff || !staff.active || !staff.schools || staff.schools.status !== "active"){ location.href = "app.html"; return null; }
  return {user: session.user, staff, school: staff.schools};
}
async function signOut(){ await sb.auth.signOut(); location.href = "index.html"; }

// Six-point MOE scale
const LEVELS = [
  {n:6, name:"Outstanding", bg:"#4F8A4B", fg:"#FFFFFF"},
  {n:5, name:"Very good",   bg:"#8BBF86", fg:"#1E3A1C"},
  {n:4, name:"Good",        bg:"#CFE6CA", fg:"#1E3A1C"},
  {n:3, name:"Acceptable",  bg:"#F6D892", fg:"#4A3500"},
  {n:2, name:"Weak",        bg:"#F3B08A", fg:"#4A2000"},
  {n:1, name:"Very weak",   bg:"#E07C7C", fg:"#FFFFFF"}];
const lvl = n => LEVELS.find(l => l.n === n);
function levelChip(n){ const L = lvl(n); return L ? `<span class="lchip" style="background:${L.bg};color:${L.fg}">${n} · ${L.name}</span>` : '<span class="lchip">Not judged</span>'; }
function academicYear(d){ const dt = d ? new Date(d) : new Date(); const y = dt.getFullYear(); return dt.getMonth() >= 7 ? `${y}–${y+1}` : `${y-1}–${y}`; }
function fmtDate(s){ if(!s) return ""; const [y,m,d] = s.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"}); }
function headerButtons(links){ // replaces the header button with Dashboard/others + Sign out
  const hb = document.querySelector("header.top .btn"); const box = document.createElement("div"); box.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end";
  hb.replaceWith(box);
  links.forEach(([href, text]) => { const a = document.createElement("a"); a.className = "btn ghost small"; a.href = href; a.textContent = text; box.append(a); });
  const so = document.createElement("a"); so.className = "btn ghost small"; so.href = "#"; so.textContent = "Sign out"; so.onclick = e => { e.preventDefault(); signOut(); }; box.append(so);
}
