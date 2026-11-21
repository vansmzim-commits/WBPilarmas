{
/* Nomor WhatsApp tiap divisi. Isi dengan format 62xxxxxxxxxx (tanpa + atau 0 di depan). */
const WA = { kolam: "6285797810150", les: "6285797810150", acara: "6285797810150", hdstar: "628119782025", globenet: "6281563368849", hydro: "628139522476", gh: "628119112025" };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* Tautan WhatsApp: data-wa="divisi" data-msg="pesan awal" */
const waLink = (key, msg) => {
  const n = WA[key] || "";
  return "https://wa.me/" + n + "?text=" + encodeURIComponent(msg || "Halo Pilarmas, saya mau tanya.");
};
for (const a of $$("[data-wa]")) a.href = waLink(a.dataset.wa, a.dataset.msg);

/* Mega menu */
const progBtn = $("#progBtn"), mega = $("#mega");
if (progBtn && mega) {
  const setMega = (open) => { progBtn.setAttribute("aria-expanded", open); mega.classList.toggle("open", open); };
  progBtn.addEventListener("click", (e) => { e.stopPropagation(); setMega(progBtn.getAttribute("aria-expanded") !== "true"); });
  document.addEventListener("click", (e) => { if (!mega.contains(e.target)) setMega(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { setMega(false); progBtn.focus(); } });
  for (const a of $$("a", mega)) a.addEventListener("click", () => setMega(false));
}

/* Drawer (menu HP) */
const burger = $("#burger"), drawer = $("#drawer"), closeBtn = $("#drawerClose");
if (burger && drawer) {
  const setDrawer = (open) => {
    drawer.classList.toggle("open", open); burger.setAttribute("aria-expanded", open);
    drawer.toggleAttribute("inert", !open); document.body.style.overflow = open ? "hidden" : "";
    if (open) setTimeout(() => closeBtn.focus(), 300); else burger.focus();
  };
  drawer.setAttribute("inert", "");
  burger.addEventListener("click", () => setDrawer(true));
  closeBtn.addEventListener("click", () => setDrawer(false));
  for (const a of $$("a", drawer)) a.addEventListener("click", () => setDrawer(false));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("open")) setDrawer(false); });
}

/* Pencari program (beranda) */
const chips = $$(".chip[data-f]"), tiles = $$(".tile[data-for]"), count = $("#count");
if (chips.length) {
  let started = false;
  const apply = (f) => {
    let n = 0;
    for (const c of chips) c.setAttribute("aria-pressed", c.dataset.f === f);
    for (const t of tiles) {
      const show = f === "semua" || t.dataset.for.split(" ").includes(f);
      t.classList.toggle("hide", !show); t.classList.remove("pop");
      if (show) { void t.offsetWidth; t.classList.add("pop"); n++; }
    }
    if (count) count.textContent = n + " program cocok untuk Anda";
    const who = { semua: "bae", anak: "monpil", keluarga: "bae", sekolah: "kuya", komunitas: "bungjin", dewasa: "tanbo", rumah: "halaf", karier: "bungjin" };
    const NAME = { bae: "Bae", monpil: "Monpil & Ubbie", kuya: "Kuya", bungjin: "Bung Jin", tanbo: "Tanbo", halaf: "Halaf" };
    const bub = $("#bubble"), say = {
      semua: "Ada " + n + " program di Pilarmas. Pilih untuk siapa, nanti aku tunjukkan!",
      anak: "Les renang dan pesta ulang tahun di kolam, favorit anak-anak!",
      keluarga: "Ajak keluarga berenang. Orang tua bisa santai di gazebo.",
      sekolah: "Edu Trip seru: renang, air bersih, dan bahasa Inggris dalam sehari.",
      komunitas: "Kumpul di pinggir kolam lebih seru daripada di aula.",
      dewasa: "Belum bisa berenang? Tidak apa-apa, kita mulai dari nol.",
      rumah: "Internet dan air galon untuk rumah juga ada, lho.",
      karier: "Mau kerja di hotel? Tanya Global Hospitality."
    };
    if (bub && started) {
      const g = $("#guideChar"), k = who[f] || "bae";
      if (g) { g.src = "assets/char-" + k + ".webp"; g.alt = NAME[k] + ", karakter Pilarmas"; g.classList.remove("hop"); void g.getBoundingClientRect(); g.classList.add("hop"); }
      $("#guideName").textContent = NAME[k];
      bub.textContent = say[f]; const p = bub.parentElement; p.classList.remove("pop"); void p.offsetWidth; p.classList.add("pop");
    }
    started = true;
    try { localStorage.setItem("pilarmas-f", f); } catch (e) {}
  };
  for (const c of chips) c.addEventListener("click", () => apply(c.dataset.f));
  let start = "semua";
  try { start = localStorage.getItem("pilarmas-f") || "semua"; } catch (e) {}
  if (!chips.some((c) => c.dataset.f === start)) start = "semua";
  apply(start);
}

