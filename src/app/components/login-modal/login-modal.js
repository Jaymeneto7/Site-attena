// login-modal.js
// Reutilizável: cria um modal de login e expõe LoginModal.show(callback)
(function(){
  if(window.LoginModal) return;
  const AUTH_KEY = 'att_auth_token';
  const VALID_EMAIL = 'admin@attena.com';
  const VALID_PASS = 'attena2024';

  // cria DOM do modal uma vez
  function buildModal(){
    const tpl = document.createElement('div');
    tpl.id = 'lm-root';
    tpl.style.position = 'fixed';
    tpl.style.inset = '0';
    tpl.style.display = 'none';
    tpl.style.alignItems = 'center';
    tpl.style.justifyContent = 'center';
    tpl.style.zIndex = 99999;
    tpl.innerHTML = `
      <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45)"></div>
      <div style="background:#fff;border-radius:12px;padding:18px;max-width:420px;width:92%;box-shadow:0 12px 40px rgba(0,0,0,0.2);position:relative;">
        <button id="lm-close" style="position:absolute;right:10px;top:10px;border:0;background:transparent;font-weight:700;cursor:pointer">×</button>
        <h3 style="margin:0 0 6px">Acesso Administrativo</h3>
        <p style="margin:0 0 12px;color:#666;font-size:13px">Use: admin@attena.com / attena2024</p>
        <div style="display:flex;flex-direction:column;gap:8px">
          <input id="lm-email" placeholder="E-mail" style="padding:10px;border-radius:8px;border:1px solid #ddd" />
          <input id="lm-pass" placeholder="Senha" type="password" style="padding:10px;border-radius:8px;border:1px solid #ddd" />
          <div id="lm-error" style="color:#b00020;font-size:13px;min-height:18px"></div>
          <div style="display:flex;gap:8px;justify-content:flex-end">
            <button id="lm-cancel" style="padding:8px 12px;border-radius:8px;border:0;background:#eee;cursor:pointer">Cancelar</button>
            <button id="lm-submit" style="padding:8px 12px;border-radius:8px;border:0;background:#2f8f4e;color:#fff;cursor:pointer">Entrar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(tpl);

    // eventos
    tpl.querySelector('#lm-close').onclick = ()=> hideModal();
    tpl.querySelector('#lm-cancel').onclick = ()=> hideModal();
    tpl.querySelector('#lm-submit').onclick = submit;
    tpl.querySelector('#lm-email').onkeydown = e=> { if(e.key==='Enter') submit(); };
    tpl.querySelector('#lm-pass').onkeydown = e=> { if(e.key==='Enter') submit(); };

    return tpl;
  }

  function showModal(onSuccess){
    const root = document.getElementById('lm-root') || buildModal();
    root.style.display = 'flex';
    root.querySelector('#lm-error').textContent = '';
    root.querySelector('#lm-email').value = '';
    root.querySelector('#lm-pass').value = '';
    root.querySelector('#lm-email').focus();
    root._onSuccess = onSuccess;
  }

  function hideModal(){
    const root = document.getElementById('lm-root');
    if(root) root.style.display = 'none';
  }

  function submit(){
    const root = document.getElementById('lm-root');
    if(!root) return;
    const email = root.querySelector('#lm-email').value.trim();
    const pass = root.querySelector('#lm-pass').value.trim();
    const errEl = root.querySelector('#lm-error');
    if(email===VALID_EMAIL && pass===VALID_PASS){
      // simula token
      localStorage.setItem(AUTH_KEY, 'ok:'+Date.now());
      errEl.textContent = '';
      hideModal();
      if(typeof root._onSuccess === 'function') root._onSuccess();
    } else {
      errEl.textContent = 'Credenciais inválidas';
    }
  }

  function isAuthenticated(){
    return !!localStorage.getItem(AUTH_KEY);
  }

  function logout(){
    localStorage.removeItem(AUTH_KEY);
  }

  window.LoginModal = {
    show: showModal,
    hide: hideModal,
    isAuthenticated,
    logout
  };
})();
