import './style.css'

const btn_wpp = document.getElementById('botao_wpp');

btn_wpp.addEventListener('click', () => {
  window.open(`https://wa.me/5519989776179`, '_blank');
});