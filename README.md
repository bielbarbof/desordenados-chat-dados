# Desordenados — Chat & Dados v0.2.0

Extensão para Owlbear Rodeo com chat em tempo real e rolador adaptado para Ordem Paranormal.

## v0.2.0 — Tech Noir

Esta versão mantém todas as funções da beta e refaz a interface:

- dark mode monocromático;
- detalhes de estado em vermelho;
- escala geral maior e mais legível;
- cards de chat e rolagem redesenhados;
- resultado da rolagem com maior hierarquia visual;
- bandeja de dados maior;
- novos ícones wireframe para d4, d6, d8, d10, d12 e d20;
- controles de quantidade, bônus e KH/KL ampliados;
- construtor de Teste de Ordem redesenhado;
- remoção do botão "Formato";
- novo ícone da extensão;
- popover ampliado para 380 × 800 px.

## Atualizar a versão hospedada

No repositório GitHub usado pelo Render, substitua os arquivos antigos pelos arquivos desta versão e faça o commit. O Render fará um novo deploy e o endereço do `manifest.json` continuará o mesmo.

Arquivos para subir:

- `_headers`
- `app.js`
- `icon.svg`
- `index.html`
- `manifest.json`
- `styles.css`
- `vercel.json`

Depois do deploy, recarregue a sala do Owlbear Rodeo.

## Rolagens

- Pools de múltiplos d20 mantêm o maior resultado por padrão (`kh`).
- KH pode ser alternado para KL no botão da bandeja.
- No construtor de Teste de Ordem, Atributo 0 rola `2d20kl`.
- Outros dados são somados normalmente.
- Comando manual: `/r 3d20+5`, `/r 2d20kl+10`, `/r 2d8+1d6+4`.
