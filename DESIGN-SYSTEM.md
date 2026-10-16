# Design System — App de Pedidos para Espetaria (white-label)

> Referência Behance (Zillo POS) **não foi aberta** (página exige JS). Telas abaixo seguem o padrão geral de POS: categorias em abas, cards de produto com foto, barra de carrinho fixa, kanban de pedidos. Se quiser fidelidade, mande prints.

## 1. Arquitetura mínima (o que torna "fácil de trocar")

| Peça | Escolha | Por quê |
|---|---|---|
| App do cliente | **PWA** (sem instalar, sem login) | NFC e QR só precisam abrir uma URL |
| URL da mesa | `https://app.seudominio.com/r/{slug}?mesa=12` | O mesmo link vai na tag NFC e no QR; a mesa já vem preenchida |
| Mesa errada/sem mesa | Tela "Em qual mesa você está?" (teclado numérico) | Cobre quem abre o link sem tag |
| Painel de gestão | Web app (tablet/desktop) | Pedidos, cardápio, checkout, aparência |
| Impressão da comanda | Impressora térmica de rede (ESC/POS) via agente local ou `window.print()` com CSS 80mm | Começar com `window.print()` |
| Multi-cliente | Tudo vem de um **tenant**: `theme.json` + `menu` no banco | Trocar logo/cor/produto = editar dados, nunca código |

**Regra de ouro:** nenhum componente usa cor/logo/texto fixo. Tudo lê tokens (`var(--c-primary)`) e dados do tenant.

## 2. Tokens

### 2.1 Marca (muda por cliente — vem do `theme.json`)

| Token | CSS var | Uso |
|---|---|---|
| `brand.primary` | `--c-primary` | Botões principais, aba ativa, preço destaque |
| `brand.onPrimary` | `--c-on-primary` | Texto sobre primary (**calculado** por contraste, não digitado) |
| `brand.accent` | `--c-accent` | Badges, selos ("Mais pedido") |
| `brand.background` | `--c-bg` | Fundo da página |
| `brand.surface` | `--c-surface` | Cards, sheets |
| `brand.text` | `--c-text` | Texto principal |
| `brand.logo` / `brand.logoMark` | — | Logo horizontal (topo) e ícone quadrado (favicon/PWA) |
| `brand.font` | `--font` | Fonte (Google Fonts name) |
| `shape.radius` | `--radius` | 4 / 8 / 16 / 24 — muda o "clima" inteiro |

### 2.2 Fixos (iguais para todos os clientes)

| Categoria | Tokens |
|---|---|
| Semânticas | `success #1F9D55`, `warning #E0A100`, `danger #D64545`, `info #2F6FDB` (status de pedido não pode depender da marca) |
| Neutros | derivados de `--c-text` com opacidade: `muted 60%`, `border 12%`, `disabled 38%` |
| Espaçamento | 4 · 8 · 12 · 16 · 24 · 32 · 48 |
| Tipografia | `xs 12 / sm 14 / md 16 / lg 20 / xl 28 / 2xl 36` · pesos 400/600/700 · line-height 1.4 |
| Sombra | `sm` (cards), `md` (sheet/cart bar) |
| Movimento | 150ms (hover/press), 250ms (sheet), `ease-out` |
| Toque | alvo mínimo **48×48px** (cliente com mão engordurada, luz baixa) |

### 2.3 Trava de acessibilidade do tema
Ao salvar o tema no painel: se contraste `onPrimary/primary` < 4.5:1, escolher preto/branco automaticamente e avisar. Impede o cliente de quebrar a legibilidade.

## 3. Modelo de dados do tenant (o que o dono edita)

```
Restaurante  { slug, nome, logo, tema, mesas[1..N], taxaServico% }
Categoria    { id, nome, ordem, tipo: "comida" | "bebida", ativa }
Produto      { id, categoriaId, nome, descricao, preco, foto, tags[], disponivel, ordem,
               opcoes[] }              // ex.: ponto da carne, acompanhamento
Pedido       { id, mesa, itens[{produtoId, qtd, opcoes, obs}], status, criadoEm }
Mesa         { numero, status: livre|ocupada|pediu_conta }
```

Status do pedido: `novo → em_preparo → pronto → entregue` (+ `cancelado`).

## 4. Componentes

