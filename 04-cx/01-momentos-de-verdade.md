# F4 · CX — Momentos de Verdade · farpa Forte
> Mapa priorizado de MoTs por persona · 2026-04-19 · bilingual PT-BR + EN

---

## 0. Definição operacional

**Momento de verdade (MoT)** = instante em que a percepção de valor é decidida e o usuário escolhe continuar, abandonar ou advogar. Classificamos em três tiers:

- **P0** — bloqueador de adoção (falhar = churn imediato)
- **P1** — diferenciador competitivo (ganho ou perda de confiança)
- **A2** — "accessibility blocker" (falhar excluí A2 Seu Antônio e similares; violação direta de U2/U3)

Cada MoT traz: **contexto**, **expectativa**, **critério objetivo de sucesso**, **persona(s) primária(s)**, **dono técnico**, **invariante associado**.

---

## 1. MoTs P0 — Bloqueadores

| # | Momento | Persona | Expectativa | Critério objetivo | Dono | Invariante |
|---|---|---|---|---|---|---|
| P0.1 | **"É grátis mesmo?"** na landing | P1, P3 | Resposta sem asterisco acima da dobra | Copy "100% grátis no MVP" visível sem scroll · sem pedido de cartão no cadastro | CMO + Frontend | U8 |
| P0.2 | **Login funciona entre forte e admin** | Todos PTs | Faço login uma vez, volto logado | `forte_sid` com `SameSite=None; Secure; Partitioned` · sessão persiste em navegação cross-subdomínio | Backend + SecOps | U5 |
| P0.3 | **Primeiro treino sai em ≤ 5 minutos** | P1 Rafa, P3 Lucão | "Eu cadastro aluno e mando treino na mesma sentada" | De click "Novo aluno" a "Treino enviado" ≤ 5min cronometrado em teste moderado | UX + Backend | — |
| P0.4 | **Recibo Pix chega com meu CREF** | P2 Ju, P5 Marcos | PDF com CREF, CNPJ/MEI, txid, valor, aluno | Recibo gerado ≤ 30s após webhook PSP · assinado · enviado via canal escolhido | Backend + AI (template) | U6 |
| P0.5 | **Consigo exportar tudo e sair** | P5 Marcos, P1 Rafa | "Meus dados são meus" | Botão "Baixar tudo" gera ZIP completo em ≤ 10min · link válido 30d | Backend + SecOps | LGPD |
| P0.6 | **A IA não prescreve sem anamnese** | P5 Marcos, P2 Ju | "Nunca deixem IA prescrever às cegas" | Endpoint IA rejeita request sem `anamnesis_version_id` · erro legível | AI + SecOps | ADR 014 G1 |
| P0.7 | **Comunidade não aparece sem eu ligar** | P2 Ju | "Meus alunos idosos não querem rede social" | Default `community_opt_in=false` · qualquer tab/UI de comunidade escondida até opt-in | Frontend + Backend | ADR 014 G2 |

---

## 2. MoTs P1 — Diferenciadores

| # | Momento | Persona | Expectativa | Critério objetivo | Dono | Invariante |
|---|---|---|---|---|---|---|
| P1.1 | **IA entende meu aluno** | P1 Rafa, P3 Lucão | Treino sugerido coerente com objetivo + anamnese | ≥ 70% dos PTs em teste piloto aceitam sugestão com ≤ 2 edições (medido em F5 validação) | AI | ADR 011 + 014 |
| P1.2 | **Copiar treino da semana passada em 2 toques** | P1 Rafa | "Eu repito estrutura e só ajusto carga" | Ação "Duplicar última semana" presente no editor · ≤ 2 cliques | UX + Frontend | — |
| P1.3 | **Dashboard de inadimplência claro** | P1 Rafa, P2 Ju | "Vejo na sexta quem não pagou" | Widget "Atrasados · Pendentes · Pagos" com contagem e lista em ≤ 1 clique | Frontend + Backend | — |
| P1.4 | **Bilinguismo real, não tradução** | P4 Clara | "Copy em EN parece escrita por PT nativo em inglês" | Review linguística humana em todas páginas EN · seletor sempre visível | CMO + Frontend | U1 |
| P1.5 | **Link de convite do aluno funciona no celular simples** | P3 Lucão · A2 | "Meu aluno clica e entra" | Link abre sem login obrigatório · abre com alto contraste se PT marcou aluno como acessibilidade-friendly | Frontend | U2 + U3 |
| P1.6 | **Não envio cobrança automática em nome do PT** | P1 Rafa, P2 Ju | "Eu decido quando cobrar" | Nenhum Worker envia WhatsApp em nome do PT sem ação explícita | Backend | ADR 014 |
| P1.7 | **Anamnese versionada e auditável** | P5 Marcos, P2 Ju | "Consigo mostrar ao CREF que não rasurei" | Cada edição cria nova versão imutável · timestamp + autor · histórico navegável | Backend | — |
| P1.8 | **Funnel Insta → pagante** | P3 Lucão | "Link na bio leva a anamnese + pagamento" | Rota pública `/c/{slug}` · anamnese + cobrança inicial em um fluxo ≤ 4 telas | Frontend + Backend | — |

