"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronLeft, Minus, Plus } from "lucide-react";
import { Ciclita, CICLITAS, CICLITAS_ELEGIBLES } from "@/components/Ciclita";
import { Circulo, Estrella, FlorLuna, FlorOndulada, Luna } from "@/components/FormasMarca";
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
        <FlorLuna color="#ff5a66" fondo="var(--rojo)" tamano={260} className={estilos.florA} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/logo-blanco.svg" alt="Mi Ciclo" className={estilos.logo} width={150} height={40} />
        <div className={estilos.foto}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/hero-foto.webp" alt="Mujer sonriendo con un vaso de Mi Ciclo junto a la caja" />
          <span className={estilos.ciclitasFoto} aria-hidden="true">
            {CICLITAS_ELEGIBLES.slice(0, 3).map((c, i) => (
              <span key={c} className={estilos.flotante} style={{ animationDelay: `${i * 0.25}s` }}>
                <Ciclita id={c} tamano={44} />
              </span>
            ))}
          </span>
        </div>
        <div className={estilos.portadaTexto}>
          <h1 className={estilos.lema}>
            Tu cuerpo no falla. <em>Se expresa.</em>
          </h1>
          <p className={estilos.bajada}>
            Registra cómo te sientes, toma tu ritual diario y acompáñate de una comunidad de mujeres que te entiende.
          </p>
        </div>
        <div className="columna">
          <button className={estilos.empezar} onClick={() => ir("edad")}>
            Empezar <ArrowRight size={16} />
          </button>
          <p className={estilos.legal}>Solo para mayores de 18 años · Colombia</p>
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
        <div className={estilos.progresoBloque}>
          <span className={estilos.pasoNumero}>
            Paso {indice} de {PASOS.length - 1}
          </span>
          <div className={estilos.progreso} aria-hidden="true">
            {PASOS.slice(1).map((p, i) => (
              <span key={p} className={clases(estilos.punto, i < indice && estilos.puntoHecho)} />
            ))}
          </div>
        </div>
        <span style={{ width: 44 }} />
      </div>

      {paso === "edad" && (
        <section className={estilos.bloque}>
          <span className={estilos.glifo} style={{ background: "#ffdced" }} aria-hidden="true">
            <Circulo color="#f62c39" tamano={26} />
          </span>
          <h1 className={estilos.tituloPaso}>¿Cuándo <em>naciste</em>?</h1>
          <p className={estilos.bajadaPaso}>Mi Ciclo es solo para mayores de 18 años. No mostramos este dato a nadie.</p>
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
          <span className={estilos.glifo} style={{ background: "#efe4fb" }} aria-hidden="true">
            <Luna color="#5b3aaa" tamano={26} />
          </span>
          <h1 className={estilos.tituloPaso}>¿Cómo te <em>llamamos</em>?</h1>
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
          <span className={estilos.glifo} style={{ background: "#ffdced" }} aria-hidden="true">
            <FlorLuna color="#f62c39" fondo="#ffdced" tamano={26} />
          </span>
          <h1 className={estilos.tituloPaso}>Elige tu <em>Ciclita</em></h1>
          <p className={estilos.bajadaPaso}>Es tu avatar en la comunidad. Protege tu privacidad y te da un personaje propio.</p>
          <div className={estilos.elegida}>
            <Ciclita id={ciclita} tamano={112} feliz />
            <p className={estilos.nombreCiclita}>{CICLITAS[ciclita].nombre}</p>
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
                <Ciclita id={c} tamano={52} />
                <span>{CICLITAS[c].nombre}</span>
                {ciclita === c && (
                  <span className={estilos.marcaElegida} aria-hidden="true">
                    <Check size={12} strokeWidth={3.5} />
                  </span>
                )}
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
          <span className={estilos.glifo} style={{ background: "#ffe4ea" }} aria-hidden="true">
            <FlorOndulada color="#e3202f" fondo="#ffe4ea" tamano={26} />
          </span>
          <h1 className={estilos.tituloPaso}>¿Cuándo empezó tu <em>última regla</em>?</h1>
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
          <span className={estilos.glifo} style={{ background: "#efe4fb" }} aria-hidden="true">
            <Estrella color="#5b3aaa" tamano={26} />
          </span>
          <h1 className={estilos.tituloPaso}>¿Por qué estás con <em>Mi Ciclo</em>?</h1>
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
        <span className={estilos.valorContador} aria-live="polite">
          <b className="num">{valor}</b> días
        </span>
        <button className="boton-icono boton-icono-blanco" aria-label="Más" disabled={valor >= max} onClick={() => alCambiar(valor + 1)}>
          <Plus size={18} />
        </button>
      </div>
      {ayuda && <p className="ayuda">{ayuda}</p>}
    </div>
  );
}
