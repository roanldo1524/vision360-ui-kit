"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Eye, Lock, Send, Share2, UserPlus, X } from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { FASES, hoyColombia, infoDia, rachaSobre } from "@/lib/ciclo";
import { ANIMOS, CONSEJO_VINCULO, ROLES } from "@/lib/consejos";
import {
  cambiarPrivacidad, confirmarVinculo, crearInvitacion, eliminarVinculo, enlaceInvitacion,
  escribirNota, horasRestantes, notasVigentes, simularRespuesta,
} from "@/lib/vinculo/acciones";
import { useAhora } from "@/lib/vinculo/useAhora";
import { copiarTexto } from "@/lib/jardin/acciones";
import type { Ajustes, RolVinculo, Vinculo } from "@/lib/tipos";
import { FlorLuna, FlorOndulada, Luna } from "@/components/FormasMarca";
import { Ciclita } from "@/components/Ciclita";
import { Hoja, Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { clases } from "@/lib/utilidades";
import estilos from "./vinculo.module.css";

const ETIQUETA_ESTADO: Record<Vinculo["estado"], { texto: string; clase: "pendiente" | "porConfirmar" | "activo" }> = {
  pendiente: { texto: "Invitación enviada", clase: "pendiente" },
  por_confirmar: { texto: "Por confirmar", clase: "porConfirmar" },
  activo: { texto: "Activo", clase: "activo" },
};

const PRIVACIDAD: { clave: keyof Ajustes["privacidadVinculo"]; titulo: string; texto: string }[] = [
  { clave: "fase", titulo: "Mi fase del ciclo", texto: "Ve en qué fase estás y recibe su consejo del día." },
  { clave: "animo", titulo: "Cómo me siento", texto: "Ve el ánimo que registres hoy." },
  { clave: "sintomas", titulo: "Mis síntomas", texto: "Ve los síntomas que marques." },
  { clave: "regla", titulo: "Mi próximo periodo", texto: "Ve cuándo llegaría tu próxima regla." },
];

export default function PaginaVinculo() {
  const perfil = useEstado((e) => e.perfil);
  const ciclo = useEstado((e) => e.ciclo);
  const periodos = useEstado((e) => e.periodos);
  const registros = useEstado((e) => e.registros);
  const vinculos = useEstado((e) => e.vinculos);
  const privacidad = useEstado((e) => e.ajustes.privacidadVinculo);
  const notas = useEstado((e) => e.notasPareja);
  const ahora = useAhora();

  const [invitacion, setInvitacion] = useState<Vinculo | null>(null);
  const [porQuitar, setPorQuitar] = useState<Vinculo | null>(null);
  const [rolVista, setRolVista] = useState<RolVinculo | null>(null);
  const [nota, setNota] = useState("");

  const hoy = hoyColombia();
  const info = ciclo ? infoDia(hoy, ciclo, periodos) : null;
  const activos = vinculos.filter((v) => v.estado === "activo");
  const rol: RolVinculo = rolVista ?? activos[0]?.rol ?? "pareja";
  const nombreElla = perfil?.nombre ?? "ella";
  const registroHoy = registros[hoy];
  const animo = ANIMOS.find((a) => a.id === registroHoy?.animo);
  const racha = rachaSobre(hoy, registros);
  const vigentes = notasVigentes(notas, ahora);

  const invitar = () => setInvitacion(crearInvitacion());

  const compartir = async (v: Vinculo) => {
    const url = enlaceInvitacion(v.codigo);
    const texto = `${nombreElla} te invita a acompañarla en Mi Ciclo`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Mi Ciclo", text: texto, url });
        return;
      }
    } catch {
      /* se canceló o no está permitido: se copia */
    }
    const ok = await copiarTexto(url);
    avisar(ok ? "Enlace copiado" : `Copia el enlace: ${url}`);
  };

  const enviarNota = () => {
    if (!nota.trim()) return;
    escribirNota(nota);
    setNota("");
    avisar("Nota enviada · dura 24 horas");
  };

  return (
    <>
      <main className={clases("pagina pagina-sin-barra", estilos.pagina)}>
        {/* Portada en Violeta oscuro (variación de color del brandbook) */}
        <section className={estilos.portada} aria-labelledby="t-vinculo">
          <FlorOndulada color="#6c4bbb" fondo="#5b3aaa" tamano={260} className={estilos.florGigante} />
          <Link href="/" className={estilos.volver} aria-label="Volver a Inicio">
            <ChevronLeft size={24} />
          </Link>
          <h1 id="t-vinculo" className={estilos.titulo}>
            Sincroniza <em>tu ritmo</em>
          </h1>
          <p className={estilos.frase}>Que quien te quiere te entienda un poquito más.</p>
          <p className={estilos.bajada}>
            Tu pareja, mamá, papá o amiga recibe un consejo diario según tu fase. Tú decides qué se comparte.
          </p>
          <button className={clases("boton boton-principal", estilos.botonPortada)} onClick={invitar}>
            <UserPlus size={18} /> Invitar a alguien
          </button>
        </section>

        {vinculos.length > 0 && (
          <section className={estilos.seccion} aria-labelledby="t-vinculos">
            <h2 id="t-vinculos" className={estilos.tituloSeccion}>
              Tus <em>vínculos</em>
            </h2>
            <ul className={estilos.lista}>
              {vinculos.map((v) => (
                <li key={v.id} className={estilos.fila}>
                  <span className={estilos.glifo} aria-hidden="true">
                    <Ciclita id={v.estado === "activo" ? "lila" : "mantequilla"} tamano={44} />
                  </span>
                  <span className={estilos.filaTexto}>
                    <span className={estilos.filaTitulo}>
                      {v.nombre ?? "Invitación sin abrir"}
                      {v.rol && <span className={estilos.rol}> · {ROLES[v.rol].nombre}</span>}
                    </span>
                    <span className={clases(estilos.estado, estilos[ETIQUETA_ESTADO[v.estado].clase])}>
                      {ETIQUETA_ESTADO[v.estado].texto}
                    </span>
                  </span>
                  {v.estado === "por_confirmar" ? (
                    <span className={estilos.accionesFila}>
                      <button
                        className="boton boton-chico boton-vino"
                        onClick={() => {
                          confirmarVinculo(v.id);
                          avisar(`${v.nombre} ya está vinculado`);
                        }}
                      >
                        Confirmar
                      </button>
                      <button className="boton-icono" aria-label={`Rechazar a ${v.nombre}`} onClick={() => setPorQuitar(v)}>
                        <X size={18} />
                      </button>
                    </span>
                  ) : v.estado === "pendiente" ? (
                    <span className={estilos.accionesFila}>
                      <button className="boton-icono" aria-label="Compartir enlace" onClick={() => compartir(v)}>
                        <Share2 size={18} />
                      </button>
                      <button className="boton-icono" aria-label="Cancelar invitación" onClick={() => setPorQuitar(v)}>
                        <X size={18} />
                      </button>
                    </span>
                  ) : (
                    <button className="boton boton-chico boton-secundario" onClick={() => setPorQuitar(v)}>
                      Quitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {vinculos.some((v) => v.estado === "pendiente") && (
              <p className={estilos.nota}>Cuando la persona abra el enlace, elegirá su rol y tú lo confirmarás aquí.</p>
            )}
          </section>
        )}

        {info && (
          <section className={estilos.seccion} aria-labelledby="t-vista">
            <div className={estilos.cabezaSeccion}>
              <h2 id="t-vista" className={estilos.tituloSeccion}>
                Lo que ve <em>hoy</em>
              </h2>
              <span className={estilos.vistaPrevia}>
                <Eye size={16} aria-hidden="true" /> Vista previa
              </span>
            </div>
            <div className={estilos.roles} role="group" aria-label="Ver como">
              {(Object.keys(ROLES) as RolVinculo[]).map((r) => (
                <button key={r} className={estilos.rolBoton} aria-pressed={rol === r} onClick={() => setRolVista(r)}>
                  {ROLES[r].nombre}
                </button>
              ))}
            </div>
            <article className={estilos.vista}>
              <div className={estilos.vistaCabeza}>
                <Ciclita id={perfil?.ciclita ?? "rosa"} tamano={44} />
                <div style={{ minWidth: 0 }}>
                  <p className={estilos.vistaNombre}>{nombreElla}</p>
                  <p className={estilos.vistaFase}>
                    {privacidad.fase ? `${FASES[info.fase].nombre} · día ${info.diaCiclo}` : "Prefiere no compartir su fase"}
                  </p>
                </div>
              </div>
              {privacidad.fase && (
                <div className={estilos.consejo}>
                  <p className={estilos.consejoEtiqueta}>
                    <Luna color="#5b3aaa" tamano={14} /> Consejo para hoy
                  </p>
                  <p className={estilos.consejoTexto}>{CONSEJO_VINCULO[rol][info.fase]}</p>
                </div>
              )}
              <div className={estilos.datos}>
                <Dato titulo="Racha compartida" valor={racha === 1 ? "1 día" : `${racha} días`} />
                {privacidad.animo && <Dato titulo="Hoy se siente" valor={animo?.nombre ?? "Sin registrar"} />}
                {privacidad.regla && <Dato titulo="Próximo período" valor={info.diasParaPeriodo <= 0 ? "Hoy" : `en ${info.diasParaPeriodo} días`} />}
                {privacidad.sintomas && (
                  <Dato titulo="Síntomas" valor={registroHoy?.sintomas.length ? registroHoy.sintomas.join(", ") : "Ninguno marcado"} />
                )}
              </div>
              <p className={estilos.nuncaDiario}>
                <Lock size={14} aria-hidden="true" /> Su diario nunca se comparte.
              </p>
            </article>
          </section>
        )}

        <section className={estilos.seccion} aria-labelledby="t-privacidad">
          <h2 id="t-privacidad" className={estilos.tituloSeccion}>
            Qué <em>compartes</em>
          </h2>
          <div className={estilos.lista}>
            {PRIVACIDAD.map((p) => (
              <div key={p.clave} className={estilos.fila}>
                <span className={estilos.filaTexto}>
                  <span className={estilos.filaTitulo} id={`priv-${p.clave}`}>
                    {p.titulo}
                  </span>
                  <span className={estilos.filaSub}>{p.texto}</span>
                </span>
                <button
                  role="switch"
                  className="interruptor"
                  aria-checked={privacidad[p.clave]}
                  aria-labelledby={`priv-${p.clave}`}
                  onClick={() => cambiarPrivacidad(p.clave, !privacidad[p.clave])}
                />
              </div>
            ))}
            <div className={estilos.fila}>
              <span className={estilos.filaTexto}>
                <span className={estilos.filaTitulo}>Mi diario</span>
                <span className={estilos.filaSub}>Está cifrado y nunca se comparte con nadie.</span>
              </span>
              <span className={estilos.candado} aria-hidden="true">
                <Lock size={18} />
              </span>
            </div>
          </div>
        </section>

        <section className={estilos.seccion} id="notas" aria-labelledby="t-notas">
          <div className={estilos.cabezaSeccion}>
            <h2 id="t-notas" className={estilos.tituloSeccion}>
              Tu espacio <em>con tu amor</em>
            </h2>
          </div>
          <p className={estilos.nota}>Notas que se borran solas en 24 horas.</p>
          <div className={estilos.notas}>
            {vigentes.length === 0 ? (
              <div className={estilos.notasVacio}>
                <FlorLuna color="#f62c39" fondo="#fff" tamano={36} />
                <p>Escríbele algo bonito. Lo verá hoy y mañana ya no estará.</p>
              </div>
            ) : (
              vigentes.map((n) => (
                <div key={n.id} className={clases(estilos.burbuja, n.de === "yo" ? estilos.mia : estilos.suya)}>
                  <p>{n.texto}</p>
                  <span>
                    {n.de === "yo" ? "Tú" : activos[0]?.nombre ?? "Tu vínculo"} · quedan {horasRestantes(n, ahora)} h
                  </span>
                </div>
              ))
            )}
            <form
              className={estilos.escribir}
              onSubmit={(ev) => {
                ev.preventDefault();
                enviarNota();
              }}
            >
              <label htmlFor="nota-vinculo" className="solo-lector">
                Escribe una nota
              </label>
              <input
                id="nota-vinculo"
                className={estilos.entradaNota}
                placeholder="Escribe una nota…"
                maxLength={280}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
              <button type="submit" className={estilos.enviar} aria-label="Enviar nota" disabled={!nota.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>
          <button className={estilos.demo} onClick={simularRespuesta}>
            Simular respuesta de tu vínculo (demo)
          </button>
        </section>
      </main>

      <Hoja abierta={invitacion !== null} alCerrar={() => setInvitacion(null)} titulo="Invitación lista">
        {invitacion && (
          <>
            <p className={estilos.textoHoja}>
              Comparte este enlace. Quien lo abra elegirá si es tu pareja, mamá, papá o amiga, y tú lo confirmarás.
            </p>
            <div className={estilos.enlace}>
              <span>{enlaceInvitacion(invitacion.codigo)}</span>
              <button
                className="boton-icono"
                aria-label="Copiar enlace"
                onClick={async () => {
                  const ok = await copiarTexto(enlaceInvitacion(invitacion.codigo));
                  avisar(ok ? "Enlace copiado" : "Selecciona y copia el enlace");
                }}
              >
                <Copy size={18} />
              </button>
            </div>
            <button className="boton boton-principal boton-ancho" onClick={() => compartir(invitacion)}>
              <Share2 size={18} /> Compartir enlace
            </button>
            <Link href={`/vinculo/unirse/${invitacion.codigo}`} className="boton boton-secundario boton-ancho">
              Abrir el enlace aquí (demo)
            </Link>
          </>
        )}
      </Hoja>

      <Confirmar
        abierta={porQuitar !== null}
        titulo={porQuitar?.estado === "activo" ? "¿Quitar este vínculo?" : "¿Cancelar esta invitación?"}
        texto={
          porQuitar?.estado === "activo"
            ? `${porQuitar?.nombre ?? "Esta persona"} dejará de recibir tus consejos y datos compartidos.`
            : "El enlace dejará de funcionar."
        }
        accion={porQuitar?.estado === "activo" ? "Quitar vínculo" : "Cancelar invitación"}
        peligro
        alConfirmar={() => porQuitar && eliminarVinculo(porQuitar.id)}
        alCerrar={() => setPorQuitar(null)}
      />
    </>
  );
}

function Dato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className={estilos.dato}>
      <span className={estilos.datoTitulo}>{titulo}</span>
      <span className={estilos.datoValor}>{valor}</span>
    </div>
  );
}

