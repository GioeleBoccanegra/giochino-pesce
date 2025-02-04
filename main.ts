interface Pesce {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  frame: number;
  image: HTMLImageElement;
}

interface Scoglio {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number;
  image: HTMLImageElement;
}

const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;

const scoglioImg = new Image();
scoglioImg.src = 'scoglio.png';

const pesceImg = new Image();
pesceImg.src = 'walkPesce.png';

const sfondoImg = new Image();
sfondoImg.src = 'back.png';  // Sostituisci con il percorso dell'immagine di sfondo

const numFrames = 4;  // Numero di fotogrammi nella sprite sheet
const frameWidth = 45;  // Larghezza di ogni fotogramma
const frameHeight = 40;  // Altezza di ogni fotogramma

let id: number;
let scogli: Scoglio[] = [creaScoglio()];
let isGameOver = false;  // Aggiungi il flag di stato per determinare se il gioco è finito

let lastFrameTime = 0;  // Tempo dell'ultimo frame
const frameDuration = 150;  // Durata in millisecondi di ogni fotogramma

// Velocità di salto e gravità ridotti per un movimento più lento
const jumpSpeed = -7; // Velocità di salto (più lenta)
const gravity = 0.2;  // Gravità (più lenta per la discesa)

function update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pesce: Pesce, scogli: Scoglio[], currentTime: number) {
  // Calcola il deltaTime (tempo passato dall'ultimo frame)
  const deltaTime = currentTime - lastFrameTime;

  // Se è passato abbastanza tempo per il prossimo frame, aggiorna
  if (deltaTime >= frameDuration) {
    lastFrameTime = currentTime;  // Aggiorna l'ultimo tempo di frame
    pesce.frame = (pesce.frame + 1) % numFrames;  // Passa al fotogramma successivo
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disegna lo sfondo prima degli altri elementi
  ctx.drawImage(sfondoImg, 0, 0, canvas.width, canvas.height);

  if (isGameOver) {
    // Mostra il messaggio di Game Over
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over! Premi 'R' per Ricominciare", canvas.width / 2, canvas.height / 2);
    return; // Ferma l'animazione se il gioco è finito
  }

  // Aggiungi la gravità al movimento verticale
  pesce.velocityY += gravity;  // La gravità applica una lenta discesa
  pesce.y += pesce.velocityY;

  // Impedisce al pesce di scendere sotto il fondo
  if (pesce.y + pesce.height > canvas.height) {
    pesce.y = canvas.height - pesce.height;
    pesce.velocityY = 0; // Fermare la discesa
  }

  // Calcola la posizione orizzontale del fotogramma corrente
  const sx = pesce.frame * frameWidth;  // sx per selezionare il fotogramma giusto

  // Disegna il fotogramma corrente dell'animazione
  ctx.drawImage(pesce.image, sx, 0, frameWidth, frameHeight, pesce.x, pesce.y, pesce.width, pesce.height);

  // Muovi e disegna gli scogli
  scogli.forEach((scoglio, index) => {
    scoglio.x += scoglio.velocityX;

    // Disegna lo scoglio
    ctx.drawImage(scoglio.image, scoglio.x, scoglio.y, scoglio.width, scoglio.height);

    // Se lo scoglio esce dallo schermo, rimuovilo e crea uno nuovo
    if (scoglio.x + scoglio.width < 0) {
      scogli.splice(index, 1);
      scogli.push(creaScoglio());
    }

    // Verifica collisione
    if (
      pesce.x < scoglio.x + scoglio.width &&
      pesce.x + pesce.width > scoglio.x &&
      pesce.y < scoglio.y + scoglio.height &&
      pesce.y + pesce.height > scoglio.y
    ) {
      // Se c'è collisione, termina il gioco
      isGameOver = true;
      cancelAnimationFrame(id);  // Ferma l'animazione
    }
  });

  // Continua il ciclo di animazione se il gioco non è finito
  if (!isGameOver) {
    id = requestAnimationFrame((newTime) => update(ctx, canvas, pesce, scogli, newTime));
  }
}

function creaScoglio(): Scoglio {
  const width = Math.random() * 30 + 30 // Genera la larghezza tra 30 e 60
  const height = Math.random() * 30 + 30 // Genera l'altezza tra 30 e 0
  const yPos = canvas!.height - height; // Posiziona lo scoglio esattamente sul terreno
  return {
    x: canvas!.width,  // L'ostacolo parte dalla parte destra dello schermo
    y: yPos,
    width,
    height,
    velocityX: -3, // Spinta verso sinistra
    image: scoglioImg
  };
}

if (canvas) {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (ctx) {
    canvas.width = window.innerWidth;
    canvas.height = 300;

    console.log("Canvas e contesto configurati!");
    const pesce: Pesce = {
      x: 50,
      y: 230,
      width: frameWidth,
      height: frameHeight,
      velocityY: 0,
      frame: 0,
      image: pesceImg
    };

    pesceImg.onload = () => {
      update(ctx, canvas, pesce, scogli, performance.now());
    };

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space" && !isGameOver) {
        pesce.velocityY = jumpSpeed;  // Salto più lento
      } else if (event.code === "KeyR" && isGameOver) {
        // Ricomincia il gioco quando premi 'R'
        isGameOver = false;
        scogli = [creaScoglio()];
        pesce.y = 230;  // Ripristina la posizione del pesce
        pesce.velocityY = 0;  // Ripristina la velocità verticale
        pesce.frame = 0;  // Ripristina il fotogramma
        update(ctx, canvas, pesce, scogli, performance.now());  // Riavvia il gioco
      }
    });
  } else {
    console.error("Impossibile ottenere il contesto 2D");
  }
} else {
  console.error("Canvas non trovato nel DOM");
}
