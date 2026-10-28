"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, BellRing, Camera, ChevronRight, FileText, Heart, LogOut, Minus, Plus, RotateCw, Shield, ShieldCheck, Trash2, UserRound,
} from "lucide-react";
import { useEstado } from "@/lib/almacen";
import { actualizarCiclo, actualizarPerfil } from "@/lib/acciones";
import { cambiarHoraRecordatorio, cambiarModoModeradora, cambiarNotificacion, cerrarSesion, eliminarCuenta } from "@/lib/ajustes/acciones";
import { comprimirFoto, guardarMedio } from "@/lib/medios";
import { notificarSistema, pedirPermisoNotificaciones, permisoNotificaciones } from "@/lib/push";
import type { Ajustes, CiclitaId } from "@/lib/tipos";
import { Avatar } from "@/components/Avatar";
import { Cabecera } from "@/components/Cabecera";
import { Ciclita, CICLITAS, CICLITAS_ELEGIBLES } from "@/components/Ciclita";
import { FlorLuna } from "@/components/FormasMarca";
import { Confirmar, Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import { clases } from "@/lib/utilidades";
import estilos from "./ajustes.module.css";

const TIPOS_NOTIF: { clave: keyof Ajustes["notificaciones"]; titulo: string; texto: string }[] = [
  { clave: "consejo", titulo: "Consejo diario", texto: "Un consejo según tu fase, cada mañana." },
  { clave: "racha", titulo: "Racha", texto: "Te recordamos tomar tu sobre para no perder la racha." },
  { clave: "fase", titulo: "Cambio de fase y periodo", texto: "Cuando empieza una fase o se acerca tu regla." },
  { clave: "comunidad", titulo: "Comunidad", texto: "Respuestas, flores y nuevas seguidoras." },
];

export default function PaginaAjustes() {
  const router = useRouter();
  const perfil = useEstado((e) => e.perfil);
  const ciclo = useEstado((e) => e.ciclo);
  const ajustes = useEstado((e) => e.ajustes);
  const moderadora = useEstado((e) => e.moderadora);

  const [editando, setEditando] = useState(false);
  const [saliendo, setSaliendo] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [permiso, setPermiso] = useState(() => permisoNotificaciones());

  if (!perfil || !ciclo) return null;

  const activarPermiso = async () => {
    const r = await pedirPermisoNotificaciones();
    setPermiso(r);
    if (r === "granted") avisar("Notificaciones activadas");
    else if (r === "denied") avisar("Las notificaciones están bloqueadas en tu navegador", "error");
  };

  const probar = async () => {
    if (permiso !== "granted") {
      avisar("Primero activa las notificaciones del celular");
      return;
    }
    await notificarSistema("Mi Ciclo", "Así se verán tus recordatorios. Tu cuerpo no falla, se expresa.", "/");
    avisar("Notificación de prueba enviada");
  };

  return (
    <>
      <Cabecera titulo="Configuraciones" />
      <main className="pagina pagina-sin-barra">
        <section className={estilos.perfil} aria-label="Tu perfil">
          <FlorLuna color="#ffdced" fondo="#fff1f6" tamano={180} className={estilos.perfilFlor} />
          <Avatar ciclita={perfil.ciclita} fotoId={perfil.fotoId} tamano={72} nombre={perfil.nombre} />
          <div className={estilos.perfilTexto}>
            <p className={estilos.perfilNombre}>{perfil.nombre}</p>
            <p className={estilos.perfilUsuario}>@{perfil.usuario}</p>
          </div>
          <button className="boton boton-chico boton-secundario" onClick={() => setEditando(true)}>
            Editar
          </button>
        </section>

        <Grupo titulo="Mi ciclo">
          <div className="lista">
            <Paso
              id="duracion-ciclo"
              icono={<RotateCw size={18} />}
              titulo="Duración del ciclo"
              valor={ciclo.duracionCiclo}
              min={21}
              max={40}
              unidad="días"
              cambiar={(v) => actualizarCiclo({ duracionCiclo: v })}
            />
            <Paso
              id="duracion-regla"
              icono={<Heart size={18} />}
              titulo="Duración de la regla"
              valor={ciclo.duracionRegla}
              min={2}
              max={8}
              unidad="días"
              cambiar={(v) => actualizarCiclo({ duracionRegla: v })}
            />
            <Link href="/ciclo" className="lista-item">
              <span className="lista-texto">
                <span className="negrita pequeno">Ver mi calendario</span>
                <span className="mini texto-2">Registra tu regla y revisa tus predicciones</span>
              </span>
              <ChevronRight size={18} className="texto-3" />
            </Link>
          </div>
        </Grupo>

        <Grupo titulo="Notificaciones">
          <div className="lista">
            <div className="lista-item">
              <span className="lista-icono" aria-hidden="true"><BellRing size={18} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno">Notificaciones del celular</span>
                <span className="mini texto-2">
                  {permiso === "granted"
                    ? "Activadas"
                    : permiso === "denied"
                      ? "Bloqueadas. Actívalas en los ajustes del navegador."
                      : permiso === "no-soportado"
                        ? "Este navegador no las permite. Instala la app."
                        : "Aún no las activas"}
                </span>
              </span>
              {permiso === "granted" ? (
                <button className="boton boton-chico boton-secundario" onClick={probar}>Probar</button>
              ) : (
                <button className="boton boton-chico boton-vino" onClick={activarPermiso} disabled={permiso === "denied" || permiso === "no-soportado"}>
                  Activar
                </button>
              )}
            </div>
            {TIPOS_NOTIF.map((t) => (
              <div key={t.clave} className="lista-item">
                <span className="lista-texto">
                  <span className="negrita pequeno" id={`notif-${t.clave}`}>{t.titulo}</span>
                  <span className="mini texto-2">{t.texto}</span>
                </span>
                <button
                  role="switch"
                  className="interruptor"
                  aria-checked={ajustes.notificaciones[t.clave]}
                  aria-labelledby={`notif-${t.clave}`}
                  onClick={() => cambiarNotificacion(t.clave, !ajustes.notificaciones[t.clave])}
                />
              </div>
            ))}
            <div className="lista-item">
              <span className="lista-icono" aria-hidden="true"><Bell size={18} /></span>
              <label htmlFor="hora-recordatorio" className="lista-texto">
                <span className="negrita pequeno">Hora del recordatorio</span>
                <span className="mini texto-2">Para tomar tu sobre</span>
              </label>
              <input
                id="hora-recordatorio"
                type="time"
                className={clases("entrada", estilos.hora)}
                value={ajustes.recordatorioHora}
                onChange={(e) => cambiarHoraRecordatorio(e.target.value)}
              />
            </div>
          </div>
        </Grupo>

        <Grupo titulo="Privacidad">
          <div className="lista">
            <Link href="/vinculo#t-privacidad" className="lista-item">
              <span className="lista-icono" aria-hidden="true"><Heart size={18} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno">Qué comparto con mi vínculo</span>
                <span className="mini texto-2">Fase, ánimo, síntomas y próximo periodo</span>
              </span>
              <ChevronRight size={18} className="texto-3" />
            </Link>
            <div className="lista-item">
              <span className="lista-icono" aria-hidden="true"><ShieldCheck size={18} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno">Tus datos de salud son tuyos</span>
                <span className="mini texto-2">
                  No los enviamos a píxeles de publicidad ni a herramientas externas (Ley 1581 de 2012). En la comunidad nunca se muestra tu fase.
                </span>
              </span>
            </div>
          </div>
        </Grupo>

        <Grupo titulo="Comunidad">
          <div className="lista">
            <div className="lista-item">
              <span className="lista-icono" aria-hidden="true"><Shield size={18} /></span>
              <span className="lista-texto">
                <span className="negrita pequeno" id="modo-moderadora">Modo moderadora</span>
                <span className="mini texto-2">Para el equipo de Mi Ciclo: revisa la cola de moderación.</span>
              </span>
              <button
                role="switch"
                className="interruptor"
                aria-checked={moderadora}
                aria-labelledby="modo-moderadora"
                onClick={() => cambiarModoModeradora(!moderadora)}
              />
            </div>
            {moderadora && (
              <Link href="/admin" className="lista-item">
                <span className="lista-texto">
                  <span className="negrita pequeno">Abrir panel de moderación</span>
                </span>
                <ChevronRight size={18} className="texto-3" />
              </Link>
            )}
          </div>
        </Grupo>

        <Grupo titulo="Legal">
          <div className="lista">
            <Link href="/legal/privacidad" className="lista-item">
              <span className="lista-icono" aria-hidden="true"><FileText size={18} /></span>
              <span className="lista-texto"><span className="negrita pequeno">Política de privacidad</span></span>
              <ChevronRight size={18} className="texto-3" />
            </Link>
            <Link href="/legal/terminos" className="lista-item">
              <span className="lista-icono" aria-hidden="true"><FileText size={18} /></span>
              <span className="lista-texto"><span className="negrita pequeno">Términos y condiciones</span></span>
              <ChevronRight size={18} className="texto-3" />
            </Link>
          </div>
        </Grupo>

        <Grupo titulo="Cuenta">
          <div className="lista">
            <button className="lista-item" onClick={() => setSaliendo(true)}>
              <span className="lista-icono" aria-hidden="true"><LogOut size={18} /></span>
              <span className="lista-texto"><span className="negrita pequeno">Cerrar sesión</span></span>
            </button>
            <button className="lista-item" onClick={() => setEliminando(true)}>
              <span className={clases("lista-icono", estilos.peligro)} aria-hidden="true"><Trash2 size={18} /></span>
              <span className="lista-texto">
                <span className={clases("negrita pequeno", estilos.peligroTexto)}>Eliminar mi cuenta</span>
                <span className="mini texto-2">Borra todos tus datos, fotos y publicaciones</span>
              </span>
            </button>
          </div>
        </Grupo>

        <footer className={estilos.pie}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/marca/logo-rojo.svg" alt="Mi Ciclo" width={76} height={20} />
          <p>EA Business Group SAS · Solo para mayores de 18 años</p>
        </footer>
      </main>

      <EditarCuenta abierta={editando} alCerrar={() => setEditando(false)} />

      <Confirmar
        abierta={saliendo}
        titulo="¿Cerrar sesión?"
        texto="Tus datos se guardan en este celular. Al cerrar sesión se borran de aquí y tendrás que configurar la app de nuevo."
        accion="Cerrar sesión"
        peligro
        alConfirmar={() => {
          cerrarSesion();
          router.replace("/bienvenida");
        }}
        alCerrar={() => setSaliendo(false)}
      />

      <EliminarCuenta
        abierta={eliminando}
        alCerrar={() => setEliminando(false)}
        alEliminar={async () => {
          await eliminarCuenta();
          router.replace("/bienvenida");
        }}
      />
    </>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="seccion">
      <h2 className={estilos.grupoTitulo}>{titulo}</h2>
      {children}
    </section>
  );
}

function Paso(props: {
  id: string;
  icono: React.ReactNode;
  titulo: string;
  valor: number;
  min: number;
  max: number;
  unidad: string;
  cambiar: (v: number) => void;
}) {
  const { id, icono, titulo, valor, min, max, unidad, cambiar } = props;
  return (
    <div className="lista-item">
      <span className="lista-icono" aria-hidden="true">{icono}</span>
      <span className="lista-texto">
        <span className="negrita pequeno" id={id}>{titulo}</span>
        <span className="mini texto-2 num">{valor} {unidad}</span>
      </span>
      <div className={estilos.paso} role="group" aria-labelledby={id}>
        <button aria-label="Menos" disabled={valor <= min} onClick={() => cambiar(valor - 1)}>
          <Minus size={18} />
        </button>
        <span className="num" aria-live="polite">
          {valor}
        </span>
        <button aria-label="Más" disabled={valor >= max} onClick={() => cambiar(valor + 1)}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  );
}

function EditarCuenta({ abierta, alCerrar }: { abierta: boolean; alCerrar: () => void }) {
  return (
    <Hoja abierta={abierta} alCerrar={alCerrar} titulo="Tus datos">
      {abierta && <FormularioCuenta alCerrar={alCerrar} />}
    </Hoja>
  );
}

function FormularioCuenta({ alCerrar }: { alCerrar: () => void }) {
  const perfil = useEstado((e) => e.perfil)!;
  const usuarios = useEstado((e) => e.comunidad.perfiles);
  const [nombre, setNombre] = useState(perfil.nombre);
  const [usuario, setUsuario] = useState(perfil.usuario);
  const [bio, setBio] = useState(perfil.bio);
  const [ciclita, setCiclita] = useState<CiclitaId>(perfil.ciclita);
  const [fotoId, setFotoId] = useState(perfil.fotoId);
  const [subiendo, setSubiendo] = useState(false);
  const archivo = useRef<HTMLInputElement>(null);

  const usuarioLimpio = usuario.trim().replace(/^@/, "").toLowerCase();
  const usuarioValido = /^[a-z0-9._]{3,24}$/.test(usuarioLimpio);
  const usuarioOcupado = usuarios.some((p) => p.id !== "yo" && p.usuario === usuarioLimpio);
  const valido = nombre.trim().length >= 2 && usuarioValido && !usuarioOcupado;

  const subirFoto = async (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      avisar("Elige una imagen (JPG o PNG)", "error");
      return;
    }
    setSubiendo(true);
    try {
      const blob = await comprimirFoto(f, 600);
      setFotoId(await guardarMedio(blob));
    } catch {
      avisar("No pudimos leer esa foto. Prueba con otra.", "error");
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <form
      className="columna"
      style={{ gap: 16 }}
      onSubmit={(ev) => {
        ev.preventDefault();
        if (!valido) return;
        actualizarPerfil({ nombre: nombre.trim(), usuario: usuarioLimpio, bio: bio.trim(), ciclita, fotoId });
        avisar("Datos guardados");
        alCerrar();
      }}
    >
      <div className={estilos.fotoFila}>
        <Avatar ciclita={ciclita} fotoId={fotoId} tamano={72} />
        <div className="columna" style={{ gap: 6 }}>
          <button type="button" className="boton boton-chico boton-secundario" onClick={() => archivo.current?.click()} disabled={subiendo}>
            <Camera size={16} /> {subiendo ? "Subiendo…" : fotoId ? "Cambiar foto" : "Subir foto"}
          </button>
          {fotoId && (
            <button type="button" className="enlace-vino" onClick={() => setFotoId(undefined)}>Usar mi Ciclita</button>
          )}
          <input ref={archivo} type="file" accept="image/*" hidden onChange={(e) => subirFoto(e.target.files?.[0])} />
        </div>
      </div>

      <fieldset className="columna" style={{ border: 0, padding: 0, margin: 0, gap: 8 }}>
        <legend className="etiqueta" style={{ marginBottom: 8 }}>Tu Ciclita</legend>
        <div className={estilos.ciclitas}>
          {CICLITAS_ELEGIBLES.map((c) => (
            <button
              type="button"
              key={c}
              className={estilos.ciclita}
              aria-pressed={ciclita === c}
              aria-label={CICLITAS[c].nombre}
              onClick={() => setCiclita(c)}
            >
              <Ciclita id={c} tamano={46} />
            </button>
          ))}
        </div>
      </fieldset>

      <div className="campo">
        <label htmlFor="cuenta-nombre">Nombre</label>
        <input id="cuenta-nombre" className="entrada" value={nombre} maxLength={40} onChange={(e) => setNombre(e.target.value)} />
      </div>
      <div className="campo">
        <label htmlFor="cuenta-usuario">Usuario</label>
        <input
          id="cuenta-usuario"
          className="entrada"
          value={usuario}
          maxLength={25}
          autoCapitalize="none"
          onChange={(e) => setUsuario(e.target.value)}
          aria-invalid={!usuarioValido || usuarioOcupado}
          aria-describedby="cuenta-usuario-ayuda"
        />
        <span id="cuenta-usuario-ayuda" className={!usuarioValido || usuarioOcupado ? "error-campo" : "ayuda"}>
          {usuarioOcupado
            ? "Ese usuario ya existe. Prueba con otro."
            : usuarioValido
              ? `Te verán como @${usuarioLimpio}`
              : "Entre 3 y 24 letras, números, punto o guion bajo."}
        </span>
      </div>
      <div className="campo">
        <label htmlFor="cuenta-bio">Biografía</label>
        <textarea id="cuenta-bio" className="entrada" value={bio} maxLength={150} onChange={(e) => setBio(e.target.value)} />
        <span className="ayuda num">{bio.length}/150</span>
      </div>
      <button type="submit" className="boton boton-principal boton-ancho" disabled={!valido}>
        <UserRound size={18} /> Guardar cambios
      </button>
    </form>
  );
}

function EliminarCuenta({ abierta, alCerrar, alEliminar }: { abierta: boolean; alCerrar: () => void; alEliminar: () => Promise<void> }) {
  const [texto, setTexto] = useState("");
  const [borrando, setBorrando] = useState(false);
  const cerrar = () => {
    setTexto("");
    alCerrar();
  };
  return (
    <Hoja abierta={abierta} alCerrar={cerrar} titulo="Eliminar mi cuenta">
      <p className={estilos.textoHoja}>
        Se borrarán para siempre tu perfil, tu ciclo, tu diario, tus pétalos y bonos, tus vínculos, y tus publicaciones, fotos y videos. Esto no se puede deshacer.
      </p>
      <div className="campo">
        <label htmlFor="confirmar-eliminar">Escribe ELIMINAR para confirmar</label>
        <input
          id="confirmar-eliminar"
          className="entrada"
          value={texto}
          autoCapitalize="characters"
          autoComplete="off"
          onChange={(e) => setTexto(e.target.value)}
        />
      </div>
      <button
        className="boton boton-vino boton-ancho"
        disabled={texto.trim() !== "ELIMINAR" || borrando}
        onClick={async () => {
          setBorrando(true);
          await alEliminar();
          setBorrando(false);
          setTexto("");
        }}
      >
        <Trash2 size={18} /> {borrando ? "Borrando…" : "Eliminar definitivamente"}
      </button>
      <button className="boton boton-secundario boton-ancho" onClick={cerrar}>Cancelar</button>
    </Hoja>
  );
}
