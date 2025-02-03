
interface Pesce {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number
}

interface Squalo {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityX: number
}
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement | null;

let id: number;
let squali: Squalo[] = [creaSqualo()];
function update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, pesce: Pesce, squali: Squalo[]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  pesce.velocityY += 0.5
  pesce.y += pesce.velocityY

  if (pesce.y + pesce.height > canvas.height) {
    pesce.y = canvas.height - pesce.height
    pesce.velocityY = 0
  }

  ctx.fillStyle = "green";
  ctx.fillRect(pesce.x, pesce.y, pesce.width, pesce.height);

  // Muovi e disegna gli squali
  squali.forEach((squalo, index) => {
    squalo.x += squalo.velocityX;

    // Disegna lo squalo
    ctx.fillStyle = "gray";
    ctx.fillRect(squalo.x, squalo.y, squalo.width, squalo.height);

    // Se lo squalo esce dallo schermo, rimuovilo e crea uno nuovo
    if (squalo.x + squalo.width < 0) {
      squali.splice(index, 1);
      squali.push(creaSqualo());
    }

    // Verifica collisione
    if (
      pesce.x < squalo.x + squalo.width &&
      pesce.x + pesce.width > squalo.x &&
      pesce.y < squalo.y + squalo.height &&
      pesce.y + pesce.height > squalo.y
    ) {
      // Se c'è collisione, termina il gioco (oppure fai qualcosa, come un Game Over)
      console.log("Game Over!");
      cancelAnimationFrame(id);
    }
  })
  id = requestAnimationFrame(() => update(ctx, canvas, pesce, squali));
}

function creaSqualo(): Squalo {
  const yPos = Math.random() * (canvas!.height - 50) // Genera la posizione casuale di y
  const width = Math.random() * 50 + 30 // Genera la larghezza tra 30 e 80
  const height = Math.random() * 50 + 30 // Genera l'altezza tra 30 e 80
  return {
    x: canvas!.width,  // L'ostacolo parte dalla parte destra dello schermo
    y: yPos,
    width,
    height,
    velocityX: -5 // Spinta verso sinistra
  }
}




if (canvas) {
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  if (ctx) {
    canvas.width = window.innerWidth
    canvas.height = 300

    console.log("Canvas e contesto configurati!");
    const pesce: Pesce = {
      x: 50,
      y: 230,
      width: 40,
      height: 40,
      velocityY: 0
    }

    ctx.fillStyle = "green";
    ctx.fillRect(pesce.x, pesce.y, pesce.width, pesce.height);

    update(ctx, canvas, pesce, squali)

    document.addEventListener("keydown", (event) => {
      if (event.code === "Space") {
        console.log("salva")
        pesce.velocityY = -10
      }
    })
  } else {
    console.error("Impossibile ottenere il contesto 2D");
  }
} else {
  console.error("Canvas non trovato nel DOM");
}

