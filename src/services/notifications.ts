export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.png',
      badge: '/favicon.png',
      ...options,
    });
  }
};

export const notifyNearbyIncident = (incident: any, distance: number) => {
  showNotification(`🚨 Incidente cerca`, {
    body: `${incident.type} a ${distance.toFixed(1)}km - ${incident.location}`,
    tag: `incident-${incident.id}`,
  });
};

export const notifyRouteChange = (message: string) => {
  showNotification(`🛣️ Cambio en tu ruta`, {
    body: message,
    tag: 'route-change',
  });
};