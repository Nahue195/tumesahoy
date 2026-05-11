import { motion } from 'framer-motion';
import { FileText, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const lastUpdated = '8 de Diciembre de 2024';

  const sections = [
    {
      title: '1. Aceptación de los Términos',
      content: [
        'Al acceder y utilizar TuMesaHoy ("el Servicio"), aceptas estar legalmente vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.',
        'Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación en esta página. Es tu responsabilidad revisar periódicamente estos términos.'
      ]
    },
    {
      title: '2. Descripción del Servicio',
      content: [
        'TuMesaHoy es una plataforma SaaS (Software as a Service) que permite a negocios gastronómicos crear y gestionar su presencia digital, incluyendo:',
        '• Creación de menús digitales con imágenes y precios',
        '• Sistema de gestión de reservas',
        '• Configuración de horarios de atención',
        '• Panel de administración y analíticas',
        '• Página pública personalizada para cada negocio',
        '• Código QR descargable',
        'El servicio se proporciona "tal cual" y "según disponibilidad". Nos esforzamos por mantener un uptime del 99.9%, pero no garantizamos que el servicio será ininterrumpido o libre de errores.'
      ]
    },
    {
      title: '3. Registro y Cuenta',
      content: [
        'Para utilizar TuMesaHoy, debes crear una cuenta proporcionando información precisa, completa y actualizada. Eres responsable de:',
        '• Mantener la confidencialidad de tu contraseña',
        '• Todas las actividades que ocurran bajo tu cuenta',
        '• Notificarnos inmediatamente de cualquier uso no autorizado',
        'No puedes transferir tu cuenta a otra persona sin nuestro consentimiento previo por escrito. Nos reservamos el derecho de suspender o cancelar cuentas que violen estos términos.'
      ]
    },
    {
      title: '4. Suscripción y Pagos',
      content: [
        'El servicio se ofrece bajo un modelo de suscripción mensual. Los términos de pago son:',
        '• Precio: $120,000 ARS mensuales (sujeto a cambios con 30 días de aviso)',
        '• Facturación: Automática el mismo día de cada mes',
        '• Métodos de pago: Tarjeta de crédito, débito, Mercado Pago',
        '• Impuestos: Los precios no incluyen IVA u otros impuestos aplicables',
        'La renovación es automática. Si un pago falla, intentaremos procesar el pago hasta 3 veces en 7 días. Si no se resuelve, suspenderemos el servicio hasta que se actualice el método de pago.',
        'No ofrecemos reembolsos por meses parciales. Si cancelas, tu servicio permanecerá activo hasta el final del período pagado.'
      ]
    },
    {
      title: '5. Cancelación y Terminación',
      content: [
        'Puedes cancelar tu suscripción en cualquier momento desde tu panel de administración. La cancelación:',
        '• Detiene la renovación automática',
        '• Mantiene el servicio activo hasta el final del período pagado',
        '• Conserva tus datos por 60 días en caso de que decidas volver',
        'Nos reservamos el derecho de suspender o terminar tu cuenta si:',
        '• Violas estos términos de servicio',
        '• Usas el servicio para actividades ilegales',
        '• Proporcionas información falsa o engañosa',
        '• No pagas tu suscripción',
        '• El servicio es utilizado de manera que cause daño a otros usuarios o a nuestra infraestructura'
      ]
    },
    {
      title: '6. Uso Aceptable',
      content: [
        'Al usar TuMesaHoy, aceptas NO:',
        '• Usar el servicio para fines ilegales o fraudulentos',
        '• Publicar contenido ofensivo, difamatorio, obsceno o que viole derechos de terceros',
        '• Intentar obtener acceso no autorizado a nuestros sistemas',
        '• Realizar ingeniería inversa, descompilar o desensamblar el software',
        '• Revender o redistribuir el servicio sin autorización',
        '• Usar el servicio para enviar spam o malware',
        '• Sobrecargar nuestros servidores con uso excesivo o abusivo',
        'Nos reservamos el derecho de eliminar contenido que viole estas políticas sin previo aviso.'
      ]
    },
    {
      title: '7. Propiedad Intelectual',
      content: [
        'TuMesaHoy y todo su contenido (diseño, código, marca, logo) son propiedad de TuMesaHoy o sus licenciantes y están protegidos por:',
        '• Leyes de derechos de autor',
        '• Leyes de marcas registradas',
        '• Otras leyes de propiedad intelectual',
        'Te otorgamos una licencia limitada, no exclusiva, no transferible para usar el servicio durante la vigencia de tu suscripción.',
        'Tú conservas todos los derechos sobre el contenido que publicas (fotos de platos, descripciones, etc.), pero nos otorgas una licencia para almacenarlo, mostrarlo y procesarlo como parte del servicio.'
      ]
    },
    {
      title: '8. Privacidad y Datos',
      content: [
        'El tratamiento de tus datos personales y los de tus clientes está regido por nuestra Política de Privacidad, que forma parte integral de estos términos.',
        'Tus datos están protegidos mediante:',
        '• Encriptación SSL/TLS',
        '• Almacenamiento seguro en servidores certificados',
        '• Backups automáticos diarios',
        '• Row Level Security (RLS) en la base de datos',
        'Nunca compartimos, vendemos o alquilamos tus datos a terceros con fines de marketing.'
      ]
    },
    {
      title: '9. Limitación de Responsabilidad',
      content: [
        'En la máxima medida permitida por la ley:',
        'TuMesaHoy NO será responsable por daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles.',
        'Nuestra responsabilidad total no excederá el monto pagado por ti en los últimos 12 meses.',
        'No garantizamos que:',
        '• El servicio cumplirá tus requisitos específicos',
        '• El servicio será ininterrumpido, oportuno, seguro o libre de errores',
        '• Los resultados obtenidos del uso del servicio serán precisos o confiables',
        'Reconoces que eres el único responsable del uso del servicio y de las decisiones tomadas en base a la información proporcionada.'
      ]
    },
    {
      title: '10. Indemnización',
      content: [
        'Aceptas indemnizar, defender y mantener indemne a TuMesaHoy, sus directores, empleados, socios y agentes de cualquier reclamo, daño, obligación, pérdida, responsabilidad, costo o deuda, y gasto (incluidos honorarios de abogados) que surjan de:',
        '• Tu uso del servicio',
        '• Tu violación de estos términos',
        '• Tu violación de derechos de terceros',
        '• Contenido que publiques en el servicio'
      ]
    },
    {
      title: '11. Modificaciones al Servicio',
      content: [
        'Nos reservamos el derecho de:',
        '• Modificar o discontinuar, temporal o permanentemente, el servicio (o cualquier parte de él)',
        '• Cambiar precios con 30 días de aviso previo',
        '• Agregar o eliminar funcionalidades',
        'Haremos esfuerzos razonables para notificarte de cambios importantes con anticipación, pero no estamos obligados a hacerlo.'
      ]
    },
    {
      title: '12. Ley Aplicable y Jurisdicción',
      content: [
        'Estos términos se rigen por las leyes de la República Argentina, específicamente:',
        '• Ley de Defensa del Consumidor (Ley 24.240)',
        '• Ley de Protección de Datos Personales (Ley 25.326)',
        '• Código Civil y Comercial de la Nación',
        'Cualquier disputa relacionada con estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de la Ciudad Autónoma de Buenos Aires, Argentina.',
        'Si alguna disposición de estos términos se considera inválida o inaplicable, las disposiciones restantes continuarán en pleno vigor y efecto.'
      ]
    },
    {
      title: '13. Garantía del Consumidor',
      content: [
        'De acuerdo con la Ley de Defensa del Consumidor de Argentina:',
        '• Tienes derecho a recibir información clara, detallada y gratuita sobre el servicio',
        '• Los precios deben ser claros e incluir todos los cargos',
        '• Tienes derecho a revocar la aceptación dentro de los 10 días (derecho de arrepentimiento)',
        '• No podemos incluir cláusulas abusivas que limiten tus derechos como consumidor',
        'Para ejercer el derecho de arrepentimiento, contacta a hola@tumesahoy.com dentro de los 10 días posteriores a la contratación.'
      ]
    },
    {
      title: '14. Fuerza Mayor',
      content: [
        'No seremos responsables por el incumplimiento de nuestras obligaciones debido a causas fuera de nuestro control razonable, incluyendo:',
        '• Desastres naturales',
        '• Guerras, terrorismo, disturbios',
        '• Fallas en servicios de terceros (proveedores de internet, hosting)',
        '• Acciones gubernamentales',
        '• Pandemias o emergencias sanitarias',
        'En tales casos, nuestras obligaciones se suspenderán durante el período de fuerza mayor.'
      ]
    },
    {
      title: '15. Contacto',
      content: [
        'Si tienes preguntas sobre estos Términos de Servicio, puedes contactarnos:',
        '• Email: legal@tumesahoy.com',
        '• WhatsApp: +54 9 11 1234-5678',
        '• Dirección: Av. Corrientes 1234, CABA, Argentina',
        '• Horario de atención: Lunes a Viernes 9:00-18:00'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-light to-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4 bg-gradient-to-r from-primary to-accent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <FileText className="w-16 h-16 text-white mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Términos de Servicio
              </h1>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="w-5 h-5" />
                <span>Última actualización: {lastUpdated}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
            >
              <p className="text-neutral-medium text-lg leading-relaxed mb-6">
                Bienvenido a TuMesaHoy. Estos Términos de Servicio ("Términos") constituyen un acuerdo legal entre tú ("Usuario", "tú", "tu") y TuMesaHoy ("nosotros", "nuestro", "la Compañía") respecto al uso de nuestra plataforma y servicios.
              </p>
              <p className="text-neutral-medium text-lg leading-relaxed">
                Por favor, lee estos términos cuidadosamente antes de usar nuestro servicio. Al acceder o usar TuMesaHoy, aceptas estar legalmente vinculado por estos términos.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg p-8"
                >
                  <h2 className="text-2xl font-bold text-neutral-dark mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-4">
                    {section.content.map((paragraph, idx) => (
                      <p key={idx} className="text-neutral-medium leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer Note */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 mt-12"
            >
              <h3 className="text-xl font-bold text-neutral-dark mb-4">
                Nota Importante
              </h3>
              <p className="text-neutral-medium leading-relaxed mb-4">
                Estos términos están diseñados para ser justos tanto para ti como para nosotros. Si algo no está claro o tienes alguna pregunta, no dudes en contactarnos.
              </p>
              <p className="text-neutral-medium leading-relaxed">
                Nos comprometemos a mantener estos términos actualizados y a notificarte de cualquier cambio significativo.
              </p>
            </motion.div>

            {/* CTA */}
            <div className="mt-12 text-center">
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                ¿Tienes Preguntas? Contáctanos
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
