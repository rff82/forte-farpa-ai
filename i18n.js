// forte · i18n.js · 2026-04-19
// U1: bilinguismo PT-BR + EN nativo, não traduzido.
// Detecta Accept-Language, persiste em localStorage `farpa-locale`.

(function(){
  const DICTS = {
    'pt-BR': {
      'ui.contrast':        'Contraste',
      'ui.language':        'Idioma',
      'demo.badge':         'Demo',
      'demo.title':         'Veja o forte por dentro',
      'demo.subtitle':      'Este é um ambiente de demonstração com alunos, sessões e pagamentos simulados. Nada aqui é persistido.',
      'demo.fictional':     'Dados fictícios · Nenhum dado real',
      'demo.cta_real':      'Criar conta real',
      'demo.stat_students': 'Alunos Ativos',
      'demo.stat_sessions': 'Sessões Hoje',
      'demo.stat_revenue':  'Receita no Mês',
      'demo.stat_pending':  'Pendentes',
      'demo.students_title':'Alunos fictícios',
      'onboarding.step1':   'Dados básicos',
      'onboarding.step2':   'CREF',
      'onboarding.step3':   'Chave Pix',
      'onboarding.step4':   'Primeiro aluno',
      'onboarding.step5':   'Notificações',
      'onboarding.step6':   'Pronto!',
      'onboarding.next':    'Avançar',
      'onboarding.back':    'Voltar',
      'onboarding.finish':  'Concluir',
      'disclaimer.ia':       'As sugestões de treino geradas por IA são rascunhos orientativos revisados e aprovados pelo seu Personal Trainer credenciado (CREF). Não substituem avaliação presencial, anamnese completa nem prescrição profissional. Em caso de dúvida, consulte seu profissional de saúde.',
      'disclaimer.ia_short': 'Sugestões IA revisadas pelo PT credenciado. Não substituem prescrição profissional.',
    },
    'en': {
      'ui.contrast':        'Contrast',
      'ui.language':        'Language',
      'demo.badge':         'Demo',
      'demo.title':         'See forte from inside',
      'demo.subtitle':      'This is a demo environment with simulated students, sessions and payments. Nothing here is persisted.',
      'demo.fictional':     'Fictional data · No real data',
      'demo.cta_real':      'Create real account',
      'demo.stat_students': 'Active Students',
      'demo.stat_sessions': 'Sessions Today',
      'demo.stat_revenue':  'Monthly Revenue',
      'demo.stat_pending':  'Pending',
      'demo.students_title':'Fictional students',
      'onboarding.step1':   'Basic info',
      'onboarding.step2':   'CREF',
      'onboarding.step3':   'Pix key',
      'onboarding.step4':   'First student',
      'onboarding.step5':   'Notifications',
      'onboarding.step6':   'Done!',
      'onboarding.next':    'Next',
      'onboarding.back':    'Back',
      'onboarding.finish':  'Finish',
      'disclaimer.ia':       'AI-generated workout suggestions are draft recommendations reviewed and approved by your CREF-certified Personal Trainer. They do not replace in-person assessment, full anamnesis or professional prescription. If in doubt, consult your healthcare professional.',
      'disclaimer.ia_short': 'AI suggestions reviewed by certified PT. Not a substitute for professional prescription.',
    },
  };

  function detectLocale(){
    const saved = localStorage.getItem('farpa-locale');
    if (saved && DICTS[saved]) return saved;
    const nav = (navigator.language || 'pt-BR').toLowerCase();
    return nav.startsWith('pt') ? 'pt-BR' : 'en';
  }

  function apply(locale){
    const dict = DICTS[locale] || DICTS['pt-BR'];
    document.documentElement.lang = locale;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.getAttribute('data-i18n');
      if (dict[k]) el.textContent = dict[k];
    });
    localStorage.setItem('farpa-locale', locale);
  }

  const locale = detectLocale();
  apply(locale);

  const sel = document.getElementById('lang-select');
  if (sel) {
    sel.value = locale;
    sel.addEventListener('change', e => apply(e.target.value));
  }

  window.farpaI18n = { apply, t: (k) => (DICTS[detectLocale()] || DICTS['pt-BR'])[k] || k };
})();
