"use client";
import { useCallback, useEffect, useState } from "react";
import { Delete, Lock, LockKeyhole, Trash2 } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { FASES, hoyColombia, infoDia } from "@/lib/ciclo";
import {
  bloquear, borrarEntrada, crearPin, desbloquear, estaDesbloqueado, guardarEntrada, leerEntradas, reiniciarDiario,
  type EntradaDiario,
} from "@/lib/diario";
import { completarMisionPorClave } from "@/lib/misiones";
import type { Fase } from "@/lib/tipos";
import { Cabecera } from "@/components/Cabecera";
import { Ciclita } from "@/components/Ciclita";
import { Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import estilos from "./diario.module.css";

const PREGUNTAS: Record<Fase, string> = {
  menstrual: "¿Qué necesita tu cuerpo hoy?",
  folicular: "¿Qué te gustaría empezar esta semana?",
  ovulacion: "¿Con quién te gustaría conectar hoy?",
  lutea: "¿Qué te está pidiendo tu cuerpo que sueltes?",
};

export function Diario() {
  const tienePin = useEstado((e) => !!e.diario.sal);
  const numEntradas = useEstado((e) => e.diario.entradas.length);
  const [abierto, setAbierto] = useState(estaDesbloqueado());

  return (
    <>
      <Cabecera
        titulo="Mi diario"
        derecha={
          abierto ? (
            <button className="boton-icono" aria-label="Bloquear diario" onClick={() => { bloquear(); setAbierto(false); }}>
              <Lock size={19} />
            </button>
          ) : undefined
        }
      />
      <main className="pagina pagina-sin-barra" style={{ paddingTop: 4 }}>
        {!tienePin ? (
          <CrearPin alCrear={() => setAbierto(true)} />
        ) : !abierto ? (
          <Desbloquear alAbrir={() => setAbierto(true)} />
        ) : (
          <Escritorio key={numEntradas} />
        )}
      </main>
    </>
  );
}

function Teclado({ valor, alCambiar, largo = 4 }: { valor: string; alCambiar: (v: string) => void; largo?: number }) {
  return (
    <div className={estilos.pin}>
      <div className={estilos.puntos} aria-label={`${valor.length} de ${largo} dígitos`}>
        {Array.from({ length: largo }).map((_, i) => (
          <span key={i} className={i < valor.length ? estilos.lleno : ""} />
        ))}
      </div>
      <div className={estilos.teclas}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"].map((t, i) =>
          t === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              className={estilos.tecla}
              aria-label={t === "borrar" ? "Borrar" : t}
              onClick={() => alCambiar(t === "borrar" ? valor.slice(0, -1) : (valor + t).slice(0, largo))}
            >
              {t === "borrar" ? <Delete size={20} /> : t}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

function CrearPin({ alCrear }: { alCrear: () => void }) {
  const [pin, setPin] = useState("");
  const [primero, setPrimero] = useState<string | null>(null);
  const [error, setError] = useState("");

  function alEscribir(v: string) {
    setError("");
    if (v.length < 4) return setPin(v);
    if (primero === null) {
      setPrimero(v);
      setPin("");
      return;
    }
    if (v !== primero) {
      setError("Los PIN no coinciden. Inténtalo otra vez.");
      setPrimero(null);
      setPin("");
      return;
    }
    setPin(v);
    crearPin(v).then(() => {
      avisar("Tu diario está protegido");
      alCrear();
    });
  }

  return (
    <section className={estilos.centro}>
      <span className={estilos.candado}><LockKeyhole size={26} /></span>
      <h1 className="titulo-l">{primero === null ? "Crea un PIN para tu diario" : "Confirma tu PIN"}</h1>
      <p className="texto-2 pequeno" style={{ maxWidth: 300 }}>
        Lo que escribes se cifra en tu celular con este PIN. Nadie más puede leerlo, ni tu vínculo ni Mi Ciclo.
      </p>
      {error && <p className="error-campo" role="alert">{error}</p>}
      <Teclado valor={pin} alCambiar={alEscribir} />
    </section>
  );
}

function Desbloquear({ alAbrir }: { alAbrir: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [olvido, setOlvido] = useState(false);

  function alEscribir(v: string) {
    setError("");
    setPin(v);
    if (v.length < 4) return;
    desbloquear(v).then((ok) => {
      if (ok) alAbrir();
      else {
        setError("PIN incorrecto. Inténtalo de nuevo.");
        setPin("");
      }
    });
  }

  return (
    <section className={estilos.centro}>
      <span className={estilos.candado}><Lock size={26} /></span>
      <h1 className="titulo-l">Tu diario está cerrado</h1>
      <p className="texto-2 pequeno">Escribe tu PIN para abrirlo.</p>
      {error && <p className="error-campo" role="alert">{error}</p>}
      <Teclado valor={pin} alCambiar={alEscribir} />
      <button className="boton boton-fantasma boton-chico" onClick={() => setOlvido(true)}>
        Olvidé mi PIN
      </button>
      <Confirmar
        abierta={olvido}
        alCerrar={() => setOlvido(false)}
        titulo="¿Olvidaste tu PIN?"
        texto="Por seguridad no podemos recuperarlo. Puedes empezar un diario nuevo, pero se borrarán todas tus entradas."
        accion="Borrar y empezar de nuevo"
        peligro
        alConfirmar={() => {
          reiniciarDiario();
          avisar("Diario reiniciado");
        }}
      />
    </section>
  );
}

function Escritorio() {
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const perfil = useEstado((e) => e.perfil);
  const [texto, setTexto] = useState("");
  const [entradas, setEntradas] = useState<EntradaDiario[] | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [borrar, setBorrar] = useState<string | null>(null);
  const fase = ciclo ? infoDia(hoyColombia(), ciclo, periodos).fase : "folicular";

  const cargar = useCallback(() => {
    leerEntradas().then(setEntradas);
  }, []);
  useEffect(cargar, [cargar]);

  async function guardar() {
    if (!texto.trim()) return;
    setGuardando(true);
    try {
      await guardarEntrada(texto.trim(), fase);
      setTexto("");
      completarMisionPorClave("escribir_diario");
    } catch {
      avisar("No pudimos guardar. Vuelve a abrir el diario.", "error");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <section className={`tarjeta ${estilos.hoja}`}>
        <div className="fila-entre">
          <span className="eyebrow eyebrow-rojo">Hoy · {FASES[fase].corta}</span>
          <span className="mini texto-3 fila" style={{ gap: 4 }}><Lock size={12} /> Cifrado en tu celular</span>
        </div>
        <label htmlFor="diario-texto" className="titulo-m">{PREGUNTAS[fase]}</label>
        <textarea
          id="diario-texto"
          className={estilos.area}
          placeholder={`Escribe con calma, ${perfil?.nombre ?? ""}…`}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={6}
        />
        <button className="boton boton-principal" style={{ alignSelf: "flex-end" }} disabled={!texto.trim() || guardando} onClick={guardar}>
          {guardando ? "Guardando…" : "Guardar"}
        </button>
      </section>

      <section className="seccion">
        <h2 className="titulo-m">Lo que has escrito</h2>
        {entradas === null ? (
          <div className="esqueleto" style={{ height: 90 }} />
        ) : entradas.length === 0 ? (
          <div className="tarjeta fila" style={{ gap: 14 }}>
            <Ciclita id="lila" tamano={52} />
            <p className="pequeno texto-2">Tu primera entrada aparecerá aquí. Escribir unas líneas cada noche ayuda a ordenar la cabeza.</p>
          </div>
        ) : (
          entradas.map((en) => (
            <article key={en.id} className={`tarjeta ${estilos.entrada}`}>
              <div className="fila-entre">
                <span className="mini texto-2">
                  {new Date(en.fecha).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
                  {en.fase && FASES[en.fase as Fase] ? ` · ${FASES[en.fase as Fase].corta}` : ""}
                </span>
                <button className="boton-icono" style={{ width: 36, height: 36, minHeight: 36 }} aria-label="Borrar entrada" onClick={() => setBorrar(en.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <p style={{ whiteSpace: "pre-wrap" }}>{en.texto}</p>
            </article>
          ))
        )}
      </section>
      <Confirmar
        abierta={borrar !== null}
        alCerrar={() => setBorrar(null)}
        titulo="¿Borrar esta entrada?"
        texto="No se puede recuperar."
        accion="Borrar"
        peligro
        alConfirmar={() => {
          if (borrar) borrarEntrada(borrar);
          avisar("Entrada borrada");
        }}
      />
    </>
  );
}
