import type { Metadata } from "next";
import Link from "next/link";
import { Cabecera } from "@/components/Cabecera";
import estilos from "../legal.module.css";

export const metadata: Metadata = { title: "Política de privacidad · Mi Ciclo" };

export default function Privacidad() {
  return (
    <>
      <Cabecera titulo="Privacidad" />
      <article className={estilos.documento}>
        <p className={estilos.borrador}>Borrador para revisión del abogado. No es la versión final.</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/marca/logo-rojo.svg" alt="Mi Ciclo" className={estilos.logo} width={92} height={24} />
        <h1>Política de tratamiento de datos personales</h1>
        <p className={estilos.meta}>Versión 0.1 · Última actualización: 28 de octubre de 2026</p>

        <h2>1. Quién es responsable de tus datos</h2>
        <p>
          <strong>EA Business Group SAS</strong>, sociedad colombiana dueña de la marca Mi Ciclo (en adelante, “Mi Ciclo”), es la
          responsable del tratamiento de los datos personales que recoge la app Mi Ciclo. Contacto para temas de privacidad:{" "}
          <strong>privacidad@miciclo.co</strong> [correo por confirmar]. NIT y domicilio: [por completar].
        </p>

        <h2>2. Normas que aplicamos</h2>
        <p>
          Tratamos tus datos según la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013 (compilado en el Decreto 1074 de 2015) y
          las demás normas colombianas de protección de datos personales.
        </p>

        <h2>3. Solo para mayores de 18 años</h2>
        <p>
          Mi Ciclo es una app exclusiva para personas mayores de 18 años. No recogemos a sabiendas datos de menores de edad. Si
          detectamos una cuenta de una menor, la eliminamos.
        </p>

        <h2>4. Qué datos tratamos</h2>
        <ul>
          <li><strong>Datos de cuenta:</strong> nombre, usuario, biografía, foto o Ciclita, correo o teléfono de acceso.</li>
          <li>
            <strong>Datos sensibles de salud:</strong> fechas de tu regla, duración del ciclo, fase, ánimo, síntomas, días íntimos y
            entradas de tu diario. Son datos sensibles según el artículo 5 de la Ley 1581.
          </li>
          <li><strong>Datos de uso:</strong> misiones, pétalos, bonos canjeados y preferencias de notificaciones.</li>
          <li><strong>Contenido de la comunidad:</strong> publicaciones, preguntas, comentarios, historias, reels, flores y seguimientos.</li>
          <li><strong>Modo vínculo:</strong> nombre y rol de las personas que tú invites.</li>
        </ul>

        <h2>5. Para qué usamos tus datos</h2>
        <ol>
          <li>Calcular tu ciclo, tus fases y tus predicciones, y darte consejos según tu fase.</li>
          <li>Enviarte las notificaciones que actives (consejo diario, racha, cambio de fase y comunidad).</li>
          <li>Hacer funcionar la comunidad y moderarla para que sea un espacio seguro.</li>
          <li>Gestionar el programa de pétalos y entregarte bonos de descuento.</li>
          <li>Compartir con tu vínculo solo los datos que tú autorices.</li>
          <li>Medir, de forma agregada y sin datos de salud, qué ventas vienen de la app (códigos de bono y parámetros UTM).</li>
        </ol>

        <h2>6. Datos sensibles: autorización y cuidados</h2>
        <ul>
          <li>No estás obligada a darnos datos sensibles. Si los registras, nos autorizas de forma expresa a tratarlos solo para las finalidades anteriores.</li>
          <li>
            Tus datos de salud <strong>nunca</strong> se envían a píxeles de publicidad, redes sociales ni herramientas externas de
            analítica, y nunca se venden.
          </li>
          <li>Tu diario está cifrado con un PIN que solo tú conoces. No podemos leerlo.</li>
          <li>En la comunidad nunca se muestra tu fase ni tus datos del ciclo.</li>
          <li>Cuando publicas como anónima, tu identidad solo la puede ver el equipo de moderación.</li>
        </ul>

        <h2>7. Con quién compartimos datos</h2>
        <p>
          Con proveedores que nos ayudan a operar la app (alojamiento y base de datos), bajo contratos de transmisión de datos y con
          las mismas medidas de seguridad. Con tu vínculo, solo lo que actives en “Qué compartes”. Con autoridades, cuando la ley lo exija.
        </p>

        <h2>8. Tus derechos</h2>
        <p>Como titular puedes, en cualquier momento y sin costo:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Pedir prueba de la autorización que nos diste.</li>
          <li>Saber qué uso le hemos dado a tus datos.</li>
          <li>Revocar la autorización y pedir que borremos tus datos. Puedes hacerlo tú misma desde Configuraciones → Eliminar mi cuenta.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
        </ul>
        <p>
          Respondemos consultas en máximo 10 días hábiles y reclamos en máximo 15 días hábiles, según los artículos 14 y 15 de la Ley 1581.
        </p>

        <h2>9. Cuánto tiempo guardamos tus datos</h2>
        <p>
          Mientras tengas tu cuenta activa. Si la eliminas, borramos tus datos y contenidos en un plazo máximo de 30 días, salvo lo que la
          ley nos obligue a conservar. Las historias y las notas del modo vínculo se borran solas a las 24 horas.
        </p>

        <h2>10. Seguridad</h2>
        <p>
          Usamos conexión cifrada, control de acceso por usuaria en la base de datos, cifrado del diario y enlaces firmados para fotos y videos.
        </p>

        <h2>11. Cambios a esta política</h2>
        <p>Si cambiamos esta política te avisaremos en la app antes de que los cambios apliquen.</p>

        <p className={estilos.pie}>
          Mi Ciclo no reemplaza la consulta médica. Ver también los <Link href="/legal/terminos" className="enlace-rojo">Términos y condiciones</Link>.
        </p>
      </article>
    </>
  );
}
