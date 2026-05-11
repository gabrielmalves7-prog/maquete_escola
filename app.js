/* app.js — Bootstrap: lê o registro, constrói nav e ativa ferramentas */

(function () {
  const nav       = document.getElementById('tool-nav');
  const container = document.getElementById('tools-container');
  const tools     = ToolRegistry.getAll();

  tools.forEach((tool, i) => {
    /* pane */
    const pane = document.createElement('div');
    pane.className = 'tool-pane' + (i === 0 ? ' active' : '');
    pane.id = 'pane-' + tool.id;
    container.appendChild(pane);

    /* nav tab */
    const tab = document.createElement('button');
    tab.className = 'nav-tab' + (i === 0 ? ' active' : '');
    tab.textContent = tool.label;
    tab.dataset.target = 'pane-' + tool.id;
    nav.appendChild(tab);

    /* init tool */
    tool.init(pane);
  });

  /* tab switching */
  nav.addEventListener('click', e => {
    const tab = e.target.closest('.nav-tab');
    if (!tab) return;

    nav.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    container.querySelectorAll('.tool-pane').forEach(p => p.classList.remove('active'));

    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
})();
