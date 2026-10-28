import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import estilos from "../legal.module.css";

export const metadata: Metadata = { title: "Términos y condiciones · Mi Ciclo" };

export default function Terminos() {
  return (
    <>
      <Cabecera titulo="Términos" />
      <article className={estilos.documento}>
        <p className={estilos.borrador}>Borrador para revisión del abogado. No es la versión final.</p>
        <p className="marca" style={{ fontSize: 20 }}>Mi Ciclo</p>
        <h1>Términos y condiciones de uso</h1>
        <p className={estilos.meta}>Versión 0.1 · Última actualización: 28 de octubre de 2026</p>

        <h2>1. Quiénes somos</h2>
        <p>
          La app Mi Ciclo es operada por <strong>EA Business Group SAS</strong> (Colombia). Al crear tu cuenta aceptas estos términos y la{" "}
          <Link href="/legal/privacidad" className="enlace-rojo">Política de privacidad</Link>.
        </p>

        <h2>2. Edad mínima</h2>
        <p>Debes ser mayor de 18 años para usar Mi Ciclo. Al registrarte declaras que lo eres.</p>

        <h2>3. Mi Ciclo no es un servicio médico</h2>
        <p>
          Las fases, predicciones y consejos son orientativos y se basan en la información que registras. No son un diagnóstico, no
          reemplazan la consulta con un profesional de la salud y <strong>no sirven como método anticonceptivo</strong>. Si tienes
          síntomas que te preocupan, consulta a tu médico.
        </p>

        <h2>4. La comunidad</h2>
        <ul>
          <li>Es un espacio de apoyo entre mujeres. Trata a las demás con respeto y sin juicio.</li>
          <li>No publiques datos personales tuyos o de otras personas, ni contenido sexual, violento, discriminatorio o publicitario.</li>
          <li>No des indicaciones sobre medicamentos ni dosis. Los temas de riesgo (autolesión, embarazo, medicamentos) pasan por revisión humana.</li>
          <li>Podemos retener, ocultar o eliminar contenido y suspender cuentas que incumplan estas reglas. Con dos reportes, un contenido se oculta hasta revisarlo.</li>
          <li>Eres responsable de lo que publicas y nos das permiso de mostrarlo dentro de la app mientras no lo borres.</li>
          <li>Si publicas como anónima, las demás usuarias no verán tu perfil. El equipo de moderación sí puede verlo para proteger la comunidad.</li>
        </ul>

        <h2>5. Pétalos y bonos</h2>
        <ul>
          <li>Los pétalos se ganan con misiones dentro de la app. No tienen valor en dinero, no se venden ni se transfieren.</li>
          <li>Los bonos se canjean por pétalos, tienen un código único de un solo uso y aplican en la tienda oficial de Mi Ciclo según sus condiciones.</li>
          <li>Podemos cambiar las misiones, los valores y el catálogo de bonos avisándote en la app. Los bonos ya canjeados se respetan.</li>
          <li>Si detectamos abuso o fraude, podemos anular pétalos o bonos.</li>
        </ul>

        <h2>6. Modo vínculo</h2>
        <p>
          Tú decides a quién invitas y qué datos se comparten. Puedes quitar un vínculo cuando quieras. Tu diario nunca se comparte.
        </p>

        <h2>7. Tu cuenta</h2>
        <p>
          Puedes cerrar sesión o eliminar tu cuenta desde Configuraciones. Al eliminarla borramos tus datos según la Política de privacidad.
        </p>

        <h2>8. Propiedad intelectual</h2>
        <p>La marca Mi Ciclo, las Ciclitas, la flor-luna, los textos y el diseño de la app son de EA Business Group SAS.</p>

        <h2>9. Ley aplicable</h2>
        <p>
          Estos términos se rigen por las leyes de Colombia, incluido el Estatuto del Consumidor (Ley 1480 de 2011). Las quejas pueden
          dirigirse a soporte@miciclo.co [correo por confirmar] o a la Superintendencia de Industria y Comercio.
        </p>

        <p className={estilos.pie}>Mi Ciclo · Tu cuerpo no falla. Se expresa.</p>
      </article>
    </>
  );
}
