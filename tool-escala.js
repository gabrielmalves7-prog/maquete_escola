/* tool-escala.js — Conversor de Escala/Proporção */

ToolRegistry.register({
  id: 'escala',
  label: 'Escala',

  init(el) {
    el.innerHTML = `
      <div class="tool-header">
        <div class="tool-title">Conversor de Escala</div>
        <div class="tool-desc">Converta medidas reais para a proporção do projeto</div>
      </div>

      <div class="card">
        <div class="card-title">Medida real</div>
        <div class="unit-row">
          <div style="flex:1;">
            <label>Valor</label>
            <input type="number" id="esc-valor" value="5" min="0" step="0.01">
          </div>
          <div>
            <label>Unidade</label>
            <select id="esc-unidade-in">
              <option value="m">metros</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Proporção (escala)</div>
        <div class="grid-3">
          <div>
            <label>1</label>
            <select id="esc-base-unit" disabled style="opacity:0.5;">
              <option value="m">metro</option>
            </select>
          </div>
          <div>
            <label>equivale a</label>
            <input type="number" id="esc-prop-val" value="10" min="0.001" step="0.01">
          </div>
          <div>
            <label>unidade</label>
            <select id="esc-prop-unit">
              <option value="cm" selected>cm</option>
              <option value="mm">mm</option>
              <option value="m">m</option>
            </select>
          </div>
        </div>
        <div class="formula-bar" id="esc-formula">—</div>
      </div>

      <div class="card">
        <div class="card-title">Resultado na proporção</div>
        <div class="result-grid">
          <div class="metric">
            <div class="metric-label">Centímetros</div>
            <div class="metric-value" id="esc-cm">—</div>
            <div class="metric-unit">cm</div>
          </div>
          <div class="metric">
            <div class="metric-label">Milímetros</div>
            <div class="metric-value" id="esc-mm">—</div>
            <div class="metric-unit">mm</div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Salvar proporção</div>
        <div class="unit-row" style="gap:10px;">
          <div style="flex:1;">
            <label>Nome para identificar</label>
            <input type="text" id="esc-save-nome" placeholder="ex: Maquete casa 1:100">
          </div>
          <div style="align-self:flex-end;">
            <button class="btn btn-primary" id="esc-btn-salvar">Salvar</button>
          </div>
        </div>
        <div id="esc-save-msg" style="font-size:12px;margin-top:8px;min-height:16px;font-family:var(--font-mono);"></div>
      </div>

      <div class="card" id="esc-hist-card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div class="card-title" style="margin:0;">Proporções salvas</div>
          <button class="btn" id="esc-btn-refresh" style="padding:4px 10px;font-size:10px;">↻ Atualizar</button>
        </div>
        <div id="esc-hist-list"><span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">Carregando...</span></div>
      </div>
    `;

    function fmt(n) {
      if (n === 0) return '0';
      return parseFloat(n.toFixed(4)).toLocaleString('pt-BR');
    }

    function calc() {
      const rawVal   = parseFloat(el.querySelector('#esc-valor').value) || 0;
      const unitIn   = el.querySelector('#esc-unidade-in').value;
      const propVal  = parseFloat(el.querySelector('#esc-prop-val').value) || 0;
      const propUnit = el.querySelector('#esc-prop-unit').value;

      let metros = rawVal;
      if (unitIn === 'cm') metros = rawVal / 100;
      if (unitIn === 'mm') metros = rawVal / 1000;

      let propCm = propVal;
      if (propUnit === 'mm') propCm = propVal / 10;
      if (propUnit === 'm')  propCm = propVal * 100;

      const resCm = metros * propCm;
      const resMm = resCm * 10;

      el.querySelector('#esc-cm').textContent = fmt(resCm);
      el.querySelector('#esc-mm').textContent = fmt(resMm);
      el.querySelector('#esc-formula').innerHTML =
        `${rawVal} ${unitIn} → <strong>${fmt(resCm)} cm</strong> = <strong>${fmt(resMm)} mm</strong> &nbsp;|&nbsp; proporção: 1 m = ${propVal} ${propUnit}`;
    }

    function setMsg(txt, ok) {
      const m = el.querySelector('#esc-save-msg');
      m.textContent = txt;
      m.style.color = ok ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { m.textContent = ''; }, 3000);
    }

    async function salvar() {
      const nome = el.querySelector('#esc-save-nome').value.trim();
      if (!nome) { setMsg('Dê um nome antes de salvar.', false); return; }
      const propVal  = parseFloat(el.querySelector('#esc-prop-val').value) || 0;
      const propUnit = el.querySelector('#esc-prop-unit').value;
      const unitIn   = el.querySelector('#esc-unidade-in').value;
      try {
        await db.salvarEscala(nome, parseFloat(el.querySelector('#esc-valor').value) || 0, unitIn, propVal, propUnit);
        el.querySelector('#esc-save-nome').value = '';
        setMsg('Proporção salva!', true);
        carregarHistorico();
      } catch(e) { setMsg('Erro: ' + e.message, false); }
    }

    function carregarItem(item) {
      el.querySelector('#esc-prop-val').value   = item.prop_val;
      el.querySelector('#esc-prop-unit').value  = item.prop_unit;
      el.querySelector('#esc-valor').value      = item.valor_base;
      el.querySelector('#esc-unidade-in').value = item.unidade_base;
      calc();
    }

    async function carregarHistorico() {
      const listEl = el.querySelector('#esc-hist-list');
      try {
        const rows = await db.listarEscalas();
        if (!rows.length) {
          listEl.innerHTML = '<span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">Nenhuma proporção salva ainda.</span>';
          return;
        }
        listEl.innerHTML = '';
        rows.forEach(item => {
          const row = document.createElement('div');
          row.className = 'hist-row';
          row.innerHTML = `
            <div class="hist-info">
              <span class="hist-nome">${item.nome}</span>
              <span class="hist-detalhe">1 m = ${item.prop_val} ${item.prop_unit}</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn" style="padding:4px 10px;font-size:11px;" data-load='${JSON.stringify(item)}'>Carregar</button>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:11px;" data-del="${item.id}">✕</button>
            </div>
          `;
          row.querySelector('[data-load]').addEventListener('click', e => {
            carregarItem(JSON.parse(e.currentTarget.dataset.load));
          });
          row.querySelector('[data-del]').addEventListener('click', async e => {
            await db.deletarEscala(e.currentTarget.dataset.del);
            carregarHistorico();
          });
          listEl.appendChild(row);
        });
      } catch(e) {
        listEl.innerHTML = `<span style="font-size:12px;color:var(--red);font-family:var(--font-mono);">Erro ao carregar: ${e.message}</span>`;
      }
    }

    el.querySelectorAll('input, select').forEach(inp => {
      if (inp.id !== 'esc-base-unit') inp.addEventListener('input', calc);
    });
    el.querySelector('#esc-btn-salvar').addEventListener('click', salvar);
    el.querySelector('#esc-btn-refresh').addEventListener('click', carregarHistorico);

    calc();
    carregarHistorico();
  }
});
