"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus } from "lucide-react";
import { Ciclita, CICLITAS, CICLITAS_ELEGIBLES } from "@/components/Ciclita";
import { completarBienvenida } from "@/lib/acciones";
import { hoyColombia, sumarDias } from "@/lib/ciclo";
import { MOTIVOS } from "@/lib/consejos";
import type { CiclitaId } from "@/lib/tipos";
import { clases } from "@/lib/utilidades";
import estilos from "./bienvenida.module.css";

const PASOS = ["inicio", "edad", "nombre", "ciclita", "ciclo", "final"] as const;
type Paso = (typeof PASOS)[number];

function edadDesde(nacimiento: string, hoy: string): number {
  const [a, m, d] = nacimiento.split("-").map(Number);
  const [ah, mh, dh] = hoy.split("-").map(Number);
  let edad = ah - a;
  if (mh < m || (mh === m && dh < d)) edad -= 1;
  return edad;
}

export function Bienvenida() {
  const router = useRouter();
  const hoy = hoyColombia();
  const [paso, setPaso] = useState<Paso>("inicio");
  const [nacimiento, setNacimiento] = useState("");
  const [menor, setMenor] = useState(false);
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [ciclita, setCiclita] = useState<CiclitaId>("rosa");
  const [ultimo, setUltimo] = useState(sumarDias(hoy, -3));
  const [duracionCiclo, setDuracionCiclo] = useState(28);
  const [duracionRegla, setDuracionRegla] = useState(5);
  const [motivo, setMotivo] = useState<string | undefined>();
  const [acepta, setAcepta] = useState(false);

  const indice = PASOS.indexOf(paso);
  const ir = (p: Paso) => setPaso(p);
  const usuarioLimpio = usuario.toLowerCase().replace(/[^a-z0-9._]/g, "").slice(0, 24);

  function revisarEdad() {
    if (!nacimiento) return;
    if (edadDesde(nacimiento, hoy) < 18) {
      setMenor(true);
      return;
    }
    setMenor(false);
    ir("nombre");
  }

  function crear() {
    completarBienvenida(
      {
        nombre: nombre.trim(),
        usuario: usuarioLimpio || nombre.trim().toLowerCase().replace(/\s+/g, "."),
        bio: "",
        ciclita,
        creadaEn: Date.now(),
        motivo,
      },
      { ultimoPeriodo: ultimo, duracionCiclo, duracionRegla },
    );
    router.replace("/");
  }

  if (paso === "inicio") {
    return (
      <main className={estilos.portada}>
        <div className={estilos.ciclitas} aria-hidden="true">
          {CICLITAS_ELEGIBLES.map((c, i) => (
            <span key={c} className={estilos.flotante} style={{ animationDelay: `${i * 0.18}s` }}>
              <Ciclita id={c} tamano={i % 2 ? 58 : 70} />
            </span>
          ))}
        </div>
        <div className={estilos.portadaTexto}>
          <p className="marca" style={{ fontSize: 34 }}>Mi Ciclo</p>
          <h1 className="titulo-xl">Tu cuerpo no falla. Se expresa.</h1>
          <p className="texto-2">
            Registra cómo te sientes, toma tu ritual diario y acompáñate de una comunidad de mujeres que te entiende.
          </p>
        </div>
        <div className="columna">
          <button className="boton boton-principal boton-ancho" onClick={() => ir("edad")}>
            Empezar
          </button>
          <p className="mini texto-3" style={{ textAlign: "center" }}>
            Solo para mayores de 18 años · Colombia
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className={clases("pagina pagina-sin-barra", estilos.paso)}>
      <div className="fila-entre">
        <button
          className="boton-icono"
          aria-label="Atrás"
          onClick={() => ir(PASOS[Math.max(0, indice - 1)])}
        >
          <ChevronLeft size={24} />
        </button>
        <div className={estilos.progreso} aria-label={`Paso ${indice} de ${PASOS.length - 1}`}>
          {PASOS.slice(1).map((p, i) => (
            <span key={p} className={clases(estilos.punto, i < indice && estilos.puntoHecho)} />
          ))}
        </div>
        <span style={{ width: 44 }} />
      </div>

      {paso === "edad" && (
        <section className={estilos.bloque}>
          <p className="eyebrow eyebrow-rojo">Antes de empezar</p>
          <h1 className="titulo-l">¿Cuándo naciste?</h1>
          <p className="texto-2">Mi Ciclo es solo para mayores de 18 años. No mostramos este dato a nadie.</p>
          <div className="campo">
            <label htmlFor="nacimiento">Fecha de nacimiento</label>
            <input
              id="nacimiento"
              type="date"
              className="entrada"
              max={hoy}
              value={nacimiento}
              onChange={(e) => {
                setNacimiento(e.target.value);
                setMenor(false);
              }}
            />
          </div>
          {menor && (
            <div className={estilos.alerta} role="alert">
              <Ciclita id="lila" tamano={44} />
              <p className="pequeno">
                Por ahora Mi Ciclo es solo para mayores de 18 años. Gracias por querer cuidarte: habla con una adulta de
                confianza o con tu médica si tienes dudas sobre tu ciclo.
              </p>
            </div>
          )}
          <button className="boton boton-principal boton-ancho" disabled={!nacimiento} onClick={revisarEdad}>
            Continuar
          </button>
        </section>
      )}

      {paso === "nombre" && (
        <section className={estilos.bloque}>
          <p className="eyebrow eyebrow-rojo">Tu perfil</p>
          <h1 className="titulo-l">¿Cómo te llamamos?</h1>
          <div className="campo">
            <label htmlFor="nombre">Tu nombre</label>
            <input
              id="nombre"
              className="entrada"
              autoComplete="given-name"
              placeholder="Rosaura"
              maxLength={30}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="usuario">Usuario en la comunidad</label>
            <div className={estilos.arroba}>
              <span aria-hidden="true">@</span>
              <input
                id="usuario"
                className="entrada"
                placeholder="rosaura"
                value={usuarioLimpio}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </div>
            <p className="ayuda">Letras, números, punto y guion bajo. Puedes publicar como anónima cuando quieras.</p>
          </div>
          <button
            className="boton boton-principal boton-ancho"
            disabled={nombre.trim().length < 2 || usuarioLimpio.length < 3}
            onClick={() => ir("ciclita")}
          >
            Continuar
          </button>
        </section>
      )}

      {paso === "ciclita" && (
        <section className={estilos.bloque}>
          <p className="eyebrow eyebrow-rojo">Tu Ciclita</p>
          <h1 className="titulo-l">Elige tu Ciclita</h1>
          <p className="texto-2">Es tu avatar en la comunidad. Protege tu privacidad y te da un personaje propio.</p>
          <div className={estilos.elegida}>
            <Ciclita id={ciclita} tamano={120} feliz />
            <p className="titulo-s">{CICLITAS[ciclita].nombre}</p>
          </div>
          <div className={estilos.rejillaCiclitas} role="radiogroup" aria-label="Ciclitas">
            {CICLITAS_ELEGIBLES.map((c) => (
              <button
                key={c}
                role="radio"
                aria-checked={ciclita === c}
                className={estilos.opcionCiclita}
                onClick={() => setCiclita(c)}
              >
                <Ciclita id={c} tamano={56} />
                <span className="mini">{CICLITAS[c].nombre}</span>
              </button>
            ))}
          </div>
          <button className="boton boton-principal boton-ancho" onClick={() => ir("ciclo")}>
            Continuar
          </button>
        </section>
      )}

      {paso === "ciclo" && (
        <section className={estilos.bloque}>
          <p className="eyebrow eyebrow-rojo">Tu ciclo</p>
          <h1 className="titulo-l">¿Cuándo empezó tu última regla?</h1>
          <div className="campo">
            <label htmlFor="ultimo">Primer día de tu última regla</label>
            <input
              id="ultimo"
              type="date"
              className="entrada"
              max={hoy}
              min={sumarDias(hoy, -90)}
              value={ultimo}
              onChange={(e) => setUltimo(e.target.value)}
            />
          </div>
          <Contador
            etiqueta="¿Cuántos días dura tu ciclo?"
            ayuda="Desde el primer día de una regla hasta el día antes de la siguiente."
            valor={duracionCiclo}
            min={21}
            max={40}
            alCambiar={setDuracionCiclo}
          />
          <Contador
            etiqueta="¿Cuántos días dura tu regla?"
            valor={duracionRegla}
            min={2}
            max={8}
            alCambiar={setDuracionRegla}
          />
          <p className="ayuda">¿No estás segura? Deja 28 y 5. Mi Ciclo aprende de tus registros.</p>
          <button className="boton boton-principal boton-ancho" disabled={!ultimo} onClick={() => ir("final")}>
            Continuar
          </button>
        </section>
      )}

      {paso === "final" && (
        <section className={estilos.bloque}>
          <p className="eyebrow eyebrow-rojo">Último paso</p>
          <h1 className="titulo-l">¿Por qué estás con Mi Ciclo?</h1>
          <div className="chips">
            {MOTIVOS.map((m) => (
              <button
                key={m}
                className="chip chip-borde seleccionable"
                aria-pressed={motivo === m}
                onClick={() => setMotivo(motivo === m ? undefined : m)}
              >
                {m}
              </button>
            ))}
          </div>
          <label className={estilos.acepto}>
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
            <span className="pequeno">
              Tengo 18 años o más y acepto los{" "}
              <Link href="/legal/terminos" className="negrita" style={{ textDecoration: "underline" }}>
                Términos
              </Link>{" "}
              y la{" "}
              <Link href="/legal/privacidad" className="negrita" style={{ textDecoration: "underline" }}>
                Política de Privacidad
              </Link>
              , incluido el tratamiento de mis datos de salud para acompañar mi ciclo.
            </span>
          </label>
          <button className="boton boton-principal boton-ancho" disabled={!acepta} onClick={crear}>
            Crear mi espacio
          </button>
        </section>
      )}
    </main>
  );
}

function Contador({
  etiqueta,
  ayuda,
  valor,
  min,
  max,
  alCambiar,
}: {
  etiqueta: string;
  ayuda?: string;
  valor: number;
  min: number;
  max: number;
  alCambiar: (n: number) => void;
}) {
  return (
    <div className="campo">
      <span className="etiqueta">{etiqueta}</span>
      <div className={estilos.contador}>
        <button className="boton-icono boton-icono-blanco" aria-label="Menos" disabled={valor <= min} onClick={() => alCambiar(valor - 1)}>
          <Minus size={18} />
        </button>
        <span className="titulo-l num" aria-live="polite">
          {valor} <span className="pequeno texto-2">días</span>
        </span>
        <button className="boton-icono boton-icono-blanco" aria-label="Más" disabled={valor >= max} onClick={() => alCambiar(valor + 1)}>
          <Plus size={18} />
        </button>
      </div>
      {ayuda && <p className="ayuda">{ayuda}</p>}
    </div>
  );
}
