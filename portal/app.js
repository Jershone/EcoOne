'use strict';
const $ = (selector) => document.querySelector(selector);
const drawer = $('#ai-drawer');
const iframe = $('#ai-frame');
const backdrop = $('#drawer-backdrop');
const baseHost = window.location.hostname;
const portMap = { cloud: 8443, home: 8123, navet: 8083, vault: 8444 };
const serviceUrl = (host) => window.location.protocol + '//' + host + '.' + baseHost;
const aiUrl = () => serviceUrl('ai');
let loaded = false;
function openAI() {
  const url = aiUrl();
  $('#ai-new-tab').href = url;
  if (!loaded) { iframe.src = url; loaded = true; }
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  backdrop.hidden = false;
  document.body.classList.add('drawer-open');
  $('#open-ai').setAttribute('aria-expanded', 'true');
}
function closeAI() {
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  backdrop.hidden = true;
  document.body.classList.remove('drawer-open');
  $('#open-ai').setAttribute('aria-expanded', 'false');
}
$('#open-ai').addEventListener('click', openAI);
$('#app-ai').addEventListener('click', (event) => { event.preventDefault(); openAI(); });
$('#close-ai').addEventListener('click', closeAI);
backdrop.addEventListener('click', closeAI);
iframe.addEventListener('load', () => drawer.classList.add('loaded'));
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAI(); });
document.querySelectorAll('[data-host]').forEach((link) => {
  const service = link.dataset.host;
  link.href = serviceUrl(service);
});
$('#app-flowy').addEventListener('click', (event) => {
  event.preventDefault();
  const ip = window.prompt('Enter the Omnexa host address for the optional AppFlowy server');
  if (ip && /^[a-zA-Z0-9.-]+$/.test(ip)) window.open('http://' + ip + ':8085', '_blank', 'noopener');
});
