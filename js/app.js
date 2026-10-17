"use strict";

(function () {
  var KEY = "mena-starjar";

  var WISHES = [
    "To watch a sunrise somewhere neither of us has ever been.",
    "To learn one song all the way through and sing it for you.",
    "To cook your favourite dinner and get it exactly right.",
    "To hold your hand through a whole airport at once.",
    "To see you laugh so hard you forget the day.",
    "To build a tiny place that feels like both of us.",
    "To be there on a quiet, ordinary Tuesday.",
    "To grow old enough to be boring together.",
    "To travel with only one bag and no plans.",
    "To always be the person you call first."
  ];

  function $(id) { return document.getElementById(id); }

  var els = {
    jarStars: $("jar-stars"),
    starCount: $("star-count"),
    draw: $("draw"),
    card: $("star-card"),
    starText: $("star-text"),
    starDate: $("star-date"),
    addText: $("add-text"),
    add: $("add"),
    addMsg: $("add-msg"),
    share: $("share"),
    note: $("note"),
    sentNote: $("sent-note")
  };

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    if (m.length < 2) m = "0" + m;
    var day = String(d.getDate());
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return { added: [] };
      var data = JSON.parse(raw);
      return { added: data && Array.isArray(data.added) ? data.added : [] };
    } catch (e) {
      return { added: [] };
    }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  var state = load();
  var lastDraw = null;

  function allStars() {
    var out = [];
    var i;
    for (i = 0; i < WISHES.length; i++) {
      out.push({ id: "w" + i, text: WISHES[i], at: null, starter: true });
    }
    for (i = 0; i < state.added.length; i++) {
      var a = state.added[i];
      out.push({ id: a.id, text: a.text, at: a.at, starter: false });
    }
    return out;
  }

  function render() {
    var stars = allStars();
    els.starCount.textContent = String(stars.length);
    els.jarStars.textContent = "";
    var shown = Math.min(stars.length, 60);
    for (var i = 0; i < shown; i++) {
      var s = document.createElement("span");
      s.className = "star";
      s.textContent = "\u2605";
      els.jarStars.appendChild(s);
    }
    if (stars.length > shown) {
      var more = document.createElement("span");
      more.className = "star more";
      more.textContent = "+" + (stars.length - shown);
      els.jarStars.appendChild(more);
    }
  }

  function draw() {
    var stars = allStars();
    if (!stars.length) {
      els.note.textContent = "The jar is empty \u2014 add a wish first.";
      return;
    }
    var pick = stars[Math.floor(Math.random() * stars.length)];
    if (stars.length > 1 && lastDraw) {
      var guard = 0;
      while (pick.id === lastDraw && guard < 12) {
        pick = stars[Math.floor(Math.random() * stars.length)];
        guard++;
      }
    }
    lastDraw = pick.id;
    els.card.hidden = false;
    els.starText.textContent = pick.text;
    els.starDate.textContent = pick.at ? "Added " + pick.at : "A star from the beginning";
  }

  function add() {
    var text = String(els.addText.value || "").trim();
    if (!text) { els.addMsg.textContent = "Write your wish first."; return; }
    state.added.push({ id: "u" + Date.now() + "-" + state.added.length, text: text, at: todayISO() });
    save(state);
    els.addText.value = "";
    els.addMsg.textContent = "A new star is in the jar \u2665";
    render();
  }

  function copy(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { els.note.textContent = message; },
        function () { els.note.textContent = text; }
      );
    } else {
      els.note.textContent = text;
    }
  }

  function share() {
    var link = window.location.origin + window.location.pathname + "?star=1";
    copy(link, "Jar link copied \u2014 send it to Ammar.");
  }

  function arrival() {
    var params = new URLSearchParams(window.location.search);
    if (!params.get("star")) return;
    els.sentNote.hidden = false;
    els.sentNote.textContent = "\u2665 Ammar is thinking of you \u2014 draw a star and see.";
    draw();
  }

  function init() {
    render();
    arrival();
    if (els.draw) els.draw.addEventListener("click", draw);
    if (els.add) els.add.addEventListener("click", add);
    if (els.share) els.share.addEventListener("click", share);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
