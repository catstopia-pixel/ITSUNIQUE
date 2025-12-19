(() => {
  const $ = (sel, parent = document) => parent.querySelector(sel);
  const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

  // Navbar scroll state
  const navbar = $("#navbar");
  const onScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 6);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // Typing effect (include global track items)
  const typingOutput = $("#typing-output");
  const typingPhrases = [
    "이해도 기반 개념 관리",
    "취약 영역 개선 우선순위",
    "개인 맞춤 문제지 생성",
    "국제 트랙 기준 체크리스트",
    "서류 완성도 관리 포인트"
  ];

  function typeLoop(el, phrases, speed = 38, pause = 850) {
    if (!el) return;

    let phraseIndex = 0;
    let charIndex = 0;
    let direction = 1; // 1 typing, -1 deleting
    let lastSwitch = Date.now();

    const tick = () => {
      const now = Date.now();
      const current = phrases[phraseIndex];

      if (direction === 1 && charIndex === current.length) {
        if (now - lastSwitch < pause) return requestAnimationFrame(tick);
        direction = -1;
        lastSwitch = now;
        return requestAnimationFrame(tick);
      }

      if (direction === -1 && charIndex === 0) {
        if (now - lastSwitch < 260) return requestAnimationFrame(tick);
        direction = 1;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        lastSwitch = now;
        return requestAnimationFrame(tick);
      }

      charIndex += direction;
      el.textContent = current.slice(0, charIndex);
      setTimeout(tick, speed);
    };

    tick();
  }
  typeLoop(typingOutput, typingPhrases);

  // Count-up numbers
  const targets = $$(".count-up-target");
  const started = new WeakSet();

  function animateCount(el, duration = 900) {
    const target = Number(el.dataset.target || "0");
    const unit = el.dataset.unit || "";
    const startTime = performance.now();

    const format = (v) => Math.round(v).toLocaleString("ko-KR") + unit;

    const step = (t) => {
      const p = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const value = target * eased;
      el.textContent = format(value);
      if (p < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window && targets.length) {
    const ioCount = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          if (started.has(el)) return;
          started.add(el);
          animateCount(el);
          obs.unobserve(el);
        });
      },
      { threshold: 0.4 }
    );
    targets.forEach((el) => ioCount.observe(el));
  } else {
    targets.forEach((el) => animateCount(el, 700));
  }

  // FAQ accordion (single open)
  const faqItems = $$(".faq-item");
  faqItems.forEach((item) => {
    const btn = $(".faq-question", item);
    const answerId = btn?.getAttribute("aria-controls");
    const answer = answerId ? $("#" + CSS.escape(answerId)) : null;

    if (!btn || !answer) return;

    item.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-expanded", "false");
    answer.hidden = true;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      faqItems.forEach((it) => {
        const b = $(".faq-question", it);
        const aid = b?.getAttribute("aria-controls");
        const a = aid ? $("#" + CSS.escape(aid)) : null;
        if (!b || !a) return;
        it.setAttribute("aria-expanded", "false");
        b.setAttribute("aria-expanded", "false");
        a.hidden = true;
      });

      if (!isOpen) {
        item.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-expanded", "true");
        answer.hidden = false;
      }
    });
  });
})();
