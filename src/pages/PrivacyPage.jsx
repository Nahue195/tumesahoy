import { motion } from 'framer-motion';
import { Shield, Calendar, Lock, Eye, Database, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPage() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const lastUpdated = '8 de Diciembre de 2024';

  const principles = [
    {
      icon: Lock,
      title: 'Seguridad Primero',
      description: 'Todos tus datos están encriptados y protegidos'
    },
    {
      icon: Eye,
      title: 'Transparencia Total',
      description: 'Te decimos exactamente qué hacemos con tu información'
    },
    {
      icon: UserCheck,
      title: 'Tú Tienes el Control',
      description: 'Puedes acceder, modificar o eliminar tus datos cuando quieras'
    },
    {
      icon: Database,
      title: 'Datos Mínimos',
      description: 'Solo recolectamos lo estrictamente necesario'
    }
  ];

  const sections = [
    {
      title: '1. Información que Recopilamos',
      icon: Database,
      content: [
        {
          subtitle: 'Información de Cuenta',
          text: 'Cuando te registras en TuMesaHoy, recopilamos: email, contraseña (hasheada), nombre del negocio, nombre del dueño, categoría del negocio, dirección, teléfono, y WhatsApp. Esta información es necesaria para crear y gestionar tu cuenta.'
        },
        {
          subtitle: 'Información del Menú',
          text: 'Cuando creas tu menú, almacenamos: nombres de categorías, nombres de items, descripciones, precios, e imágenes que subes. Esta información se muestra en tu página pública.'
        },
        {
          subtitle: 'Información de Reservas',
          text: 'Cuando tus clientes hacen reservas, almacenamos: nombre del cliente, teléfono, fecha y hora de reserva, cantidad de personas, y mensaje opcional. Esta información es privada y solo tú puedes acceder a ella.'
        },
        {
          subtitle: 'Información de Pago',
          text: 'Para procesar pagos, trabajamos con Mercado Pago. Almacenamos: ID de transacción, estado del pago, monto, y fecha. NO almacenamos información de tarjetas de crédito o débito (esto lo maneja directamente Mercado Pago).'
        },
        {
          subtitle: 'Información de Uso',
          text: 'Recopilamos automáticamente: dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia, y acciones realizadas. Esto nos ayuda a mejorar el servicio y detectar problemas.'
        }
      ]
    },
    {
      title: '2. Cómo Usamos tu Información',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Provisión del Servicio',
          text: 'Usamos tu información para: crear y mantener tu cuenta, mostrar tu menú digital, gestionar reservas, procesar pagos, enviar notificaciones importantes, y proporcionar soporte técnico.'
        },
        {
          subtitle: 'Mejora del Servicio',
          text: 'Analizamos datos agregados y anónimos para: entender cómo se usa la plataforma, identificar problemas técnicos, desarrollar nuevas funcionalidades, y mejorar la experiencia del usuario.'
        },
        {
          subtitle: 'Comunicaciones',
          text: 'Te enviamos: emails de confirmación, actualizaciones importantes del servicio, notificaciones de seguridad, y (solo si aceptaste) newsletters con consejos y novedades. Puedes darte de baja en cualquier momento.'
        },
        {
          subtitle: 'Cumplimiento Legal',
          text: 'Podemos usar tu información para: cumplir con obligaciones legales, responder a solicitudes gubernamentales legítimas, proteger nuestros derechos legales, y prevenir fraude o actividades ilegales.'
        }
      ]
    },
    {
      title: '3. Compartir tu Información',
      icon: Eye,
      content: [
        {
          subtitle: 'Lo que NO hacemos',
          text: 'NUNCA vendemos, alquilamos o compartimos tu información personal con terceros para fines de marketing. Tu información es tuya y solo tuya.'
        },
        {
          subtitle: 'Proveedores de Servicios',
          text: 'Compartimos información mínima con: Supabase (hosting y base de datos), Mercado Pago (procesamiento de pagos), y proveedores de email (notificaciones). Todos estos proveedores tienen acuerdos de confidencialidad y solo procesan datos según nuestras instrucciones.'
        },
        {
          subtitle: 'Información Pública',
          text: 'La información que eliges hacer pública en tu página de negocio (nombre, menú, horarios, dirección) es accesible para cualquier persona que visite tu página. Tú decides qué información incluir.'
        },
        {
          subtitle: 'Requisitos Legales',
          text: 'Podemos divulgar información si estamos legalmente obligados a hacerlo por: orden judicial, citación, proceso legal, o para proteger nuestros derechos, propiedad o seguridad.'
        }
      ]
    },
    {
      title: '4. Seguridad de los Datos',
      icon: Lock,
      content: [
        {
          subtitle: 'Medidas Técnicas',
          text: 'Implementamos seguridad de nivel enterprise: Encriptación SSL/TLS para todas las conexiones, contraseñas hasheadas con bcrypt, Row Level Security (RLS) en la base de datos, y backups automáticos diarios encriptados.'
        },
        {
          subtitle: 'Medidas Organizacionales',
          text: 'Nuestro equipo sigue protocolos estrictos: acceso limitado solo al personal autorizado, revisiones de seguridad regulares, políticas de contraseñas fuertes, y capacitación continua en seguridad.'
        },
        {
          subtitle: 'Infraestructura',
          text: 'Usamos Supabase, una plataforma certificada SOC 2 Type 2, que garantiza los más altos estándares de seguridad, disponibilidad y confidencialidad.'
        },
        {
          subtitle: 'Limitaciones',
          text: 'Ningún sistema es 100% seguro. Hacemos nuestro mejor esfuerzo para proteger tus datos, pero no podemos garantizar seguridad absoluta. Te recomendamos usar contraseñas fuertes y únicas.'
        }
      ]
    },
    {
      title: '5. Retención de Datos',
      icon: Database,
      content: [
        {
          subtitle: 'Datos de Cuenta Activa',
          text: 'Mientras tu cuenta esté activa, conservamos toda tu información para proporcionar el servicio. Esto incluye menú, reservas históricas, y configuración.'
        },
        {
          subtitle: 'Datos de Cuenta Cancelada',
          text: 'Si cancelas tu suscripción: conservamos tus datos por 60 días en caso de que decidas volver, después de 60 días, tus datos se anonimizarán o eliminarán permanentemente (salvo que la ley requiera conservación más prolongada).'
        },
        {
          subtitle: 'Datos de Facturación',
          text: 'Por obligaciones fiscales y contables, conservamos registros de facturación y pagos por un mínimo de 5 años, según lo requiere la legislación argentina.'
        },
        {
          subtitle: 'Datos Agregados',
          text: 'Podemos conservar datos agregados y anónimos indefinidamente para análisis estadísticos y mejora del servicio. Estos datos no te identifican personalmente.'
        }
      ]
    },
    {
      title: '6. Tus Derechos (Ley 25.326)',
      icon: Shield,
      content: [
        {
          subtitle: 'Derecho de Acceso',
          text: 'Puedes solicitar una copia de todos los datos personales que tenemos sobre ti. Te la proporcionaremos en formato digital dentro de 10 días hábiles.'
        },
        {
          subtitle: 'Derecho de Rectificación',
          text: 'Puedes corregir o actualizar tu información en cualquier momento desde tu panel de administración. Si hay datos que no puedes editar, contáctanos.'
        },
        {
          subtitle: 'Derecho de Supresión',
          text: 'Puedes solicitar la eliminación de tu cuenta y todos tus datos. Lo haremos dentro de 30 días, salvo que tengamos obligación legal de conservar cierta información.'
        },
        {
          subtitle: 'Derecho de Oposición',
          text: 'Puedes oponerte al procesamiento de tus datos para ciertos fines (como marketing). Respetaremos tu decisión inmediatamente.'
        },
        {
          subtitle: 'Derecho de Portabilidad',
          text: 'Puedes solicitar tus datos en formato estructurado y legible por máquina (CSV/JSON) para transferirlos a otro servicio.'
        },
        {
          subtitle: 'Cómo Ejercer tus Derechos',
          text: 'Para ejercer cualquiera de estos derechos, envía un email a privacidad@tumesahoy.com con tu solicitud. Responderemos dentro de 10 días hábiles.'
        }
      ]
    },
    {
      title: '7. Cookies y Tecnologías Similares',
      icon: Database,
      content: [
        {
          subtitle: 'Cookies Esenciales',
          text: 'Usamos cookies estrictamente necesarias para: mantener tu sesión iniciada, recordar tus preferencias, y garantizar la seguridad. Estas cookies no se pueden desactivar.'
        },
        {
          subtitle: 'Cookies de Análisis',
          text: 'Usamos cookies para entender cómo se usa el servicio (páginas visitadas, tiempo de permanencia, etc.). Estos datos son agregados y anónimos.'
        },
        {
          subtitle: 'Local Storage',
          text: 'Usamos el almacenamiento local de tu navegador para mejorar el rendimiento y guardar preferencias de interfaz. Puedes borrar esto desde la configuración de tu navegador.'
        },
        {
          subtitle: 'Control de Cookies',
          text: 'Puedes configurar tu navegador para rechazar cookies, pero esto puede afectar el funcionamiento del servicio. La mayoría de navegadores aceptan cookies por defecto.'
        }
      ]
    },
    {
      title: '8. Transferencias Internacionales',
      icon: Database,
      content: [
        {
          subtitle: 'Ubicación de Servidores',
          text: 'Tus datos se almacenan en servidores de Supabase, que pueden estar ubicados fuera de Argentina. Supabase cumple con estándares internacionales de protección de datos.'
        },
        {
          subtitle: 'Protecciones',
          text: 'Cuando transferimos datos fuera de Argentina, nos aseguramos de que: el país receptor tenga leyes adecuadas de protección de datos, o implementamos salvaguardas contractuales apropiadas.'
        }
      ]
    },
    {
      title: '9. Privacidad de Menores',
      icon: Shield,
      content: [
        {
          subtitle: 'Restricción de Edad',
          text: 'TuMesaHoy está dirigido a negocios y profesionales. No recopilamos intencionalmente información de menores de 18 años.'
        },
        {
          subtitle: 'Si Descubrimos Datos de Menores',
          text: 'Si nos enteramos de que hemos recopilado datos de un menor de 18 años sin verificación de consentimiento parental, eliminaremos esa información inmediatamente.'
        }
      ]
    },
    {
      title: '10. Cambios a esta Política',
      icon: Calendar,
      content: [
        {
          subtitle: 'Notificación de Cambios',
          text: 'Si hacemos cambios significativos a esta política de privacidad, te notificaremos por email con al menos 30 días de anticipación y actualizaremos la fecha "Última actualización" en esta página.'
        },
        {
          subtitle: 'Cambios Menores',
          text: 'Para cambios menores (correcciones tipográficas, aclaraciones), simplemente actualizaremos esta página. Es tu responsabilidad revisar periódicamente esta política.'
        },
        {
          subtitle: 'Tu Consentimiento',
          text: 'Al continuar usando TuMesaHoy después de la notificación de cambios, aceptas la política actualizada. Si no estás de acuerdo, puedes cancelar tu cuenta.'
        }
      ]
    },
    {
      title: '11. Contacto y Reclamos',
      icon: UserCheck,
      content: [
        {
          subtitle: 'Contacto General',
          text: 'Para preguntas sobre privacidad: Email: privacidad@tumesahoy.com | WhatsApp: +54 9 11 1234-5678 | Dirección: Av. Corrientes 1234, CABA, Argentina'
        },
        {
          subtitle: 'Oficial de Privacidad',
          text: 'Nuestro oficial de privacidad está disponible para resolver dudas sobre el tratamiento de datos. Puedes contactarlo en privacidad@tumesahoy.com'
        },
        {
          subtitle: 'Reclamos ante la Autoridad',
          text: 'Si consideras que no hemos protegido adecuadamente tu privacidad, puedes presentar un reclamo ante la Agencia de Acceso a la Información Pública (AAIP) - www.argentina.gob.ar/aaip'
        }
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
              <Shield className="w-16 h-16 text-white mx-auto mb-6" />
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
                Política de Privacidad
              </h1>
              <div className="flex items-center justify-center gap-2 text-white/90">
                <Calendar className="w-5 h-5" />
                <span>Última actualización: {lastUpdated}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Principles */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-4xl font-bold text-neutral-dark mb-4">
                Nuestros Principios de Privacidad
              </h2>
              <p className="text-neutral-medium text-lg">
                Tu confianza es nuestra prioridad
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {principles.map((principle, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-neutral-light to-white p-6 rounded-2xl shadow-lg text-center"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-4">
                    <principle.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-dark mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-neutral-medium">
                    {principle.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
            >
              <p className="text-neutral-medium text-lg leading-relaxed mb-6">
                En TuMesaHoy, nos tomamos muy en serio la privacidad de tus datos. Esta Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos tu información personal.
              </p>
              <p className="text-neutral-medium text-lg leading-relaxed mb-6">
                Esta política cumple con la Ley 25.326 de Protección de Datos Personales de Argentina y otras normativas aplicables.
              </p>
              <p className="text-neutral-medium text-lg leading-relaxed">
                Al usar TuMesaHoy, aceptas las prácticas descritas en esta política. Si no estás de acuerdo, por favor no uses nuestro servicio.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Sections */}
        <section className="py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-dark">
                    {section.title}
                  </h2>
                </div>
                <div className="space-y-6">
                  {section.content.map((item, idx) => (
                    <div key={idx}>
                      <h3 className="font-bold text-neutral-dark mb-2">
                        {item.subtitle}
                      </h3>
                      <p className="text-neutral-medium leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h2 className="text-3xl font-bold text-neutral-dark mb-6">
                En Resumen
              </h2>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <ul className="text-left space-y-3 text-neutral-medium">
                  <li className="flex items-start gap-3">
                    <span className="text-status-success text-xl">✓</span>
                    <span>Solo recopilamos datos necesarios para el servicio</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-status-success text-xl">✓</span>
                    <span>NUNCA vendemos tu información a terceros</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-status-success text-xl">✓</span>
                    <span>Encriptamos y protegemos todos tus datos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-status-success text-xl">✓</span>
                    <span>Puedes acceder, modificar o eliminar tu información cuando quieras</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-status-success text-xl">✓</span>
                    <span>Cumplimos con todas las leyes de privacidad de Argentina</span>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-neutral-dark mb-6">
                ¿Preguntas sobre Privacidad?
              </h2>
              <p className="text-neutral-medium text-lg mb-8">
                Estamos aquí para ayudarte a entender cómo protegemos tu información
              </p>
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
              >
                Contactar al Equipo de Privacidad
              </a>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
