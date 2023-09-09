import { useState, useEffect } from 'react';

export const useHighlightOnChange = ({ value, timeout = 5000}) => {
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    // Establecer highlight a true cuando el valor cambia
    setHighlight(true);

    // Crear un temporizador para establecer highlight a false después de 5 segundos
    const timer = setTimeout(() => {
      setHighlight(false);
    }, timeout);

    // Limpiar el temporizador si el valor cambia antes de que se complete el temporizador
    return () => {
      clearTimeout(timer);
    };
  }, [value]); // Esta dependencia asegura que el efecto se ejecute cada vez que "value" cambie

  return highlight;
}
