// forte-worker · lib/i18n.ts · 2026-04-19
// U1 — PT-BR + EN nativos, não traduzidos. Chaves canônicas, templates ajustados por locale.

export type Locale = 'pt-BR' | 'en';

type Dict = Record<string, string>;

const PT_BR: Dict = {
  'err.unauthorized':              'não autorizado',
  'err.forbidden':                 'acesso negado',
  'err.validation':                'campos obrigatórios ausentes',
  'err.not_found':                 'registro não encontrado',
  'err.internal':                  'erro interno; tente novamente',
  'err.ai.both_tiers_failed':      'IA indisponível no momento (Workers AI e Gemini falharam). Tente novamente em alguns minutos.',
  'err.anamnesis.signed_immutable':'anamnese assinada não pode ser editada; crie nova versão',
  'err.pix.already_confirmed':     'confirmação de Pix já registrada para esta mensalidade',
  'err.lgpd.disclosure_required':  'é necessário visualizar o aviso de retenção antes de continuar',
  'err.community.off':             'comunidade desativada pelo professor',

  'ok.anamnesis.created':          'anamnese criada',
  'ok.anamnesis.signed':           'anamnese assinada pelo PT',
  'ok.ai.queued_for_review':       'prescrição gerada e enviada para revisão do professor',
  'ok.pix.declared':               'pagamento declarado; aguardando confirmação do PT',
  'ok.pix.confirmed':              'pagamento confirmado pelo PT',
  'ok.export.queued':              'exportação enfileirada; você receberá o link quando pronto',
  'ok.delete.queued':              'solicitação de exclusão registrada',

  'disclosure.retention.title':    'O que permanece após a exclusão?',
  'disclosure.retention.body':     'Para o histórico profissional do personal trainer e obrigações fiscais, a plataforma retém: nome, datas das aulas realizadas e registros financeiros anonimizados (por 5 anos). Todo o restante — anamnese, medições, posts de comunidade, conta — será apagado.',

  'pix.receipt.disclaimer':        'Recibo emitido por declaração do prestador. Não substitui comprovante bancário.',
  'pix.receipt.header':            'Recibo de Pagamento — Pix',

  'notif.email.session.subject':   'Lembrete de aula — {{when}}',
  'notif.email.session.body':      'Olá {{student_name}},\n\nVocê tem aula com {{pt_name}} em {{when}} ({{duration}} min).\n\n{{link}}\n\n— farpa Forte',
  'notif.email.pt.subject':        'Aula confirmada — {{student_name}} em {{when}}',
  'notif.email.pt.body':           'Olá {{pt_name}},\n\nVocê tem aula confirmada com {{student_name}} em {{when}} ({{duration}} min).\n\n{{link}}\n\n— farpa Forte',
};

const EN: Dict = {
  'err.unauthorized':              'unauthorized',
  'err.forbidden':                 'forbidden',
  'err.validation':                'required fields missing',
  'err.not_found':                 'record not found',
  'err.internal':                  'internal error; please retry',
  'err.ai.both_tiers_failed':      'AI is unavailable (Workers AI and Gemini both failed). Please retry in a few minutes.',
  'err.anamnesis.signed_immutable':'signed anamnesis cannot be edited; create a new version',
  'err.pix.already_confirmed':     'Pix confirmation already registered for this charge',
  'err.lgpd.disclosure_required':  'you must view the retention notice before continuing',
  'err.community.off':             'community disabled by the coach',

  'ok.anamnesis.created':          'anamnesis created',
  'ok.anamnesis.signed':           'anamnesis signed by coach',
  'ok.ai.queued_for_review':       'prescription generated and sent for coach review',
  'ok.pix.declared':               'payment declared; awaiting coach confirmation',
  'ok.pix.confirmed':              'payment confirmed by coach',
  'ok.export.queued':              'export queued; you will receive the link when ready',
  'ok.delete.queued':              'deletion request registered',

  'disclosure.retention.title':    'What remains after deletion?',
  'disclosure.retention.body':     'For the coach\'s professional history and tax obligations, the platform retains: your name, dates of completed sessions and anonymized financial records (for 5 years). Everything else — health questionnaire, measurements, community posts, account — will be deleted.',

  'pix.receipt.disclaimer':        'Receipt issued by provider declaration. Does not replace a bank statement.',
  'pix.receipt.header':            'Payment Receipt — Pix',

  'notif.email.session.subject':   'Session reminder — {{when}}',
  'notif.email.session.body':      'Hi {{student_name}},\n\nYou have a session with {{pt_name}} on {{when}} ({{duration}} min).\n\n{{link}}\n\n— farpa Forte',
  'notif.email.pt.subject':        'Session confirmed — {{student_name}} on {{when}}',
  'notif.email.pt.body':           'Hi {{pt_name}},\n\nYou have a confirmed session with {{student_name}} on {{when}} ({{duration}} min).\n\n{{link}}\n\n— farpa Forte',
};

const BUNDLES: Record<Locale, Dict> = { 'pt-BR': PT_BR, 'en': EN };

export function t(locale: Locale, key: string, vars: Record<string, string | number> = {}): string {
  const bundle = BUNDLES[locale] || BUNDLES['pt-BR'];
  let s = bundle[key] ?? key;
  for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{{${k}}}`, String(v));
  return s;
}
