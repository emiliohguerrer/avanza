"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface Alumno {
  id: string;
  nombre: string;
  grado: string;
  nivel: string;
  materias: string[];
  correoFamilia: string;
  tarifaHora: number;
  activo: boolean;
}

export default function AdminPage() {
  const [alumnos, setAlumnos] = useState<Alumno[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlumnos = async () => {
      const snapshot = await getDocs(collection(db, "alumnos"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Alumno[];
      setAlumnos(data);
      setLoading(false);
    };
    fetchAlumnos();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Alumnos</h1>
          <p className="text-sm text-gray-400 mt-0.5">{alumnos.length} alumnos activos</p>
        </div>
        <Link
          href="/admin/alumnos/nuevo"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          + Nuevo alumno
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : alumnos.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
          <p className="text-gray-400 text-sm">No hay alumnos registrados todavía.</p>
          <Link
            href="/admin/alumnos/nuevo"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Dar de alta primer alumno
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {alumnos.map((alumno) => (
            <Link
              key={alumno.id}
              href={`/admin/alumnos/${alumno.id}`}
              className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:border-emerald-200 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{alumno.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {alumno.nivel} · {alumno.grado} · {alumno.materias?.join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">${alumno.tarifaHora}/hr</p>
                <p className="text-xs text-gray-400 mt-0.5">{alumno.correoFamilia}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}