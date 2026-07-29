(() => {
  const KAKAO_CHAT_URL = 'http://pf.kakao.com/_RPMLG/chat';
  const DEFAULT_EMAIL = 'hyojoon0310@gmail.com';

  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });
  }

  // Korean/English toggle shared by every page.
  const savedLanguage = localStorage.getItem('itsunique_language') || 'ko';
  function applyLanguage(language) {
    const lang = language === 'en' ? 'en' : 'ko';
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ko][data-en]').forEach(element => {
      const value = element.dataset[lang];
      if (value != null) element.textContent = value;
    });
    document.querySelectorAll('[data-placeholder-ko][data-placeholder-en]').forEach(element => {
      element.placeholder = lang === 'en' ? element.dataset.placeholderEn : element.dataset.placeholderKo;
    });
    document.querySelectorAll('.lang-btn').forEach(button => {
      const active = button.dataset.lang === lang;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    localStorage.setItem('itsunique_language', lang);
  }
  document.querySelectorAll('.lang-btn').forEach(button => {
    button.addEventListener('click', () => applyLanguage(button.dataset.lang));
  });
  applyLanguage(savedLanguage);

  // First-touch attribution for the future dashboard.
  const params = new URLSearchParams(location.search);
  const attribution = {
    source: params.get('utm_source') || params.get('source') || 'direct',
    medium: params.get('utm_medium') || '',
    campaign: params.get('utm_campaign') || '',
    content: params.get('utm_content') || '',
    term: params.get('utm_term') || '',
    referrer: document.referrer || '',
    landingPage: location.pathname,
    firstSeenAt: new Date().toISOString()
  };
  if (!localStorage.getItem('itsunique_attribution')) {
    localStorage.setItem('itsunique_attribution', JSON.stringify(attribution));
  }

  document.querySelectorAll('[data-kakao-consult]').forEach(link => {
    link.setAttribute('href', KAKAO_CHAT_URL);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });

  const labels = {
    ko: {name:'이름',phone:'연락처',education:'현재 학력',major:'희망 전공',entry_period:'희망 입학 시기',message:'문의 내용'},
    en: {name:'Name',phone:'Phone',education:'Current Education',major:'Preferred Major',entry_period:'Preferred Intake',message:'Message'}
  };

  function currentLanguage() { return document.documentElement.lang === 'en' ? 'en' : 'ko'; }
  function buildConsultMessage(formData) {
    const lang=currentLanguage();
    const lines=[lang==='en' ? '[It’s Unique 1:1 Consultation]' : '[잇츠유닉 1:1 상담 신청]'];
    Object.keys(labels[lang]).forEach(key => {
      const value=String(formData.get(key)||'').trim();
      if(value) lines.push(`${labels[lang][key]}: ${value}`);
    });
    try {
      const saved=JSON.parse(localStorage.getItem('itsunique_attribution')||'{}');
      if(saved.source) lines.push(`${lang==='en'?'Source':'유입 경로'}: ${saved.source}${saved.medium?` / ${saved.medium}`:''}`);
    } catch (_) {}
    lines.push(`${lang==='en'?'Page':'신청 페이지'}: ${location.href}`);
    return lines.join('\n');
  }


  document.querySelectorAll('[data-consult-form]').forEach(form => {
    const status=form.querySelector('[data-form-status]');
    const submitButton=form.querySelector('button[type="submit"]');
    const pageUrl=form.querySelector('input[name="page_url"]');
    if(pageUrl) pageUrl.value=location.href;
    form.addEventListener('submit', async event => {
      event.preventDefault(); if(!form.reportValidity()) return;
      const lang=currentLanguage();
      const email=form.dataset.email||DEFAULT_EMAIL;
      const formData=new FormData(form); const message=buildConsultMessage(formData);
      formData.append('상담_요약',message);
      const savedAttribution=localStorage.getItem('itsunique_attribution');
      if(savedAttribution) formData.append('유입_정보',savedAttribution);
      if(submitButton){submitButton.disabled=true;submitButton.textContent=lang==='en'?'Submitting...':'접수 중...';}
      if(status){status.className='form-status is-loading';status.textContent=lang==='en'?'Sending your information to our consultant.':'상담 정보를 담당자에게 전달하고 있습니다.';}
      let emailSent=false;
      try {
        const response=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email)}`,{method:'POST',headers:{Accept:'application/json'},body:formData});
        if(!response.ok) throw new Error('Email submission failed'); emailSent=true;
      } catch(error){console.error(error);}
      if(status){
        status.className=`form-status ${emailSent?'is-success':'is-warning'}`;
        status.textContent=lang==='en'
          ? (emailSent?'Your consultation details were sent to our consultant by email.':'The email could not be sent. Please try again or use the KakaoTalk consultation button.')
          : (emailSent?'상담 정보가 담당자 이메일로 전송되었습니다.':'이메일 전송에 실패했습니다. 다시 시도하거나 카카오톡 상담 버튼을 이용해 주세요.');
      }
      if(emailSent) form.reset();
      if(submitButton){submitButton.disabled=false;submitButton.textContent=lang==='en'?(submitButton.dataset.submitEn||'Submit Consultation Request'):(submitButton.dataset.submitKo||'상담 신청하기');}
    });
  });
})();
