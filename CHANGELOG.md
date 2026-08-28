# Changelog

## v0.3.0 — Painel lateral de testes

### Nova aba +TESTE
- O antigo popup de teste foi removido.
- `+ TESTE` agora expande o popover do Owlbear e abre um painel lateral Tech Noir.
- Ao fechar o painel, o DSO Chat volta automaticamente à largura normal.

### Ficha rápida de perícias
- Todas as perícias aparecem em uma matriz única com as colunas:
  - **Perícia**
  - **Dados** (atributo usado)
  - **Bônus** (calculado automaticamente)
  - **Treino**
  - **Outros**
- `Outros` é sempre um bônus ou penalidade digitado manualmente pelo jogador.
- `Bônus` é calculado como `Treino + Outros`.
- As configurações ficam salvas localmente por jogador e por sala.

### Atributos
- AGI, FOR, INT, PRE e VIG possuem valores configuráveis no topo do painel.
- O valor do atributo determina a quantidade de d20 do teste.
- Atributo 0 continua usando a regra especial `2d20kl`.

### Rolagem rápida
- O ícone de d20 antes de cada perícia virou o botão de rolagem.
- Clicar nele publica imediatamente o teste daquela perícia no chat.
- O painel permanece aberto após a rolagem para permitir vários testes em sequência.

### Hierarquia visual de treinamento
- Treino `0`: branco/cinza.
- Treino `5`: verde.
- Treino `10`: azul.
- Treino `15`: amarelo.
- A cor é aplicada à linha da perícia, preservando a leitura rápida da ficha.

### Mantido da v0.2.1
- DSO Tech Noir.
- Crítico natural 20 em verde.
- Exclusão de mensagens e rolagens.
- Chat em tempo real.
- Rolador rápido e comandos `/r`.
