import { useState, useEffect } from "react";
import { db } from "../firebase"; // seu config do Firebase
import { ref, onValue, push } from "firebase/database";

export default function PedirDeNovo({ userName }) {
  const [musicas, setMusicas] = useState([]);

  useEffect(() => {
    if (!userName) return;

    const musicasRef = ref(db, `alunos/${userName}/musicas`);
    onValue(musicasRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setMusicas(Object.entries(data)); // transforma em [ [id, musica], ... ]
      else setMusicas([]);
    });
  }, [userName]);

  const pedirDeNovo = (musica) => {
    const filaRef = ref(db, `fila`); // fila global
    push(filaRef, musica)
      .then(() => alert(`Música "${musica.titulo}" pedida de novo!`))
      .catch((err) => console.log(err));
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md text-white">
      <h3 className="text-lg font-bold mb-3">Pedir música de novo</h3>
      {musicas.length === 0 ? (
        <p>Nenhuma música pedida ainda.</p>
      ) : (
        <ul>
          {musicas.map(([id, musica]) => (
            <li key={id} className="flex justify-between items-center mb-2">
              <span>{musica.titulo}</span>
              <button
                onClick={() => pedirDeNovo(musica)}
                className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded"
              >
                Pedir de novo
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
