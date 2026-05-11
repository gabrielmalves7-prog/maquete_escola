/*
 * tools.js — Registro de ferramentas
 * ──────────────────────────────────────────────────────────────
 * Para adicionar uma nova ferramenta:
 *   1. Crie um arquivo  tool-<nome>.js
 *   2. Registre aqui com  registerTool({ id, label, init })
 *   3. Inclua o <script> no index.html antes de app.js
 *
 * Cada ferramenta deve exportar uma função init(containerId)
 * que injeta o HTML e inicializa a lógica no elemento #containerId.
 */

const ToolRegistry = (() => {
  const tools = [];

  function register(tool) {
    /* tool = { id: string, label: string, init: function(el) } */
    tools.push(tool);
  }

  function getAll() { return [...tools]; }

  return { register, getAll };
})();
