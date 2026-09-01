"use client";

import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const MATERIAS = ["Matemáticas", "Español", "Ciencias", "Historia", "Geografía", "Inglés", "Física", "Química"];
const NIVELES = ["Primaria", "Secundaria", "Preparatoria"];
const GRADOS: Record<string, string[]> = {
  Primaria: ["1°", "2°", "3°", "4°", "5°", "6°"],
  Secundaria: ["1°", "2°", "3°"],
  Preparatoria: ["1°", "2°", "3°"],
};

export default function NuevoAlumnoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nombre: "",
    nivel: "Secundaria",
    grado: "1°",
    correoFamilia: "",
    passwordFamilia: "",
    tarifaHora: "",
    materias: [] as string[],
  });

  const toggleMateria = (materia: string) => {
    setForm((prev) => ({
      ...prev,
      materias: prev.materias.includes(materia)
        ? prev.materias.filter((m) => m !== materia)
        : [...prev.materias, materia],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Crear usuario en Firebase Auth para la familia
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.correoFamilia,
        form.passwordFamilia
      );

      // 2. Guardar datos del alumno en Firestore
      await addDoc(collection(db, "alumnos"), {
        nombre: form.nombre,
        nivel: form.nivel,
        grado: form.grado,
        correoFamilia: form.correoFamilia,
        uid: userCredential.user.uid,
        tarifaHora: Number(form.tarifaHora),
        materias: form.materias,
        activo: true,
        fechaInicio: new Date().toISOString(),
      });

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-xl font-medium text-gray-900">Nuevo alumno</h1>
        <p className="text-sm text-gray-400 mt-0.5">Llena los datos para dar de alta a un alumno y crear el acceso de su familia.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Datos del alumno</p>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nombre completo</label>
            <input
              type="text"
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Sofía Martínez"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Nivel</label>
              <select
                value={form.nivel}
                onChange={(e) => setForm({ ...form, nivel: e.target.value, grado: GRADOS[e.target.value][0] })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {NIVELES.map((n) => <option key={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Grado</label>
              <select
                value={form.grado}
                onChange={(e) => setForm({ ...form, grado: e.target.value })}
                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {GRADOS[form.nivel].map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-2 block">Materias contratadas</label>
            <div className="flex flex-wrap gap-2">
              {MATERIAS.map((materia) => (
                <button
                  type="button"
                  key={materia}
                  onClick={() => toggleMateria(materia)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.materias.includes(materia)
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {materia}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Tarifa por hora (MXN)</label>
            <input
              type="number"
              required
              value={form.tarifaHora}
              onChange={(e) => setForm({ ...form, tarifaHora: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="300"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Acceso de la familia</p>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Correo electrónico</label>
            <input
              type="email"
              required
              value={form.correoFamilia}
              onChange={(e) => setForm({ ...form, correoFamilia: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="mama@correo.com"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">Contraseña inicial</label>
            <input
              type="text"
              required
              value={form.passwordFamilia}
              onChange={(e) => setForm({ ...form, passwordFamilia: e.target.value })}
              className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="flex-1 py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || form.materias.length === 0}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Dar de alta"}
          </button>
        </div>
      </form>
    </div>
  );
}