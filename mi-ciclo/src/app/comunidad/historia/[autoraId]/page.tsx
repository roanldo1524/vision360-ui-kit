"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal, Send, Trash2, Flag, X } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Flor } from "@/components/Flor";
import { Estrella } from "@/components/FormasMarca";
import { MedioVista } from "@/components/MedioVista";
import { Confirmar, Hoja } from "@/components/Hoja";
import { avisar } from "@/components/Avisos";
import cs from "@/components/comunidad/comunidad.module.css";
import {
  alternarFlor,
  eliminarPublicacion,
  marcarHistoriaVista,
  reportar,
} from "@/lib/comunidad/acciones";
import { historiasPorAutora, useContexto, type GrupoHistorias } from "@/lib/comunidad/consultas";
import { MOTIVOS_REPORTE } from "@/lib/comunidad/moderacion";
import { haceCuanto, vibrar } from "@/lib/utilidades";
import estilos from "./historia.module.css";

const DURACION_MS = 6000;

export default function Historia() {
  const { autoraId } = useParams<{ autoraId: string }>();
  return <Visor key={autoraId} autoraId={autoraId} />;
}

function Visor({ autoraId }: { autoraId: string }) {
  const router = useRouter();
  const ctx = useContexto();
  const grupos = useMemo(() => historiasPorAutora(ctx), [ctx]);
  // Se congela el orden al entrar para saber cuál sigue aunque cambie "vista".
  const [orden] = useState(() => grupos.map((g) => g.autora.id));
  const grupo: GrupoHistorias | undefined = grupos.find((g) => g.autora.id === autoraId);
  const [idx, setIdx] = useState(() => {
    const primeraSinVer = grupo?.historias.findIndex((h) => !ctx.c.historiasVistas.includes(h.id)) ?? -1;
    return Math.max(0, primeraSinVer);
  });
  const [pausa, setPausa] = useState(false);
  const [reaccion, setReaccion] = useState("");
  const [hoja, setHoja] = useState<null | "menu" | "reportar" | "eliminar">(null);
  const historia = grupo?.historias[Math.min(idx, (grupo?.historias.length ?? 1) - 1)];

  useEffect(() => {
    if (historia) marcarHistoriaVista(historia.id);
  }, [historia]);

  const cerrar = () => router.push("/comunidad");
  const siguienteGrupo = () => {
    const i = orden.indexOf(autoraId);
    const sig = orden.slice(i + 1).find((id) => id && grupos.some((g) => g.autora.id === id));
    if (sig) router.replace(`/comunidad/historia/${sig}`);
    else cerrar();
  };
  const avanzar = () => {
    if (!grupo) return cerrar();
    if (idx < grupo.historias.length - 1) setIdx(idx + 1);
    else siguienteGrupo();
  };
  const retroceder = () => {
    if (idx > 0) setIdx(idx - 1);
    else {
      const i = orden.indexOf(autoraId);
      const ant = orden.slice(0, Math.max(0, i)).reverse().find((id) => id && grupos.some((g) => g.autora.id === id));
      if (ant) router.replace(`/comunidad/historia/${ant}`);
    }
  };

  if (!grupo || !historia) {
    return (
      <div className={estilos.visor}>
        <div className={estilos.vacio}>
          <p className="titulo-m">Esta historia ya no está</p>
          <p className="pequeno">Las historias duran 24 horas.</p>
          <button className="boton boton-secundario" onClick={cerrar}>Volver a la comunidad</button>
        </div>
      </div>
    );
  }

  const enPausa = pausa || hoja !== null;
  const textoMedio = historia.medios[0]?.tipo === "ilustracion" ? historia.medios[0].texto : undefined;

  return (
    <div className={estilos.visor}>
      <div className={estilos.medio}>
        {historia.medios[0] && (
          <MedioVista
            medio={historia.medios[0].tipo === "ilustracion" ? { ...historia.medios[0], texto: undefined } : historia.medios[0]}
            autoReproducir
          />
        )}
      </div>
      <div className={estilos.sombraArriba} />
      <div className={estilos.sombraAbajo} />

      {/* zonas táctiles: atrás · pausa · adelante */}
      <button className={estilos.zonaAtras} aria-label="Historia anterior" onClick={retroceder} />
      <button
        className={estilos.zonaAdelante}
        aria-label="Siguiente historia"
        onClick={avanzar}
        onPointerDown={() => setPausa(true)}
        onPointerUp={() => setPausa(false)}
        onPointerLeave={() => setPausa(false)}
      />

      <div className={estilos.arriba}>
        <div className={estilos.barras}>
          {grupo.historias.map((h, i) => (
            <span key={h.id} className={estilos.barra}>
              <span
                key={`${h.id}-${i === idx}`}
                className={`${estilos.relleno} ${i < idx ? estilos.llena : ""} ${i === idx ? estilos.activa : ""}`}
                style={{ animationDuration: `${DURACION_MS}ms`, animationPlayState: enPausa ? "paused" : "running" }}
                onAnimationEnd={i === idx ? avanzar : undefined}
              />
            </span>
          ))}
        </div>
        <div className={estilos.autora}>
          <Avatar ciclita={grupo.autora.ciclita} fotoId={grupo.autora.fotoId} tamano={34} />
          <b>{grupo.autora.id === "yo" ? "Tu historia" : grupo.autora.alias}</b>
          <span className={estilos.hace}>{haceCuanto(historia.creadaEn, ctx.ahora).replace("hace ", "")}</span>
          <span className={cs.espaciador} />
          <button className={estilos.icono} aria-label="Opciones" onClick={() => setHoja("menu")}>
            <MoreHorizontal size={22} />
          </button>
          <button className={estilos.icono} aria-label="Cerrar" onClick={cerrar}>
            <X size={24} />
          </button>
        </div>
      </div>

      {(historia.texto || textoMedio) && (
        <p className={estilos.texto}>
          {textoMedio ?? historia.texto}
          <Estrella color="#ffffff" tamano={28} className={estilos.florTexto} />
        </p>
      )}

      {historia.esMia ? (
        <div className={estilos.abajo}>
          <span className={estilos.expira}>
            Desaparece en {Math.max(1, Math.round(((historia.expiraEn ?? ctx.ahora) - ctx.ahora) / 3_600_000))} h · solo dura 24 horas
          </span>
        </div>
      ) : (
        <form
          className={estilos.abajo}
          onSubmit={(e) => {
            e.preventDefault();
            if (!reaccion.trim()) return;
            setReaccion("");
            avisar(`Reacción enviada a ${grupo.autora.alias}`);
          }}
        >
          <label htmlFor="reaccion" className="solo-lector">Enviar una reacción</label>
          <input
            id="reaccion"
            className={estilos.reaccion}
            placeholder="Enviar una reacción…"
            value={reaccion}
            onChange={(e) => setReaccion(e.target.value)}
            onFocus={() => setPausa(true)}
            onBlur={() => setPausa(false)}
            maxLength={200}
          />
          <button
            type="button"
            className={estilos.icono}
            aria-pressed={historia.diFlor}
            aria-label={historia.diFlor ? "Quitar flor" : "Dar flor"}
            onClick={() => {
              vibrar();
              alternarFlor(`p:${historia.id}`);
            }}
          >
            <Flor tamano={24} activa={historia.diFlor} />
          </button>
          <button type="submit" className={estilos.icono} aria-label="Enviar reacción">
            <Send size={22} />
          </button>
        </form>
      )}

      <Hoja abierta={hoja === "menu"} alCerrar={() => setHoja(null)} titulo="Historia">
        <div className={cs.opciones}>
          {historia.esMia ? (
            <button className={`${cs.opcion} ${cs.opcionPeligro}`} onClick={() => setHoja("eliminar")}>
              <Trash2 size={18} /> Eliminar historia
            </button>
          ) : (
            <button className={cs.opcion} onClick={() => setHoja("reportar")}>
              <Flag size={18} /> Reportar
            </button>
          )}
        </div>
      </Hoja>
      <Hoja abierta={hoja === "reportar"} alCerrar={() => setHoja(null)} titulo="¿Por qué la reportas?">
        <div className={cs.opciones}>
          {MOTIVOS_REPORTE.map((m) => (
            <button
              key={m}
              className={cs.opcion}
              onClick={() => {
                reportar({ tipo: "publicacion", id: historia.id }, m);
                avisar("Gracias. El equipo lo revisará.");
                setHoja(null);
                avanzar();
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </Hoja>
      <Confirmar
        abierta={hoja === "eliminar"}
        titulo="¿Eliminar esta historia?"
        texto="Desaparece para todas de inmediato."
        accion="Eliminar"
        peligro
        alConfirmar={() => {
          eliminarPublicacion(historia.id);
          avisar("Historia eliminada");
          cerrar();
        }}
        alCerrar={() => setHoja(null)}
      />
    </div>
  );
}
