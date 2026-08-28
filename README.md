# DSO Chat v0.2.1

Extensão para Owlbear Rodeo com chat em tempo real e rolador adaptado para Ordem Paranormal, usando a identidade visual Tech Noir da DSO.

## v0.2.1 — Refinamento do chat

- título simplificado para **DSO CHAT**;
- removido o tópico `DESORDENADOS // DSO`;
- removida a sigla visual `MSG` dos cards de mensagem;
- removidos os controles de formatação `B`, `I` e `</>`;
- resultado natural 20 agora transforma o card de rolagem em um estado crítico verde;
- botão de lixeira aparece no hover das mensagens e rolagens que podem ser apagadas;
- jogadores podem apagar apenas as próprias entradas;
- Mestres podem apagar qualquer mensagem ou rolagem;
- exclusões são sincronizadas com participantes conectados;
- IDs apagados são guardados localmente e sincronizados no retorno à sala para reduzir o risco de mensagens excluídas reaparecerem;
- todas as funções de chat, dados, Teste de Ordem, KH/KL, histórico local e comandos `/r` foram preservadas.

## Atualizar a versão hospedada

No mesmo repositório GitHub usado pelo Render, envie os arquivos desta versão por cima dos antigos e faça um novo commit. Depois, faça o deploy no Render. O endereço do `manifest.json` continua o mesmo.

Arquivos para subir:

- `_headers`
- `app.js`
- `icon.svg`
- `index.html`
- `manifest.json`
- `styles.css`
- `vercel.json`
- `CHANGELOG.md`
- `README.md`

## Exclusão de mensagens

O histórico ainda é local, sem banco de dados central. A exclusão remove a entrada do histórico local e envia um evento de remoção aos jogadores conectados. A v0.2.1 também mantém uma lista local de IDs apagados e a inclui na sincronização de histórico.

## Rolagens

- Pools de múltiplos d20 mantêm o maior resultado por padrão (`kh`).
- KH pode ser alternado para KL no botão da bandeja.
- No construtor de Teste de Ordem, Atributo 0 rola `2d20kl`.
- Outros dados são somados normalmente.
- Comando manual: `/r 3d20+5`, `/r 2d20kl+10`, `/r 2d8+1d6+4`.
