
    // ESTADO DO JOGO
    let gridSize = 3;
    let tiles = [];
    let moves = 0;
    let timerInterval = null;
    let secondsElapsed = 0;
    let isGameRunning = false;
    let audioCtx = null;

    // ELEMENTOS DOM
    const menuScreen = document.getElementById('menu-screen');
    const gameScreen = document.getElementById('game-screen');
    const boardElement = document.getElementById('board');
    const movesDisplay = document.getElementById('moves-display');
    const timerDisplay = document.getElementById('timer-display');
    const diffBadge = document.getElementById('current-diff-badge');
    const victoryModal = document.getElementById('victory-modal');
    const victoryCard = document.getElementById('victory-card');

    // SELEÇÃO DE DIFICULDADE
    function selectDifficulty(size) {
        gridSize = size;
      [3, 4, 5].forEach(s => {
        const btn = document.getElementById(`btn-diff-${s}`);
    const indicator = btn.querySelector('.radio-indicator');
    const dot = indicator.querySelector('div');

    if (s === size) {
        btn.className = "diff-btn group relative flex items-center justify-between p-4 rounded-2xl border border-indigo-500/50 bg-indigo-500/10 text-white font-semibold transition-all duration-200 hover:border-indigo-400";
    indicator.className = "radio-indicator w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center";
    dot.className = "w-2.5 h-2.5 rounded-full bg-indigo-400";
        } else {
        btn.className = "diff-btn group relative flex items-center justify-between p-4 rounded-2xl border border-slate-700 bg-slate-800/40 text-slate-300 font-semibold transition-all duration-200 hover:border-slate-600";
    indicator.className = "radio-indicator w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center";
    dot.className = "w-2.5 h-2.5 rounded-full bg-transparent";
        }
      });
    }

    // INICIAR O JOGO
    function startGame() {
        menuScreen.classList.add('hidden-screen');
    gameScreen.classList.remove('hidden-screen');

    const names = {3: "Modo Fácil 3x3", 4: "Modo Médio 4x4", 5: "Modo Difícil 5x5" };
    diffBadge.innerText = names[gridSize];

    restartGame();
    }

    // VOLTAR AO MENU
    function goToMenu() {
        stopTimer();
    gameScreen.classList.add('hidden-screen');
    menuScreen.classList.remove('hidden-screen');
    }

    // REINICIAR PARTIDA
    function restartGame() {
        stopTimer();
    moves = 0;
    secondsElapsed = 0;
    isGameRunning = true;
    movesDisplay.innerText = "0";
    timerDisplay.innerText = "00:00";

    initBoard();
    shuffleTiles();
    renderBoard();
    startTimer();
    }

    // INICIALIZAR TABULEIRO RESOLVIDO
    function initBoard() {
      const totalTiles = gridSize * gridSize;
    tiles = [];
    for (let i = 1; i < totalTiles; i++) {
        tiles.push(i);
      }
    tiles.push(0); // 0 representa o espaço vazio
    }

    // EMBARALHAR COM GARANTIA DE SOLUÇÃO
    function shuffleTiles() {
      const totalMoves = gridSize * gridSize * 25;
    for (let i = 0; i < totalMoves; i++) {
        const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidAdjacentIndices(emptyIndex);
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    // Troca o vazio com uma peça adjacente válida
    [tiles[emptyIndex], tiles[randomMove]] = [tiles[randomMove], tiles[emptyIndex]];
      }
    }

    // OBTER ÍNDICES ADJACENTES VÁLIDOS
    function getValidAdjacentIndices(index) {
      const valid = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

      if (row > 0) valid.push(index - gridSize); // Cima
    if (row < gridSize - 1) valid.push(index + gridSize); // Baixo
      if (col > 0) valid.push(index - 1); // Esquerda
    if (col < gridSize - 1) valid.push(index + 1); // Direita

    return valid;
    }

    // RENDERIZAR PEÇAS NO DOM COM POSICIONAMENTO ABSOLUTO
    function renderBoard() {
        boardElement.innerHTML = '';

    const gap = 8; // Espaçamento em px
    const boardSize = boardElement.clientWidth;
    const tileSize = (boardSize - (gap * (gridSize - 1))) / gridSize;

      tiles.forEach((val, index) => {
        if (val === 0) return; // Não renderiza elemento HTML para o espaço vazio

    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    const tileNode = document.createElement('button');
    tileNode.type = 'button';

    // Verifica se está na posição correta da solução
    const isCorrect = val === (index + 1);
    const colorClass = isCorrect ? 'tile-correct' : 'bg-gradient-to-br from-indigo-600 to-slate-800 text-white';

    // Tamanho de fonte dinâmico dependendo da grade
    const fontSizeClass = gridSize === 5 ? 'text-lg sm:text-xl' : gridSize === 4 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl';

    tileNode.className = `absolute tile-transition rounded-xl font-extrabold flex items-center justify-center tile-shadow border border-white/10 cursor-pointer ${colorClass} ${fontSizeClass}`;

    tileNode.style.width = `${tileSize}px`;
    tileNode.style.height = `${tileSize}px`;

    const posX = col * (tileSize + gap);
    const posY = row * (tileSize + gap);
    tileNode.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;

    tileNode.innerText = val;
        tileNode.onclick = () => handleTileClick(index);

    boardElement.appendChild(tileNode);
      });
    }

    // CLIQUE / TOQUE NA PEÇA
    function handleTileClick(index) {
      if (!isGameRunning) return;

    const emptyIndex = tiles.indexOf(0);
    const validMoves = getValidAdjacentIndices(emptyIndex);

    if (validMoves.includes(index)) {
        // Mover peça
        [tiles[emptyIndex], tiles[index]] = [tiles[index], tiles[emptyIndex]];
    moves++;
    movesDisplay.innerText = moves;

    renderBoard();
    checkVictory();
      }
    }

    // CRONÔMETRO
    function startTimer() {
        stopTimer();
      timerInterval = setInterval(() => {
        secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    timerDisplay.innerText = `${mins}:${secs}`;
      }, 1000);
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
    timerInterval = null;
      }
    }

    // VERIFICAR VITÓRIA
    function checkVictory() {
      const totalTiles = gridSize * gridSize;
    for (let i = 0; i < totalTiles - 1; i++) {
        if (tiles[i] !== i + 1) return;
      }
    if (tiles[totalTiles - 1] !== 0) return;

    // Se chegou aqui, VENCEU!
    isGameRunning = false;
    stopTimer();
    playVictorySound();
    showVictoryModal();
    }

    // SINTETIZADOR DE ÁUDIO PARA VITÓRIA (Web Audio API)
    function playVictorySound() {
      try {
        if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        }

    const now = audioCtx.currentTime;

    // Melodia de Fanfarra Alegre (Notas em Hz)
    // Dó4, Mi4, Sol4, Dó5, Sol4, Dó5, Mi5, Sol5
    const melody = [
    {note: 523.25, time: 0.00, dur: 0.12, type: 'triangle' }, // C5
    {note: 659.25, time: 0.12, dur: 0.12, type: 'triangle' }, // E5
    {note: 783.99, time: 0.24, dur: 0.12, type: 'triangle' }, // G5
    {note: 1046.50, time: 0.36, dur: 0.20, type: 'square' },   // C6
    {note: 783.99, time: 0.52, dur: 0.12, type: 'triangle' }, // G5
    {note: 1046.50, time: 0.64, dur: 0.18, type: 'triangle' }, // C6
    {note: 1318.51, time: 0.82, dur: 0.22, type: 'triangle' }, // E6
    {note: 1567.98, time: 1.05, dur: 0.60, type: 'square' }    // G6 (Final brilhante)
    ];

    // Acompanhamento / Acordes Festivos de Fundo (Harmonia)
    const chords = [
    // Acorde de Dó Maior (C Major)
    {note: 261.63, time: 0.00, dur: 0.35, type: 'sine' }, // C4
    {note: 329.63, time: 0.00, dur: 0.35, type: 'sine' }, // E4
    // Acorde de Sol Maior (G Major)
    {note: 392.00, time: 0.36, dur: 0.40, type: 'sine' }, // G4
    {note: 493.88, time: 0.36, dur: 0.40, type: 'sine' }, // B4
    // Acorde Triunfal Final (C Major Brilhante)
    {note: 523.25, time: 0.82, dur: 0.80, type: 'sine' }, // C5
    {note: 659.25, time: 0.82, dur: 0.80, type: 'sine' }, // E5
    {note: 783.99, time: 0.82, dur: 0.80, type: 'sine' }  // G5
    ];

        // Toca a Melodia Principal
        melody.forEach(n => {
          const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = n.type;
    osc.frequency.setValueAtTime(n.note, now + n.time);

    // Envelope de volume com decay natural
    gain.gain.setValueAtTime(0, now + n.time);
    gain.gain.linearRampToValueAtTime(0.2, now + n.time + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.dur);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + n.time);
    osc.stop(now + n.time + n.dur);
        });

        // Toca os Acordes de Fundo
        chords.forEach(c => {
          const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = c.type;
    osc.frequency.setValueAtTime(c.note, now + c.time);

    gain.gain.setValueAtTime(0, now + c.time);
    gain.gain.linearRampToValueAtTime(0.12, now + c.time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + c.time + c.dur);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + c.time);
    osc.stop(now + c.time + c.dur);
        });

      } catch (e) {
        console.log("Áudio indisponível:", e);
      }
    }

    // EXIBIR MODAL DE VITÓRIA
    function showVictoryModal() {
        document.getElementById('modal-time').innerText = timerDisplay.innerText;
    document.getElementById('modal-moves').innerText = moves;

    victoryModal.classList.remove('opacity-0', 'pointer-events-none');
    victoryCard.classList.remove('scale-95');
    victoryCard.classList.add('scale-100');
    }

    function closeVictoryModal() {
        victoryModal.classList.add('opacity-0', 'pointer-events-none');
    victoryCard.classList.remove('scale-100');
    victoryCard.classList.add('scale-95');
    }

    // AJUSTAR DIMENSÕES AO REDIMENSIONAR A TELA
    window.addEventListener('resize', () => {
      if (!gameScreen.classList.contains('hidden-screen')) {
        renderBoard();
      }
    });

    // INICIALIZAÇÃO AO CARREGAR
    window.onload = () => {
        selectDifficulty(3);
    };