### Cliente
| Componente | Variantes / Props | Estados | Notas |
|---|---|---|---|
| **Button** | `primary` `secondary` `ghost` · `sm` `md` `lg` · `fullWidth` | default, pressed, disabled, loading | `lg` fixo no rodapé |
| **MesaBadge** | `numero`, `onChange` | — | Sempre visível no topo; toque abre seletor |
| **CategoryTabs** | `items[]`, `active` | ativa/inativa, scroll horizontal | Sticky; scroll-spy com a lista |
| **ProductCard** | `foto?`, `nome`, `descricao`, `preco`, `tags` | default, indisponível (cinza + "Esgotado"), no carrinho (badge qtd) | Sem foto → só texto (não quebra layout) |
| **ItemSheet** | `produto`, opções, obs, `Stepper` | — | Bottom-sheet; botão "Adicionar · R$ X" |
| **Stepper** | `value`, `min`, `max` | min (– desativado) | Botões 48px |
| **CartBar** | `qtd`, `total` | oculta se vazio | Fixa no rodapé |
| **OrderStatusChip** | `status` | 4 cores semânticas | Acompanhar pedido |
| **CallBillButton** | — | default, confirmando, **enviado** (desabilitado) | Único "pagamento" no app; só notifica o painel. Confirmação de 1 toque para evitar clique acidental |
| **EmptyState / Toast** | texto | — | Copy em pt-BR, tom curto |

### Gestão
| Componente | Notas |
|---|---|
| **Sidebar** | Logo do tenant + Pedidos, Mesas, Cardápio, Aparência, Impressão |
| **OrderCard** (kanban) | Mesa grande, itens, tempo decorrido (fica `warning` >10 min, `danger` >20), botão avançar status, botão 🖨 reimprimir |
| **MesaTile** | Cor por status; `pediu_conta` pisca e vai para o topo |
| **CheckoutPanel** | Itens da mesa, taxa de serviço (liga/desliga), dividir por pessoas, forma de pagamento, "Fechar mesa" |
| **MenuEditor** | Tabela + drawer de edição; arrastar para reordenar; toggle "Disponível" (esgotou o espeto → 1 clique) |
| **ThemeEditor** | Upload logo, 3 color pickers, raio, fonte, **preview ao vivo** do app do cliente |
| **TicketPreview** | Layout da comanda 80mm: mesa em fonte gigante, hora, itens, obs |

## 5. Telas

### App do cliente (mobile, sem login)
1. **Mesa** — só aparece se `?mesa=` ausente. Teclado numérico + "Confirmar".
2. **Cardápio** — header (logo + MesaBadge) · CategoryTabs (Espetos, Porções/Petiscos, Bebidas…) · lista de ProductCard · CartBar.
3. **Item** — ItemSheet (ponto, adicionais, obs).
4. **Carrinho** — revisar, ajustar qtd, **"Enviar pedido"** (sem pagamento).
5. **Pedido enviado** — confirmação + status ao vivo + "Pedir mais".
6. **Pedir a conta** — botão fixo no menu ("Pedir a conta") → confirmação → estado "Garçom a caminho".

### Painel de gestão (tablet/desktop)
1. **Pedidos** — kanban Novo / Em preparo / Pronto / Entregue; som + destaque em novo pedido; **impressão automática** ao entrar.
2. **Mesas** — grade de MesaTile; clicar abre CheckoutPanel.
3. **Checkout** — fechar conta (só aqui existe pagamento).
4. **Cardápio** — categorias e produtos (MenuEditor).
5. **Aparência** — ThemeEditor.
6. **Impressão** — escolher impressora, testar, mesas e QR/NFC (gerar/baixar QR de cada mesa com a URL).

## 6. Acessibilidade
- Contraste ≥ 4.5:1 (travado pelo tema, §2.3); foco visível; `aria-live="polite"` para status do pedido.
- Alvo de toque ≥ 48px; não depender só de cor (ícone + texto no status).
- Preço sempre `R$ 12,90` (Intl pt-BR), nunca string solta.

## 7. Onboarding de um cliente novo (checklist)
1. Criar tenant (slug) → 2. Subir logo → 3. Escolher 3 cores → 4. Importar/criar cardápio → 5. Definir nº de mesas → 6. Gerar QR/NFC por mesa → 7. Parear impressora → 8. Pedido de teste.

## 8. Perguntas em aberto
- Pedido pode ser **cancelado/alterado** pelo cliente depois de enviado? (sugestão: não; só o painel)
- Taxa de serviço (10%) entra automático?
- Um único pedido por mesa aberto ("conta aberta") ou cada envio é pedido separado? (sugestão: vários pedidos, uma conta por mesa)
- Impressora: qual modelo/conexão (rede, USB, Bluetooth)? Define o caminho de impressão.
- Stack preferida? (Sugestão: Next.js + Postgres/Supabase, já que você usa Next/Expo.)
