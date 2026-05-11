/* tool-pecas.js — Planejador de Peças xTool */

ToolRegistry.register({
  id: 'pecas',
  label: 'Planejador xTool',

  init(el) {
    const COLORS = ['#e8c547','#4caf7d','#5b9bd5','#e85447','#b06cde','#e87c47','#47c4e8','#de6c9e'];
    let pieces  = [];
    let counter = 0;

    el.innerHTML = `
      <div class="tool-header">
        <div class="tool-title">Planejador de Peças</div>
        <div class="tool-desc">Defina posição e tamanho de cada peça na área de trabalho do xTool</div>
      </div>

      <div class="card">
        <div class="card-title">Área de trabalho</div>
        <div class="grid-2">
          <div class="field">
            <label>Largura total (mm)</label>
            <input type="number" id="ws-w" value="400" min="1">
          </div>
          <div class="field">
            <label>Altura total (mm)</label>
            <input type="number" id="ws-h" value="400" min="1">
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-title">Nova peça</div>
        <div class="field">
          <label>Nome</label>
          <input type="text" id="p-name" placeholder="ex: Lateral esquerda">
        </div>
        <div class="grid-2" style="margin-bottom:12px;">
          <div>
            <label>Largura da peça</label>
            <div class="unit-row">
              <input type="number" id="p-w" value="100" min="0.01" step="0.01">
              <select id="p-w-unit">
                <option value="mm" selected>mm</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>
          <div>
            <label>Altura da peça</label>
            <div class="unit-row">
              <input type="number" id="p-h" value="80" min="0.01" step="0.01">
              <select id="p-h-unit">
                <option value="mm" selected>mm</option>
                <option value="cm">cm</option>
              </select>
            </div>
          </div>
        </div>
        <div class="grid-2" style="margin-bottom:14px;">
          <div>
            <label>Início X (mm)</label>
            <input type="number" id="p-x" value="0" min="0" step="0.1">
          </div>
          <div>
            <label>Início Y (mm)</label>
            <input type="number" id="p-y" value="0" min="0" step="0.1">
          </div>
        </div>
        <button class="btn btn-primary btn-full" id="add-btn">+ Adicionar peça</button>
      </div>

      <div class="card" id="pc-list-card" style="display:none;">
        <div class="card-title">Peças do projeto atual</div>
        <table class="piece-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>W × H (mm)</th>
              <th>Início X · Y</th>
              <th>Fim X</th>
              <th>Fim Y</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="pc-tbody"></tbody>
        </table>
      </div>

      <div class="card" id="pc-canvas-card" style="display:none;">
        <div class="card-title">Visualização</div>
        <div class="canvas-wrap">
          <canvas id="pc-canvas"></canvas>
        </div>
        <div class="canvas-legend" id="pc-legend"></div>
      </div>

      <div class="card" id="pc-list-card" style="display:none;">
      </div>

      <div class="card">
        <div class="card-title">Salvar projeto</div>
        <div class="unit-row" style="gap:10px;">
          <div style="flex:1;">
            <label>Nome do projeto</label>
            <input type="text" id="pc-save-nome" placeholder="ex: Caixinha porta-joias">
          </div>
          <div style="align-self:flex-end;">
            <button class="btn btn-primary" id="pc-btn-salvar">Salvar</button>
          </div>
        </div>
        <div id="pc-save-msg" style="font-size:12px;margin-top:8px;min-height:16px;font-family:var(--font-mono);"></div>
      </div>

      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <div class="card-title" style="margin:0;">Projetos salvos</div>
          <button class="btn" id="pc-btn-refresh" style="padding:4px 10px;font-size:10px;">↻ Atualizar</button>
        </div>
        <div id="pc-hist-list"><span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">Carregando...</span></div>
      </div>
    `;

    function toMm(val, unit) { return unit === 'cm' ? val * 10 : val; }
    function fmt(n) { return parseFloat(n.toFixed(3)).toString(); }

    function setMsg(txt, ok) {
      const m = el.querySelector('#pc-save-msg');
      m.textContent = txt;
      m.style.color = ok ? 'var(--green)' : 'var(--red)';
      setTimeout(() => { m.textContent = ''; }, 3000);
    }

    el.querySelector('#add-btn').addEventListener('click', () => {
      const name  = el.querySelector('#p-name').value.trim() || ('Peça ' + (counter + 1));
      const wRaw  = parseFloat(el.querySelector('#p-w').value) || 0;
      const hRaw  = parseFloat(el.querySelector('#p-h').value) || 0;
      const wUnit = el.querySelector('#p-w-unit').value;
      const hUnit = el.querySelector('#p-h-unit').value;
      const w     = toMm(wRaw, wUnit);
      const h     = toMm(hRaw, hUnit);
      const x     = parseFloat(el.querySelector('#p-x').value) || 0;
      const y     = parseFloat(el.querySelector('#p-y').value) || 0;
      if (w <= 0 || h <= 0) return;

      const ci = counter % COLORS.length;
      pieces.push({ id: counter++, name, w, h, x, y, color: COLORS[ci] });
      el.querySelector('#p-name').value = '';
      el.querySelector('#p-x').value    = fmt(x + w);
      render();
    });

    el.querySelector('#ws-w').addEventListener('input', render);
    el.querySelector('#ws-h').addEventListener('input', render);

    el.querySelector('#pc-btn-salvar').addEventListener('click', async () => {
      const nome = el.querySelector('#pc-save-nome').value.trim();
      if (!nome)      { setMsg('Dê um nome ao projeto.', false); return; }
      if (!pieces.length) { setMsg('Adicione ao menos uma peça.', false); return; }
      const wsW = parseFloat(el.querySelector('#ws-w').value) || 400;
      const wsH = parseFloat(el.querySelector('#ws-h').value) || 400;
      try {
        await db.salvarProjeto(nome, wsW, wsH, pieces);
        el.querySelector('#pc-save-nome').value = '';
        setMsg('Projeto salvo!', true);
        carregarHistorico();
      } catch(e) { setMsg('Erro: ' + e.message, false); }
    });

    el.querySelector('#pc-btn-refresh').addEventListener('click', carregarHistorico);

    function carregarProjeto(item) {
      pieces  = JSON.parse(item.pecas);
      counter = pieces.length;
      el.querySelector('#ws-w').value = item.ws_w;
      el.querySelector('#ws-h').value = item.ws_h;
      render();
    }

    async function carregarHistorico() {
      const listEl = el.querySelector('#pc-hist-list');
      try {
        const rows = await db.listarProjetos();
        if (!rows.length) {
          listEl.innerHTML = '<span style="font-size:12px;color:var(--text-3);font-family:var(--font-mono);">Nenhum projeto salvo ainda.</span>';
          return;
        }
        listEl.innerHTML = '';
        rows.forEach(item => {
          const pecas = JSON.parse(item.pecas);
          const row   = document.createElement('div');
          row.className = 'hist-row';
          row.innerHTML = `
            <div class="hist-info">
              <span class="hist-nome">${item.nome}</span>
              <span class="hist-detalhe">${item.ws_w}×${item.ws_h} mm · ${pecas.length} peça${pecas.length !== 1 ? 's' : ''}</span>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn" style="padding:4px 10px;font-size:11px;" data-load='${JSON.stringify(item)}'>Carregar</button>
              <button class="btn btn-danger" style="padding:4px 10px;font-size:11px;" data-del="${item.id}">✕</button>
            </div>
          `;
          row.querySelector('[data-load]').addEventListener('click', e => {
            carregarProjeto(JSON.parse(e.currentTarget.dataset.load));
          });
          row.querySelector('[data-del]').addEventListener('click', async e => {
            await db.deletarProjeto(e.currentTarget.dataset.del);
            carregarHistorico();
          });
          listEl.appendChild(row);
        });
      } catch(e) {
        listEl.innerHTML = `<span style="font-size:12px;color:var(--red);font-family:var(--font-mono);">Erro ao carregar: ${e.message}</span>`;
      }
    }

    function render() {
      const wsW = parseFloat(el.querySelector('#ws-w').value) || 400;
      const wsH = parseFloat(el.querySelector('#ws-h').value) || 400;

      const tbody = el.querySelector('#pc-tbody');
      tbody.innerHTML = '';
      pieces.forEach(p => {
        const endX = p.x + p.w;
        const endY = p.y + p.h;
        const xOk  = endX <= wsW, yOk = endY <= wsH;
        const tr   = document.createElement('tr');
        tr.innerHTML = `
          <td><span class="piece-name-cell">
            <span class="piece-dot" style="background:${p.color}"></span>${p.name}
          </span></td>
          <td>${fmt(p.w)} × ${fmt(p.h)}</td>
          <td>${fmt(p.x)} · ${fmt(p.y)}</td>
          <td class="${xOk ? 'val-ok' : 'val-err'}">${fmt(endX)}</td>
          <td class="${yOk ? 'val-ok' : 'val-err'}">${fmt(endY)}</td>
          <td><button class="btn btn-danger" style="padding:4px 8px;font-size:11px;" data-id="${p.id}">✕</button></td>
        `;
        tr.querySelector('button').addEventListener('click', () => {
          pieces = pieces.filter(q => q.id !== p.id);
          render();
        });
        tbody.appendChild(tr);
      });

      const show = pieces.length > 0;
      el.querySelector('#pc-list-card').style.display   = show ? '' : 'none';
      el.querySelector('#pc-canvas-card').style.display = show ? '' : 'none';
      if (!show) return;

      const canvas = el.querySelector('#pc-canvas');
      const wrap   = canvas.parentElement;
      const PAD    = 36;
      const cw     = wrap.clientWidth || 640;
      const scale  = (cw - PAD * 2) / wsW;
      const ch     = Math.round(wsH * scale + PAD * 2);
      canvas.width  = cw;
      canvas.height = ch;
      canvas.style.height = ch + 'px';

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, cw, ch);

      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#181818';
      ctx.fillRect(PAD, PAD, wsW * scale, wsH * scale);

      ctx.setLineDash([2, 5]);
      ctx.strokeStyle = '#2a2a2a';
      ctx.lineWidth = 0.5;
      for (let gx = 50; gx < wsW; gx += 50) {
        ctx.beginPath(); ctx.moveTo(PAD + gx * scale, PAD); ctx.lineTo(PAD + gx * scale, PAD + wsH * scale); ctx.stroke();
      }
      for (let gy = 50; gy < wsH; gy += 50) {
        ctx.beginPath(); ctx.moveTo(PAD, PAD + gy * scale); ctx.lineTo(PAD + wsW * scale, PAD + gy * scale); ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(PAD, PAD, wsW * scale, wsH * scale);

      ctx.fillStyle = '#555';
      ctx.font = '10px "Space Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText('0', PAD - 14, PAD - 14);
      ctx.fillText(wsW + 'mm', PAD + wsW * scale - 28, PAD - 14);
      ctx.fillText(wsH + 'mm', PAD + wsW * scale + 4, PAD + wsH * scale - 10);

      pieces.forEach(p => {
        const px = PAD + p.x * scale, py = PAD + p.y * scale;
        const pw = p.w * scale,        ph = p.h * scale;
        const oob = (p.x + p.w > wsW) || (p.y + p.h > wsH);

        ctx.globalAlpha = 0.15;
        ctx.fillStyle   = p.color;
        ctx.fillRect(px, py, pw, ph);
        ctx.globalAlpha = 1;

        ctx.strokeStyle = oob ? '#e85447' : p.color;
        ctx.lineWidth   = 1.5;
        ctx.strokeRect(px, py, pw, ph);

        if (pw > 28 && ph > 14) {
          const fs  = Math.max(9, Math.min(12, pw / 8));
          ctx.font  = `700 ${fs}px "Space Mono", monospace`;
          ctx.fillStyle = p.color;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          const lbl = p.name.length > 16 ? p.name.slice(0, 15) + '…' : p.name;
          ctx.fillText(lbl, px + pw / 2, py + ph / 2);
        }

        ctx.font = '9px "Space Mono", monospace';
        ctx.fillStyle = '#666';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.fillText(`(${fmt(p.x)},${fmt(p.y)})`, px + 3, py + 3);
      });

      el.querySelector('#pc-legend').innerHTML = pieces.map(p =>
        `<span class="legend-item">
           <span class="legend-dot" style="background:${p.color}"></span>
           ${p.name} &nbsp;${fmt(p.w)}×${fmt(p.h)} mm
         </span>`
      ).join('');
    }

    render();
    window.addEventListener('resize', render);
    carregarHistorico();
  }
});
