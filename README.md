# Desordenados — Chat & Dados v0.1.0

Extensão pronta para instalar no **Owlbear Rodeo**, criada como um painel vertical de chat + rolador de dados para Ordem Paranormal RPG.

## O que já está funcionando

- Chat ao vivo entre os participantes da sala.
- Nome de personagem separado do nome da conta: clique no nome no topo para trocar para `Jazz`, `Romeu`, `Derek Cruz` etc.
- Histórico local por sala, até 500 entradas.
- Sincronização de até 200 entradas recentes entre pessoas que estiverem conectadas quando a extensão abrir.
- Cards de rolagem com nome, tempo, descrição, fórmula, resultado e detalhes dos dados.
- Bandeja de `d4`, `d6`, `d8`, `d10`, `d12` e `d20`.
- Quantidade, bônus e botão **Rolar**.
- Pools com vários d20 mantêm o **maior** por padrão (`kh`).
- Botão `KH/KL` para alternar entre maior e menor.
- Construtor de **Teste de Ordem** com as 28 perícias e seus atributos-base.
- Atributo 0 automaticamente vira `2d20kl`.
- Comando `/r` para fórmulas rápidas.
- 20 natural e 1 natural recebem destaque discreto.
- Usa `crypto.getRandomValues` para gerar os resultados quando disponível.

## Regra de d20 implementada

Nos testes de perícia de Ordem, o valor do atributo define quantos d20 são rolados; usa-se o maior resultado e soma-se o bônus da perícia. Se o atributo for 0, rolam-se 2d20 e usa-se o menor.

O rolador rápido segue a mesma filosofia: ao selecionar mais de um d20 ele usa `KH` automaticamente. Para atributo 0 ou qualquer situação em que você queira o pior, clique em `KH` para mudar para `KL`.

## Instalar localmente no Owlbear

Esta versão não precisa de Node, npm ou build.

1. Tenha Python 3 instalado.
2. Abra um terminal nesta pasta.
3. Rode:

```bash
python serve.py
```

4. No perfil do Owlbear Rodeo, escolha **Add Extension**.
5. Cole:

```text
http://localhost:5173/manifest.json
```

6. Habilite a extensão na sua sala.

O servidor local já envia o cabeçalho CORS exigido pelo Owlbear.

## Hospedar permanentemente

Você pode arrastar esta pasta para **Netlify** ou publicar no **Vercel**. Os arquivos `_headers` e `vercel.json` já incluem o CORS do Owlbear.

Depois de publicada, instale usando:

```text
https://SEU-DOMINIO/manifest.json
```

A versão atual espera estar na raiz do domínio.

## Comandos de rolagem

```text
/r 3d20+5
/r 2d20kl+10
/r 2d8+1d6+4
/r d20
```

`/r 3d20+5` é interpretado como `3d20kh + 5` automaticamente.

## Histórico desta versão

O Broadcast do Owlbear é efêmero e o metadata da sala tem limite pequeno. Por isso a v0.1.0 usa:

- `localStorage` por sala para persistência;
- pedido de sincronização quando a extensão abre;
- merge por ID para evitar mensagens duplicadas.

Isso funciona bem para sessões normais sem exigir banco de dados. O passo seguinte é um backend opcional, como Supabase, para recuperar o histórico mesmo quando nenhum participante da sessão anterior estiver online.

## Arquivos

- `manifest.json` — manifesto que o Owlbear instala.
- `index.html` — interface.
- `styles.css` — visual inspirado na referência enviada.
- `app.js` — chat, Owlbear SDK, dados e regras.
- `icon.svg` — ícone da extensão.
- `serve.py` — servidor local com CORS.
- `_headers` — CORS para Netlify.
- `vercel.json` — CORS para Vercel.

## Próximas versões

A base foi feita para receber depois:

- rolagem privada;
- rolagem cega para o mestre;
- perfis/fichas salvas de personagem;
- atalhos de perícias;
- ataques e dano salvos;
- crítico/margem de ameaça;
- Supabase para histórico centralizado;
- iniciativa e condições.
