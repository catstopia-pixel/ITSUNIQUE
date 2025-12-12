document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // FAQ 아코디언 기능
    // ----------------------------------------------------
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const targetId = question.getAttribute('data-target');
            const answer = document.getElementById(targetId);
            const isExpanded = question.getAttribute('aria-expanded') === 'true';

            // 다른 열린 항목 닫기
            document.querySelectorAll('.faq-answer.open').forEach(openAnswer => {
                if (openAnswer.id !== targetId) {
                    openAnswer.classList.remove('open');
                    openAnswer.setAttribute('aria-hidden', 'true');
                    document.querySelector(`[data-target="${openAnswer.id}"]`).setAttribute('aria-expanded', 'false');
                }
            });

            // 현재 항목 토글
            question.setAttribute('aria-expanded', !isExpanded);
            answer.setAttribute('aria-hidden', isExpanded);
            answer.classList.toggle('open');
        });
    });

    // ----------------------------------------------------
    // Hero 타이핑 애니메이션
    // ----------------------------------------------------
    const typingTexts = ["입시 전략", "학습 우선순위", "다음 2주 학습 계획", "위험 과목 패턴"];
    const typingOutput = document.getElementById('typing-output');
    let textIndex = 0;
    let charIndex = 0;
    const typingSpeed = 100;
    const erasingSpeed = 50;
    const newTextDelay = 1000;

    function type() {
        if (charIndex < typingTexts[textIndex].length) {
            typingOutput.textContent += typingTexts[textIndex].charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(erase, newTextDelay);
        }
    }

    function erase() {
        if (charIndex > 0) {
            typingOutput.textContent = typingTexts[textIndex].substring(0, charIndex - 1);
            charIndex--;
            setTimeout(erase, erasingSpeed);
        } else {
            textIndex = (textIndex + 1) % typingTexts.length;
            setTimeout(type, 500);
        }
    }

    // Hero 애니메이션 시작
    type();

    // ----------------------------------------------------
    // 숫자 Count-up 애니메이션
    // ----------------------------------------------------
    function countUp(el) {
        const target = parseInt(el.getAttribute('data-target'));
        const unit = el.getAttribute('data-unit') || '';
        let current = 0;
        const duration = 1500;
        const stepTime = 10;
        const step = target / (duration / stepTime);

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            // 천 단위 쉼표 포맷팅
            el.textContent = Math.floor(current).toLocaleString() + unit;
        }, stepTime);
    }

    // ----------------------------------------------------
    // 스크롤 인터랙션 (섹션 fade-in, 카드 slide-in, Count-up, How It Works SVG)
    // ----------------------------------------------------
    const sections = document.querySelectorAll('section');
    const countUpTargets = document.querySelectorAll('.count-up-target');
    const flowLinePath = document.getElementById('flow-line-path');

    // 서비스 카드 초기 설정 (slide-in-up을 위해)
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
    });

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const section = entry.target;
                
                // 1. 섹션 Fade-in
                section.classList.add('is-visible');

                // 2. Count-up 실행 (Hero 섹션)
                if (section.id === 'hero' || section.id === 'why-uniq') {
                    countUpTargets.forEach(el => {
                        if (!el.dataset.counted && section.contains(el)) {
                            countUp(el);
                            el.dataset.counted = 'true';
                        }
                    });
                }

                // 3. 서비스 카드 등장 모션 슬라이드 인
                if (section.id === 'services') {
                    document.querySelectorAll('#services .service-card').forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 200);
                    });
                }
                
                // 4. How It Works SVG 라인 애니메이션
                if (section.id === 'how-it-works' && flowLinePath) {
                    flowLinePath.style.strokeDashoffset = '0';
                }

                // 관찰 중지
                observer.unobserve(section);
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // 10%가 보이면 실행
    });

    sections.forEach(section => {
        if (section.id !== 'hero' && section.id !== 'final-cta') {
            sectionObserver.observe(section);
        }
    });

    // SVG Line 초기 상태 설정 (애니메이션을 위해)
    if (flowLinePath) {
        const pathLength = flowLinePath.getTotalLength ? flowLinePath.getTotalLength() : 1000;
        flowLinePath.style.strokeDasharray = pathLength;
        flowLinePath.style.strokeDashoffset = pathLength;
    }
});