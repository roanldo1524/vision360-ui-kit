"use client";
import { useState } from "react";
import Link from "next/link";
import { Copy, Eye, Heart, Lock, Send, Share2, Sparkles, UserPlus, X } from "lucide-react";
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
import { Cabecera } from "@/components/Cabecera";
import { Ciclita } from "@/components/Ciclita";
import { Hoja, Confirmar } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { clases } from "@/lib/utilidades";
import estilos from "./vinculo.module.css";

const ETIQUETA_ESTADO: Record<Vinculo["estado"], { texto: string; chip: string }> = {
  pendiente: { texto: "Invitación enviada", chip: "chip-mantequilla" },
  por_confirmar: { texto: "Por confirmar", chip: "chip-durazno" },
  activo: { texto: "Activo", chip: "chip-menta" },
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
      <Cabecera titulo="Modo vínculo" />
      <main className="pagina pagina-sin-barra">
        <section className={estilos.intro}>
          <div className={estilos.introTexto}>
            <p className="eyebrow eyebrow-rojo">Sincroniza tu ritmo</p>
            <h1 className="titulo-l">Que quien te quiere te entienda un poquito más</h1>
            <p className="pequeno texto-2">
              Tu pareja, mamá, papá o amiga recibe un consejo diario según tu fase. Tú decides qué se comparte.
            </p>
          </div>
          <button className="boton boton-principal" onClick={invitar}>
            <UserPlus size={18} /> Invitar a alguien
          </button>
        </section>

        {vinculos.length > 0 && (
          <section className="seccion" aria-labelledby="t-vinculos">
            <h2 id="t-vinculos" className="titulo-m">Tus vínculos</h2>
            <ul className="lista">
              {vinculos.map((v) => (
                <li key={v.id} className={clases("lista-item", estilos.vinculo)}>
                  <span className="lista-icono" aria-hidden="true"><Heart size={18} /></span>
                  <span className="lista-texto">
                    <span className="negrita pequeno">
                      {v.nombre ?? "Invitación sin abrir"}
                      {v.rol && <span className="texto-3"> · {ROLES[v.rol].nombre}</span>}
                    </span>
                    <span><span className={clases("chip", ETIQUETA_ESTADO[v.estado].chip)}>{ETIQUETA_ESTADO[v.estado].texto}</span></span>
                  </span>
                  {v.estado === "por_confirmar" ? (
                    <span className="fila" style={{ gap: 6 }}>
                      <button className="boton boton-chico boton-vino" onClick={() => { confirmarVinculo(v.id); avisar(`${v.nombre} ya está vinculado`); }}>
                        Confirmar
                      </button>
                      <button className="boton-icono" aria-label={`Rechazar a ${v.nombre}`} onClick={() => setPorQuitar(v)}>
                        <X size={18} />
                      </button>
                    </span>
                  ) : v.estado === "pendiente" ? (
                    <span className="fila" style={{ gap: 0 }}>
                      <button className="boton-icono" aria-label="Compartir enlace" onClick={() => compartir(v)}>
                        <Share2 size={18} />
                      </button>
                      <button className="boton-icono" aria-label="Cancelar invitación" onClick={() => setPorQuitar(v)}>
                        <X size={18} />
                      </button>
                    </span>
                  ) : (
                    <button className="boton boton-chico boton-secundario" onClick={() => setPorQuitar(v)}>Quitar</button>
                  )}
                </li>
              ))}
            </ul>
            {vinculos.some((v) => v.estado === "pendiente") && (
              <p className="mini texto-3">
                Cuando la persona abra el enlace, elegirá su rol y tú lo confirmarás aquí.
              </p>
            )}
          </section>
        )}

        {info && (
          <section className="seccion" aria-labelledby="t-vista">
            <div className="seccion-cabeza">
              <h2 id="t-vista" className="titulo-m">Lo que ve hoy</h2>
              <span className="mini texto-3 fila" style={{ gap: 4 }}><Eye size={14} /> Vista previa</span>
            </div>
            <div className="chips" role="group" aria-label="Ver como">
              {(Object.keys(ROLES) as RolVinculo[]).map((r) => (
                <button key={r} className="chip chip-borde seleccionable" aria-pressed={rol === r} onClick={() => setRolVista(r)}>
                  {ROLES[r].nombre}
                </button>
              ))}
            </div>
            <article className={estilos.vista}>
              <div className="fila">
                <Ciclita id={perfil?.ciclita ?? "rosa"} tamano={44} />
                <div style={{ minWidth: 0 }}>
                  <p className="negrita">{nombreElla}</p>
                  <p className="mini texto-2">
                    {privacidad.fase ? `${FASES[info.fase].nombre} · día ${info.diaCiclo}` : "Prefiere no compartir su fase"}
                  </p>
                </div>
              </div>
              {privacidad.fase && (
                <div className={estilos.consejo}>
                  <p className="eyebrow"><Sparkles size={12} style={{ display: "inline", verticalAlign: -1 }} /> Consejo para hoy</p>
                  <p className="titulo-s">{CONSEJO_VINCULO[rol][info.fase]}</p>
                </div>
              )}
              <div className={estilos.datos}>
                <Dato titulo="Racha compartida" valor={racha === 1 ? "1 día" : `${racha} días`} />
                {privacidad.animo && <Dato titulo="Hoy se siente" valor={animo?.nombre ?? "Sin registrar"} />}
                {privacidad.regla && <Dato titulo="Próximo periodo" valor={info.diasParaPeriodo <= 0 ? "Hoy" : `en ${info.diasParaPeriodo} días`} />}
                {privacidad.sintomas && (
                  <Dato titulo="Síntomas" valor={registroHoy?.sintomas.length ? registroHoy.sintomas.join(", ") : "Ninguno marcado"} />
                )}
              </div>
              <p className={clases("mini", estilos.nuncaDiario)}><Lock size={12} /> Su diario nunca se comparte.</p>
            </article>
          </section>
        )}

        <section className="seccion" aria-labelledby="t-privacidad">
          <h2 id="t-privacidad" className="titulo-m">Qué compartes</h2>
          <div className="lista">
            {PRIVACIDAD.map((p) => (
              <div key={p.clave} className="lista-item">
                <span className="lista-texto">
                  <span className="negrita pequeno" id={`priv-${p.clave}`}>{p.titulo}</span>
                  <span className="mini texto-2">{p.texto}</span>
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
            <div className="lista-item">
              <span className="lista-icono" aria-hidden="true"><Lock size={18} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno">Mi diario</span>
                <span className="mini texto-2">Está cifrado y nunca se comparte con nadie.</span>
              </span>
            </div>
          </div>
        </section>

        <section className="seccion" id="notas" aria-labelledby="t-notas">
          <div className="seccion-cabeza">
            <h2 id="t-notas" className="titulo-m">Tu espacio con tu amor</h2>
            <span className="mini texto-3">Notas que duran 24 h</span>
          </div>
          <div className={estilos.notas}>
            {vigentes.length === 0 ? (
              <p className="pequeno texto-2" style={{ textAlign: "center", padding: "18px 8px" }}>
                Escríbele algo bonito. Las notas desaparecen después de 24 horas.
              </p>
            ) : (
              vigentes.map((n) => (
                <div key={n.id} className={clases(estilos.burbuja, n.de === "yo" ? estilos.mia : estilos.suya)}>
                  <p>{n.texto}</p>
                  <span className="mini">{n.de === "yo" ? "Tú" : activos[0]?.nombre ?? "Tu vínculo"} · quedan {horasRestantes(n, ahora)} h</span>
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
              <label htmlFor="nota-vinculo" className="solo-lector">Escribe una nota</label>
              <input
                id="nota-vinculo"
                className="entrada"
                placeholder="Escribe una nota…"
                maxLength={280}
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
              <button type="submit" className="boton-icono boton-icono-blanco" aria-label="Enviar nota" disabled={!nota.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>
          <button className="enlace-vino" style={{ alignSelf: "flex-start" }} onClick={simularRespuesta}>
            Simular respuesta de tu vínculo (demo)
          </button>
        </section>
      </main>

      <Hoja abierta={invitacion !== null} alCerrar={() => setInvitacion(null)} titulo="Invitación lista">
        {invitacion && (
          <>
            <p className="texto-2 pequeno">
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
      <span className="mini texto-3">{titulo}</span>
      <span className="pequeno negrita">{valor}</span>
    </div>
  );
}

