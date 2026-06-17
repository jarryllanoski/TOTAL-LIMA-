/* ============================================================
   TOTAL TOOLS · db.js  (ECOSISTEMA COMPARTIDO)
   - Fuente única del catálogo (localStorage hoy -> Firebase después)
   - Helper de tema para la tienda
   - Menú de módulos que conecta Tienda / Admin / Caja
   Incluir en los 3: <script src="db.js"></script>
   ============================================================ */
(function (global) {

  var KEY = "tt_store_v1", CART_KEY = "tt_cart_v1", mem = null;

  function seed() {
    return {
      config: {
        theme: { acento:"#f7b500", fondo:"#1a1d23", madera:"#8a5a32", pegboard:"#c7a877" },
        ubicacionAuto: true, igv: false, negocioWa: "51999999999"
      },
      racks: [
        { id:"r1", nombre:"Eléctricas", pasillo:3, niveles:["alto","medio"], color:"#f7b500" },
        { id:"r2", nombre:"Manuales",   pasillo:4, niveles:["alto","medio","bajo"], color:"#3b82f6" }
      ],
      productos: [
        { id:"p1", nombre:"Taladro Percutor 650W", marca:"TOTAL", precio:199.90, emoji:"🛠️", foto:"", video:"", desc:"Taladro percutor 650W, velocidad variable y reversa.", rackId:"r1", nivel:"alto" },
        { id:"p2", nombre:"Amoladora Angular 4½\" 750W", marca:"TOTAL", precio:159.90, emoji:"⚙️", foto:"", video:"", desc:"Amoladora 750W para corte y desbaste.", rackId:"r1", nivel:"alto" },
        { id:"p3", nombre:"Sierra Circular 1400W", marca:"TOTAL", precio:289.90, emoji:"🪚", foto:"", video:"", desc:"Sierra circular 1400W, disco 7¼\".", rackId:"r1", nivel:"alto" },
        { id:"p4", nombre:"Juego de Llaves Mixtas 8 pz", marca:"TOTAL", precio:89.90, emoji:"🔧", foto:"", video:"", desc:"8 llaves mixtas acero cromo-vanadio.", rackId:"r1", nivel:"medio" },
        { id:"p5", nombre:"Set Destornilladores 6 pz", marca:"TOTAL", precio:34.90, emoji:"🪛", foto:"", video:"", desc:"6 destornilladores con puntas imantadas.", rackId:"r1", nivel:"medio" },
        { id:"p6", nombre:"Cinta Métrica 5 m", marca:"TOTAL", precio:19.90, emoji:"📏", foto:"", video:"", desc:"Wincha 5 m con freno automático.", rackId:"r1", nivel:"medio" }
      ]
    };
  }
  function read() {
    if (mem) return mem;
    try { var raw = localStorage.getItem(KEY); if (raw) { mem = JSON.parse(raw); return mem; } } catch (e) {}
    mem = seed(); write(); return mem;
  }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) {} }

  var TTDB = {
    all:        function () { return read(); },
    config:     function () { return read().config; },
    racks:      function () { return read().racks; },
    productos:  function () { return read().productos; },
    save:       function () { write(); },
    uid:        function (p) { return p + Math.random().toString(36).slice(2, 8); },

    // ----- Carrito (compartido entre Tienda y Caja) -----
    getCart:   function () { try { var r = localStorage.getItem(CART_KEY); if (r) { var c = JSON.parse(r); if (Array.isArray(c)) return c; } } catch (e) {} return []; },
    setCart:   function (c) { try { localStorage.setItem(CART_KEY, JSON.stringify(c)); } catch (e) {} },
    clearCart: function () { try { localStorage.removeItem(CART_KEY); } catch (e) {} },

    // ----- Tema (aplica los colores del Admin a la tienda) -----
    applyTheme: function (root) {
      var t = read().config.theme || {}; root = root || document.documentElement;
      if (t.acento)   root.style.setProperty("--amarillo", t.acento);
      if (t.fondo)    root.style.setProperty("--concreto", t.fondo);
      if (t.madera)   root.style.setProperty("--madera", t.madera);
      if (t.pegboard) root.style.setProperty("--pegboard", t.pegboard);
    }
  };
  global.TTDB = TTDB;

  /* ============================================================
     MENÚ DE MÓDULOS  (se inyecta en cada página)
     ============================================================ */
  function injectNav() {
    if (document.getElementById("ttnav-btn")) return;
    var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    var cur = page.indexOf("admin") >= 0 ? "admin" : page.indexOf("caja") >= 0 ? "caja" : page.indexOf("diseno") >= 0 ? "diseno" : "tienda";

    var st = document.createElement("style");
    st.textContent =
      "#ttnav-btn{position:fixed;left:16px;bottom:calc(20px + env(safe-area-inset-bottom,0px));z-index:45;" +
      "width:50px;height:50px;border-radius:14px;background:#1a1d23;border:1px solid #ffffff22;color:#f7b500;" +
      "font-size:22px;display:grid;place-items:center;box-shadow:0 8px 22px #000a;cursor:pointer}" +
      "#ttnav-btn:active{transform:scale(.92)}" +
      "#ttnav-ov{position:fixed;inset:0;z-index:44;background:#0009;opacity:0;pointer-events:none;transition:opacity .2s}" +
      "#ttnav-ov.on{opacity:1;pointer-events:auto}" +
      "#ttnav-menu{position:fixed;left:16px;bottom:calc(80px + env(safe-area-inset-bottom,0px));z-index:46;" +
      "background:#20242c;border:1px solid #ffffff18;border-radius:16px;padding:8px;width:200px;box-shadow:0 14px 40px #000b;" +
      "transform:translateY(10px) scale(.96);opacity:0;pointer-events:none;transition:.18s;transform-origin:bottom left}" +
      "#ttnav-menu.on{transform:none;opacity:1;pointer-events:auto}" +
      "#ttnav-menu .h{font:600 11px system-ui;color:#8b949e;letter-spacing:1px;padding:6px 10px 8px}" +
      "#ttnav-menu a{display:flex;align-items:center;gap:10px;padding:12px 10px;border-radius:11px;color:#f4efe6;" +
      "text-decoration:none;font:600 15px system-ui}" +
      "#ttnav-menu a:active{background:#ffffff12}" +
      "#ttnav-menu a.cur{background:#f7b50022;color:#f7b500}" +
      "#ttnav-menu a .e{font-size:20px}";
    document.head.appendChild(st);

    var ov = document.createElement("div"); ov.id = "ttnav-ov";
    var btn = document.createElement("button"); btn.id = "ttnav-btn"; btn.setAttribute("aria-label", "Módulos"); btn.textContent = "⊞";
    var menu = document.createElement("div"); menu.id = "ttnav-menu";
    function row(key, href, em, label) {
      return '<a class="' + (cur === key ? "cur" : "") + '" href="' + href + '"><span class="e">' + em + '</span>' + label + (cur === key ? " ·" : "") + '</a>';
    }
    menu.innerHTML = '<div class="h">MÓDULOS</div>' +
      row("tienda", "index.html", "🎮", "Tienda") +
      row("diseno", "diseno.html", "🧱", "Diseño") +
      row("admin", "admin.html", "⚙️", "Admin") +
      row("caja", "caja.html", "🧾", "Caja");

    document.body.appendChild(ov); document.body.appendChild(menu); document.body.appendChild(btn);
    function toggle(on) { ov.classList.toggle("on", on); menu.classList.toggle("on", on); }
    btn.addEventListener("click", function () { toggle(!menu.classList.contains("on")); });
    ov.addEventListener("click", function () { toggle(false); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", injectNav);
  else injectNav();

})(window);
