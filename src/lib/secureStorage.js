// SECURITY: Helper para manejar localStorage con expiración
// Esto previene que datos sensibles persistan indefinidamente

/**
 * Guarda un valor en localStorage con timestamp de expiración
 * @param {string} key - La clave del item
 * @param {any} value - El valor a guardar
 * @param {number} expirationMinutes - Minutos hasta expiración (default: 60)
 */
export function setItemWithExpiration(key, value, expirationMinutes = 60) {
  const now = new Date();
  const item = {
    value: value,
    expiry: now.getTime() + (expirationMinutes * 60 * 1000),
  };
  localStorage.setItem(key, JSON.stringify(item));
}

/**
 * Obtiene un valor de localStorage verificando si expiró
 * @param {string} key - La clave del item
 * @returns {any|null} - El valor si no expiró, null si expiró o no existe
 */
export function getItemWithExpiration(key) {
  const itemStr = localStorage.getItem(key);

  // Si no existe el item, retornar null
  if (!itemStr) {
    return null;
  }

  try {
    const item = JSON.parse(itemStr);
    const now = new Date();

    // Comparar tiempo de expiración
    if (now.getTime() > item.expiry) {
      // Si expiró, eliminarlo y retornar null
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (e) {
    // Si hay error parseando, eliminar el item corrupto
    localStorage.removeItem(key);
    return null;
  }
}

/**
 * Elimina un item de localStorage
 * @param {string} key - La clave del item a eliminar
 */
export function removeItem(key) {
  localStorage.removeItem(key);
}

/**
 * Limpia todos los items expirados de localStorage
 */
export function cleanExpiredItems() {
  const now = new Date();
  const keysToRemove = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const itemStr = localStorage.getItem(key);

    try {
      const item = JSON.parse(itemStr);
      if (item.expiry && now.getTime() > item.expiry) {
        keysToRemove.push(key);
      }
    } catch (e) {
      // Ignorar items que no son JSON
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}
