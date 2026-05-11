# xTool Suite

Conjunto de ferramentas web para auxiliar projetos no xTool (laser/corte).  
Interface simples, sem dependências externas — abre direto no navegador.

---

## Como usar

Baixe ou clone o repositório e abra o arquivo `index.html` no navegador.  
Não precisa de servidor, instalação ou build.

```bash
git clone https://github.com/seu-usuario/xtool-suite.git
cd xtool-suite
# abra index.html no navegador
```

---

## Ferramentas disponíveis

| Ferramenta | Arquivo | Descrição |
|---|---|---|
| Conversor de Escala | `tool-escala.js` | Converte medidas reais (m, cm, mm) para a proporção do projeto, mostrando o resultado em cm e mm |
| Planejador de Peças | `tool-pecas.js` | Define posição inicial (X, Y) e tamanho de cada peça na área de trabalho do xTool, calculando onde cada peça termina e exibindo uma visualização da área |

---

## Estrutura de arquivos

```
xtool-suite/
├── index.html        # Página principal — só o esqueleto HTML e os <script> tags
├── style.css         # Estilo global (tema escuro, variáveis, componentes)
├── tools.js          # Registro central de ferramentas (ToolRegistry)
├── app.js            # Bootstrap: lê o registro, constrói a nav e ativa as abas
├── tool-escala.js    # Ferramenta: Conversor de Escala
├── tool-pecas.js     # Ferramenta: Planejador de Peças
└── README.md         # Este arquivo
```

---

## Como adicionar uma nova ferramenta

### 1. Crie o arquivo da ferramenta

Crie um arquivo `tool-<nome>.js` na raiz do projeto.  
Cada ferramenta segue este padrão:

```js
ToolRegistry.register({
  id: 'minhaferramenta',       // identificador único, sem espaços
  label: 'Minha Ferramenta',   // nome que aparece na aba de navegação

  init(el) {
    // el é o <div> container onde a ferramenta será renderizada

    el.innerHTML = `
      <div class="tool-header">
        <div class="tool-title">Minha Ferramenta</div>
        <div class="tool-desc">Descrição curta do que ela faz</div>
      </div>

      <div class="card">
        <div class="card-title">Seção</div>
        <!-- seus inputs aqui -->
      </div>
    `;

    // sua lógica JavaScript aqui
    function calcular() { /* ... */ }
    el.querySelector('#meu-input').addEventListener('input', calcular);
    calcular();
  }
});
```

### 2. Registre o script no HTML

Abra `index.html` e adicione o `<script>` da sua ferramenta **antes** do `app.js`:

```html
  <script src="tools.js"></script>
  <script src="tool-escala.js"></script>
  <script src="tool-pecas.js"></script>
  <script src="tool-minhaferramenta.js"></script>  <!-- ← adicione aqui -->
  <script src="app.js"></script>
```

Pronto. A aba aparece automaticamente na navegação.

---

## Classes CSS disponíveis

O `style.css` já define os componentes visuais mais comuns. Use-os livremente nas suas ferramentas:

| Classe | Uso |
|---|---|
| `.card` | Container de seção com borda e fundo escuro |
| `.card-title` | Título pequeno em caps dentro do card |
| `.tool-header` + `.tool-title` + `.tool-desc` | Cabeçalho padrão da ferramenta |
| `.grid-2` / `.grid-3` / `.grid-4` | Grids de colunas iguais |
| `.field` | Wrapper de campo com espaçamento |
| `.unit-row` | Input + select de unidade lado a lado |
| `.btn` | Botão padrão |
| `.btn-primary` | Botão de ação principal (amarelo) |
| `.btn-danger` | Botão destrutivo (vermelho) |
| `.btn-full` | Botão largura total |
| `.metric` | Card de valor destacado |
| `.metric-value` | Número grande em destaque |
| `.result-grid` | Grid 2 colunas para métricas |
| `.formula-bar` | Barra com resumo do cálculo |
| `.divider` | Linha separadora |

---

## Variáveis CSS (tema)

Definidas em `:root` no `style.css`. Para usar cores do tema dentro do JS (ex: canvas):

```css
--accent       /* amarelo principal */
--green        /* verde (valor válido) */
--red          /* vermelho (valor inválido/erro) */
--bg, --bg-2, --bg-3, --bg-4   /* fundos, do mais escuro ao mais claro */
--border, --border-hi           /* bordas */
--text, --text-2, --text-3      /* texto, muted, hints */
--font-mono    /* Space Mono */
--font-body    /* DM Sans */
```

---

## Tecnologias

- HTML, CSS e JavaScript puros — sem frameworks, sem bundler
- Fontes via Google Fonts (Space Mono + DM Sans)
- Funciona offline após o primeiro carregamento das fontes
