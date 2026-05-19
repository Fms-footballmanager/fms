COMO USAR

1. Substitua o seu index.html pelo index.html desta pasta.
2. Copie a pasta assets para a raiz do seu projeto.
3. Estrutura obrigatoria:

assets/players/ifma/luis/sprite.png
assets/players/ifma/luis/portrait.png

4. Abra o jogo por servidor local, nao clicando direto no HTML.

Exemplo:
python -m http.server 8000

Depois abra:
http://localhost:8000

PARA ADICIONAR OUTRO JOGADOR

Crie uma pasta assim:
assets/players/ifma/pedrog/sprite.png
assets/players/ifma/pedrog/portrait.png

E adicione no index.html dentro de PLAYER_IMAGE_ASSETS:

pedrog: {
  sprite: 'assets/players/ifma/pedrog/sprite.png',
  portrait: 'assets/players/ifma/pedrog/portrait.png'
}
