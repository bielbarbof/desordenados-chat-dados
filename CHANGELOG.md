# Changelog

## 0.2.1 — DSO Chat

### Interface
- Cabeçalho simplificado para **DSO CHAT**.
- Removido `DESORDENADOS // DSO`.
- Removido o marcador `MSG` dos cards.
- Removidos os botões de formatação `B`, `I` e `</>`.
- Mantida a identidade Tech Noir monocromática com acentos vermelhos.

### Rolagens
- Natural 20 agora ativa um estado de crítico verde no card inteiro.
- O resultado, o dado mantido e os detalhes recebem acentos verdes enquanto o restante da UI continua na linguagem DSO.

### Chat
- Adicionado botão de lixeira por mensagem/rolagem.
- Jogadores podem apagar as próprias entradas.
- Mestres podem apagar qualquer entrada.
- Exclusões são transmitidas aos participantes conectados.
- IDs apagados são persistidos localmente e sincronizados junto do histórico para impedir reidratação simples de mensagens removidas.

## 0.2.0 — Tech Noir

### Visual
- Interface refeita em estética Tech Noir.
- Paleta monocromática com acentos vermelhos.
- Escala tipográfica e controles ampliados.
- Cards de mensagens e rolagens refeitos em dark mode.
- Destaque maior para fórmula, resultado e dado mantido.
- Bandeja de dados redesenhada.
- Ícones de dados substituídos por wireframes SVG.
- Construtor de testes redesenhado.
- Novo ícone da extensão.
- Removido o botão "Formato".

### Funcionalidade
- Mantidas as funções de chat, histórico local, sincronização, Teste de Ordem, KH/KL e comandos `/r` da v0.1.0.