---

## 3. MoTs A2 — Acessibilidade (herança U2/U3)

| # | Momento | Persona | Expectativa | Critério objetivo | Dono | Invariante |
|---|---|---|---|---|---|---|
| A2.1 | **Toggle alto contraste no header sempre** | A2, Rodrigo | "Ligo e desligo quando quiser" | Toggle presente em 100% das telas (incl. landing, onboarding, erro, login) | Frontend | U2 |
| A2.2 | **Preto+laranja OU combinação que case com DS** | A2, Rodrigo | "Contraste real, não só preto-branco" | DS Editorial Navy Performance provê dupla-paleta contraste · WCAG ≥ 7:1 | Frontend | U2 |
| A2.3 | **Fonte escalável sem quebrar layout** | A2, P2 Ju (astigmatismo) | "Zoom 150% não quebra" | Testes visuais em CI com viewport zoom 100/125/150% · sem overflow crítico | Frontend | U3 |
| A2.4 | **Link externo do aluno herda acessibilidade** | A2 | "Seu Antônio abre e já está legível" | Flag `athlete.a11y_preference` propaga contraste+fonte para rota de aluno | Frontend | U2 + U3 |
| A2.5 | **Contraste validado em CI** | Todos | — | Job `a11y-audit` com pa11y/axe-core como parte do CI (U7) | Frontend + SecOps | U3 + U7 |
| A2.6 | **Leitura de tela narra o treino** | A2 (futuro), PcDs | "Assistente de voz lê exercício e série" | ARIA labels completos no card de exercício · tested com VoiceOver | Frontend | U3 |
| A2.7 | **Recibo PDF acessível** | A2, P5 | "PDF marcado para leitor de tela" | PDF/UA básico: tags, alt em logo, ordem lógica | Backend (gen) | U3 |

---

## 4. Rollup por persona

| Persona | P0 | P1 | A2 | Total |
|---|---|---|---|---|
| P1 Rafa | 4 | 5 | — | 9 |
| P2 Ju | 5 | 4 | 1 (astigmatismo) | 10 |
| P3 Lucão | 3 | 3 | — | 6 |
| P4 Clara | 2 | 2 | — | 4 |
| P5 Marcos | 4 | 2 | 1 | 7 |
| A1 Bia | 1 (login) | 1 | — | 2 |
| A2 Seu Antônio | 1 (link) | 1 | 7 | 9 |

P2 Ju e A2 Seu Antônio concentram mais MoTs = candidatos primários ao piloto de validação F5.

---

## 5. Matriz dono × invariante

| Dono | MoTs | Invariantes críticos |
|---|---|---|
| Frontend | P0.1, P0.7, P1.2, P1.4, P1.5, P1.8, A2.1–A2.6 | U1, U2, U3 |
| Backend | P0.2, P0.4, P0.5, P1.3, P1.6, P1.7, P1.8, A2.7 | U5, U6 |
| AI | P0.6, P1.1 | ADR 011/014 |
| SecOps | P0.2, P0.5, P0.6, A2.5 | U5, U6, U7 |
| UX | P0.3, P1.2 | — |
| CMO | P0.1, P1.4 | U1 |

---

## 6. Acionáveis para F5 Validação

Cada MoT P0 vira uma **tarefa de entrevista simulada** com as 7 personas no F5:
- Roteiro 30min por persona
- Pergunta direta sobre o critério objetivo
- Ponto de abandono explícito: "se X falhasse, você desistiria?"
- Output: relatório `05-validacao/01-entrevistas-simuladas.md` com go/no-go por MoT

---

*F4 · Momentos de Verdade · farpa Forte · v1 · 2026-04-19*
