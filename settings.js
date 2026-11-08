// GrowNest · School settings: phases used to group SEF evidence
const GRADES = ["Pre-K","KG1","KG2","Grade 1","Grade 2","Grade 3","Grade 4","Grade 5","Grade 6","Grade 7","Grade 8","Grade 9","Grade 10","Grade 11","Grade 12"];
let ctx = null, phases = [];

async function init(){
  ctx = await requireStaff(); if (!ctx) return;
  headerButtons([["app.html","Dashboard"],["sef.html","SEF evidence"]]);
  $("schoolName").textContent = ctx.school.name;
  if (!["school_admin","leader"].includes(ctx.staff.role)) {
    $("editor").classList.add("hide");
    showMsg($("msg"), "Only school admins and leaders can change the phases. Ask your school admin if they need updating.", "info");
  }
  const {data, error} = await sb.from("school_phases").select("*").eq("school_id", ctx.school.id).order("sort");
  if (error) return showMsg($("msg"), friendly(error), "err");
  phases = (data || []).map(p => ({name: p.name, label: p.label || "", grades: p.grades || []}));
  render();
}
function render(){
  const used = g => phases.findIndex(p => p.grades.includes(g));
  $("phases").innerHTML = phases.length ? phases.map((p, i) => `
    <div class="ph-card">
      <div class="ph-head">
        <label class="f" style="margin:0;flex:1;min-width:140px">Phase name<input data-i="${i}" data-f="name" value="${esc(p.name)}"></label>
        <label class="f" style="margin:0;flex:2;min-width:180px">Description (optional)<input data-i="${i}" data-f="label" value="${esc(p.label)}" placeholder="e.g. Kindergarten"></label>
        <button class="btn ghost small" data-del="${i}" style="color:var(--danger);align-self:flex-end">Remove</button>
      </div>
      <p class="muted" style="margin:10px 0 6px;font-size:.88rem">Grades in this phase</p>
      <div class="also">${GRADES.map(g => { const u = used(g); const on = u === i;
        return `<button type="button" class="alsob" data-i="${i}" data-g="${esc(g)}" aria-pressed="${on}" ${u >= 0 && !on ? 'disabled style="opacity:.35"' : ""}>${esc(g)}</button>`; }).join("")}</div>
    </div>`).join("")
    : `<p class="muted">No phases yet. Add your phases below, or start from the suggested set and adjust it to match your school’s SEF.</p>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.g) { const p = phases[+b.dataset.i]; const g = b.dataset.g;
    p.grades = p.grades.includes(g) ? p.grades.filter(x => x !== g) : [...p.grades, g].sort((a, c) => GRADES.indexOf(a) - GRADES.indexOf(c)); render(); }
  if (b.dataset.del) { phases.splice(+b.dataset.del, 1); render(); }
});
document.addEventListener("input", e => { const i = e.target.dataset.i, f = e.target.dataset.f; if (i != null && f) phases[+i][f] = e.target.value; });
$("addPhase").onclick = () => { phases.push({name: "Phase " + (phases.length + 1), label: "", grades: []}); render(); };
$("suggest").onclick = () => {
  if (phases.length && !confirm("Replace the current phases with the suggested set?")) return;
  phases = [
    {name: "Phase 1", label: "Kindergarten", grades: ["Pre-K","KG1","KG2"]},
    {name: "Phase 2", label: "Primary", grades: ["Grade 1","Grade 2","Grade 3","Grade 4","Grade 5"]},
    {name: "Phase 3", label: "Middle", grades: ["Grade 6","Grade 7","Grade 8","Grade 9"]},
    {name: "Phase 4", label: "Secondary", grades: ["Grade 10","Grade 11","Grade 12"]}];
  render(); showMsg($("msg"), "Suggested phases added. Adjust them to match your school’s SEF, then tap Save phases.", "info");
};
$("savePhases").onclick = async () => {
  if (phases.some(p => !p.name.trim())) return showMsg($("msg"), "Please give every phase a name.", "err");
  $("savePhases").disabled = true;
  const del = await sb.from("school_phases").delete().eq("school_id", ctx.school.id);
  if (del.error) { $("savePhases").disabled = false; return showMsg($("msg"), friendly(del.error), "err"); }
  if (phases.length) {
    const {error} = await sb.from("school_phases").insert(phases.map((p, i) => ({school_id: ctx.school.id, name: p.name.trim(), label: p.label.trim() || null, grades: p.grades, sort: i + 1})));
    if (error) { $("savePhases").disabled = false; return showMsg($("msg"), friendly(error), "err"); }
  }
  $("savePhases").disabled = false;
  showMsg($("msg"), "Phases saved. SEF evidence will now be grouped by these phases.", "ok");
};
init();