/* Sub menu bagian halaman, dengan penanda yang bergeser */
const sub = $(".subnav .wrap");
if (sub) {
  const links = $$("a", sub), pill = $(".pill", sub);
  const move = (a) => {
    for (const l of links) l.classList.toggle("on", l === a);
    pill.style.width = a.offsetWidth + "px";
    pill.style.transform = "translateX(" + a.offsetLeft + "px)";
    const left = a.offsetLeft - sub.clientWidth / 2 + a.offsetWidth / 2;
    sub.scrollTo({ left, behavior: "smooth" });
  };
  const secs = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);
  const spy = new IntersectionObserver((ents) => {
    for (const e of ents) if (e.isIntersecting) {
      const l = links.find((x) => x.getAttribute("href") === "#" + e.target.id);
      if (l) move(l);
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  for (const s of secs) spy.observe(s);
  move(links[0]);
  const ro = new ResizeObserver(() => { const on = links.find((l) => l.classList.contains("on")) || links[0]; move(on); });
  ro.observe(sub);
}

/* Paket ulang tahun: hari kerja / akhir pekan + kalkulator */
const toggle = $("#dayToggle");
if (toggle) {
  const rp = (n) => "Rp " + Math.round(n).toLocaleString("id-ID");
  const PK = { hemat: { name: "Hemat", wd: 40000, we: 50000 }, reguler: { name: "Reguler", wd: 85000, we: 95000 }, premium: { name: "Premium", wd: 150000, we: 150000 } };
  let weekend = false, calcReady = false;
  const btns = $$("button", toggle);
  const kids = $("#kids"), kidsOut = $("#kidsOut"), total = $("#total"), lines = $("#lines"), waBtn = $("#calcWa");
  const calc = () => {
    const key = ($("input[name=pk]:checked") || {}).value || "reguler";
    const p = PK[key], n = +kids.value, price = weekend ? p.we : p.wd;
    kidsOut.textContent = n + " anak";
    let sum = price * n;
    const rows = [[p.name + " × " + n + " anak", price * n]];
    for (const c of $$("input[name=ad]:checked")) {
      const v = +c.dataset.price * (c.dataset.per === "anak" ? n : 1);
      rows.push([c.dataset.name, v]); sum += v;
    }
    total.textContent = rp(sum);
    const ct = $(".calc-char"); if (ct && calcReady) { ct.classList.remove("hop"); void ct.getBoundingClientRect(); ct.classList.add("hop"); }
    lines.innerHTML = rows.map(([a, b]) => "<li><span>" + a + "</span><span>" + rp(b) + "</span></li>").join("");
    const msg = "Halo Pilarmas, saya mau pesan paket ulang tahun " + p.name + " untuk " + n + " anak (" + (weekend ? "akhir pekan" : "hari kerja") + "). Tambahan: " + (rows.slice(1).map((r) => r[0]).join(", ") || "tidak ada") + ". Perkiraan " + rp(sum) + ". Tanggal yang diinginkan: ";
    waBtn.href = waLink("acara", msg);
  };
  const setDay = (we) => {
    weekend = we; toggle.classList.toggle("right", we);
    btns.forEach((b, i) => b.setAttribute("aria-pressed", (i === 1) === we));
    for (const el of $$("[data-wd]")) el.textContent = rp(we ? +el.dataset.we : +el.dataset.wd);
    calc();
  };
  btns.forEach((b, i) => b.addEventListener("click", () => setDay(i === 1)));
  for (const i of $$(".calc input")) i.addEventListener("input", calc);
  for (const b of $$("[data-pick]")) b.addEventListener("click", () => { const r = $("input[name=pk][value=" + b.dataset.pick + "]"); if (r) { r.checked = true; calc(); } });
  setDay(false); calcReady = true;
}

/* Kartu teman Pilarmas: ketuk untuk menyapa */
for (const p of $$(".pal")) p.addEventListener("click", () => { p.classList.remove("hop"); void p.offsetWidth; p.classList.add("hop"); });
}

/* Galeri kegiatan: perbesar foto */
(() => {
  const lb = document.getElementById("lb");
  if (!lb || !lb.showModal) return;
  const img = lb.querySelector("img"), cap = lb.querySelector("p");
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lb]");
    if (b) { img.src = b.dataset.lb; img.alt = b.dataset.cap || ""; cap.textContent = b.dataset.cap || ""; lb.showModal(); return; }
    if (e.target === lb || e.target.closest(".lb-x")) lb.close();
  });
})();
