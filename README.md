# DSO Chat v0.3.0

Extensão para **Owlbear Rodeo** com chat, rolador de dados e uma ficha rápida de testes para **Ordem Paranormal RPG**, usando a identidade visual Tech Noir da DSO.

## Destaques

- Chat sincronizado entre participantes da sala.
- Histórico local de mensagens e rolagens.
- Botão para apagar mensagens próprias; Mestre pode apagar qualquer entrada.
- Bandeja de d4, d6, d8, d10, d12 e d20.
- Pools de d20 mantêm automaticamente o maior; atributo 0 usa 2d20 e mantém o menor.
- Natural 20 recebe tratamento visual verde de crítico.
- Comandos como `/r 3d20+5`, `/r 2d20kl+10` e `/r 2d8+1d6+4`.

## Painel lateral +TESTE

A v0.3.0 substitui o antigo popup por uma ficha rápida lateral.

No topo, configure os valores de **AGI, FOR, INT, PRE e VIG**. Cada linha de perícia permite escolher:

- **Dados** — qual atributo a perícia usa;
- **Bônus** — valor calculado automaticamente como `Treino + Outros`;
- **Treino** — 0, 5, 10 ou 15;
- **Outros** — bônus ou penalidade manual.

Para rolar um teste, basta clicar no **d20 à esquerda do nome da perícia**.

### Cores de treinamento

- 0: padrão monocromático;
- 5: verde;
- 10: azul;
- 15: amarelo.

As escolhas são salvas localmente por jogador e por sala.

## Atualização no GitHub / Render

Substitua os arquivos da versão anterior pelos desta pasta, faça **Commit changes** e publique o novo deploy no Render.

O endereço de instalação no Owlbear continua o mesmo, por exemplo:

```text
https://desordenados-chat-dados.onrender.com/manifest.json
```

## Observação sobre histórico

O histórico e a ficha rápida ainda usam armazenamento local do navegador. Não há banco de dados central nesta versão.
