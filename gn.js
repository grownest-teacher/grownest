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
