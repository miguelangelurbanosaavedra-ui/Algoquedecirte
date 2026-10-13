const sobre = document.getElementById("sobre");
const carta = document.getElementById("carta");
const velo = document.getElementById("velo");
const escena = document.querySelector(".escena");
const cerrar = document.getElementById("cerrar");
const instruccion = document.getElementById("instruccion");
const canvas = document.getElementById("particulas");

const ctx = canvas.getContext("2d");

let cartaAbierta = false;
let animacionFrame = null;
let ancho = 0;
let alto = 0;
let particulas = [];

function abrirCarta() {
    if (cartaAbierta) return;

    cartaAbierta = true;

    sobre.classList.add("abierto");
    sobre.setAttribute("aria-expanded", "true");
    sobre.setAttribute("aria-label", "Sobre abierto");

    instruccion.textContent = "Una carta escrita para ti.";

    velo.classList.add("visible");
    escena.classList.add("atenuada");

    window.setTimeout(() => {
        carta.classList.add("visible");
        carta.setAttribute("aria-hidden", "false");
        carta.inert = false;

        document.body.classList.add("modal-abierto");

        cerrar.focus();
    }, 500);
}

function cerrarCarta() {
    if (!cartaAbierta) return;

    cartaAbierta = false;

    carta.classList.remove("visible");
    carta.setAttribute("aria-hidden", "true");
    carta.inert = true;

    velo.classList.remove("visible");
    escena.classList.remove("atenuada");

    sobre.classList.remove("abierto");
    sobre.setAttribute("aria-expanded", "false");
    sobre.setAttribute("aria-label", "Abrir la carta");

    instruccion.textContent = "Haz clic en el sobre para abrirlo";

    document.body.classList.remove("modal-abierto");

    // Devolver el foco al sobre después de la transición.
    window.setTimeout(() => {
        if (!cartaAbierta) {
            sobre.focus();
        }
    }, 100);
}

sobre.addEventListener("click", abrirCarta);

cerrar.addEventListener("click", cerrarCarta);

document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && cartaAbierta) {
        cerrarCarta();
    }
});

// Cerrar al hacer clic en el espacio oscuro exterior.
carta.addEventListener("click", (evento) => {
    if (evento.target === carta) {
        cerrarCarta();
    }
});

function ajustarCanvas() {
    const escala = Math.min(window.devicePixelRatio || 1, 2);

    ancho = window.innerWidth;
    alto = window.innerHeight;

    canvas.width = Math.round(ancho * escala);
    canvas.height = Math.round(alto * escala);

    canvas.style.width = `${ancho}px`;
    canvas.style.height = `${alto}px`;

    ctx.setTransform(escala, 0, 0, escala, 0, 0);

    crearParticulas();
}

function crearParticulas() {
    const cantidad = Math.min(
        95,
        Math.max(35, Math.floor((ancho * alto) / 14000))
    );

    particulas = [];

    for (let i = 0; i < cantidad; i++) {
        particulas.push(crearParticula(true));
    }
}

function crearParticula(distribuirPorPantalla = false) {
    const tonos = [
        "201, 143, 160", 
        "231, 208, 183", 
        "153, 166, 207", 
        "255, 231, 219"  
    ];

    return {
        x: Math.random() * ancho,
        y: distribuirPorPantalla
            ? Math.random() * alto
            : alto + Math.random() * 35,

        radio: Math.random() * 2 + 0.5,

        velocidad: Math.random() * 0.55 + 0.2,

        deriva: (Math.random() - 0.5) * 0.45,

        fase: Math.random() * Math.PI * 2,

        oscilacion: Math.random() * 0.018 + 0.004,

        opacidad: Math.random() * 0.45 + 0.2,

        color: tonos[Math.floor(Math.random() * tonos.length)],

        corazon: Math.random() < 0.12,

        giro: Math.random() * Math.PI * 2,

        velocidadGiro: (Math.random() - 0.5) * 0.012
    };
}

function dibujarCorazon(x, y, tamano, giro) {
    ctx.save();

    ctx.translate(x, y);
    ctx.rotate(giro);
    ctx.scale(tamano / 12, tamano / 12);

    ctx.beginPath();
    ctx.moveTo(0, 4);

    ctx.bezierCurveTo(-12, -3, -7, -11, 0, -5);
    ctx.bezierCurveTo(7, -11, 12, -3, 0, 4);

    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function dibujarParticulas() {
    ctx.clearRect(0, 0, ancho, alto);

    for (const p of particulas) {
        p.y -= p.velocidad;
        p.x += p.deriva + Math.sin(p.fase) * 0.25;

        p.fase += p.oscilacion;
        p.giro += p.velocidadGiro;

        if (p.y < -20) {
            Object.assign(p, crearParticula(false));
        }

        if (p.x < -15) p.x = ancho + 10;
        if (p.x > ancho + 15) p.x = -10;

        const brillo = (
            0.65 + Math.sin(p.fase * 3) * 0.35
        );

        ctx.globalAlpha = p.opacidad * brillo;
        ctx.fillStyle = `rgb(${p.color})`;

        if (p.corazon) {
            dibujarCorazon(p.x, p.y, p.radio * 5, p.giro);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radio, 0, Math.PI * 2);
            ctx.fill();

            if (p.radio > 1.8) {
                ctx.globalAlpha = p.opacidad * 0.12;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radio * 4, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    ctx.globalAlpha = 1;

    animacionFrame = requestAnimationFrame(dibujarParticulas);
}

window.addEventListener("resize", ajustarCanvas);

ajustarCanvas();
dibujarParticulas();
