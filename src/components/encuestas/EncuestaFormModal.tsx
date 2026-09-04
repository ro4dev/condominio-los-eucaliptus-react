import { useEffect, useState } from 'react';
import type { Encuesta } from '../../lib/types';
import { useData } from '../../store/DataContext';
import { Button, TextButton } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface Props {
  open: boolean;
  encuesta: Encuesta | null;
  onClose: () => void;
}

export function EncuestaFormModal({ open, encuesta, onClose }: Props) {
  const isEdit = !!encuesta;
  const { encuestas_votos, saveEncuesta } = useData();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaTermino, setFechaTermino] = useState('');
  const [quorum, setQuorum] = useState('');
  const [modoAlt, setModoAlt] = useState(false);
  const [alternativas, setAlternativas] = useState<string[]>(['', '']);

  const tieneVotos = isEdit
    ? (encuestas_votos || []).some((v) => v.encuesta_id === encuesta?.id)
    : false;

  useEffect(() => {
    if (!open) return;
    setTitulo(encuesta?.titulo ?? '');
    setDescripcion(encuesta?.descripcion ?? '');
    setFechaTermino(encuesta?.fecha_termino ?? '');
    setQuorum(encuesta?.quorum != null ? String(encuesta.quorum) : '');
    if (isEdit) {
      const ops = (encuesta?.alternativas && encuesta.alternativas.length && !(encuesta.alternativas.length === 1 && encuesta.alternativas[0] === ''))
        ? encuesta.alternativas : ['A favor', 'En contra'];
      setModoAlt(!(ops.length === 2 && ops[0] === 'A favor' && ops[1] === 'En contra'));
      setAlternativas(ops);
    } else {
      setModoAlt(false);
      setAlternativas(['', '']);
    }
  }, [open, encuesta, isEdit]);

  function setAlt(i: number, val: string) {
    setAlternativas((prev) => prev.map((x, idx) => (idx === i ? val : x)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!titulo || !descripcion) return;
    let finalAlt: string[];
    if (modoAlt) {
      finalAlt = alternativas.map((x) => x.trim()).filter((x) => x);
    } else {
      finalAlt = ['A favor', 'En contra'];
    }
    if (!finalAlt.length) finalAlt = ['A favor', 'En contra'];
    const payload: Partial<Encuesta> = {
      titulo,
      descripcion,
      alternativas: finalAlt,
      fecha_termino: fechaTermino || null,
      quorum: quorum ? parseInt(quorum, 10) || 0 : null,
    };
    if (isEdit && encuesta) payload.id = encuesta.id;
    const ok = await saveEncuesta(payload, isEdit);
    if (ok) onClose();
  }

  return (
    <Modal
      open={open}
      title={isEdit ? 'Editar Encuesta' : 'Agregar Encuesta'}
      onClose={onClose}
      footer={
        <>
          <TextButton onClick={onClose}>Cancelar</TextButton>
          <Button type="submit" form="encuestaForm">{isEdit ? 'Actualizar' : 'Crear'}</Button>
        </>
      }
    >
      <form id="encuestaForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="encTitulo">Título</label>
          <input
            id="encTitulo"
            className="field-input"
            name="titulo"
            placeholder="Ej: Título de la propuesta"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="encDesc">Descripción</label>
          <textarea
            id="encDesc"
            className="field-input"
            name="descripcion"
            rows={3}
            placeholder="Ej: Detalle de la propuesta..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="encFecha">Fecha de término</label>
            <input
              id="encFecha"
              className="field-input"
              type="date"
              name="fecha_termino"
              value={fechaTermino}
              onChange={(e) => setFechaTermino(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="encQuorum">Quorum (mín. votos)</label>
            <input
              id="encQuorum"
              className="field-input"
              type="number"
              name="quorum"
              min={0}
              placeholder="Ej: Sin límite"
              value={quorum}
              onChange={(e) => setQuorum(e.target.value)}
            />
          </div>
        </div>

        {isEdit ? (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem', background: 'var(--skeleton-1)', borderRadius: '0.5rem' }}>
            Opciones:
            <br />
            {alternativas.filter((x) => x).map((op) => (<span key={op}>- {String(op)}<br /></span>))}
            <span style={{ fontSize: '0.75rem' }}>(no editable al tener votos)</span>
          </div>
        ) : (
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <label htmlFor="encModoAlt" style={{ margin: 0 }}>Con alternativas</label>
              <input
                id="encModoAlt"
                type="checkbox"
                checked={modoAlt}
                onChange={(e) => setModoAlt(e.target.checked)}
              />
            </div>
            {modoAlt ? (
              <div style={{ marginTop: '0.5rem' }}>
                {alternativas.map((alt, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                    <input
                      className="field-input"
                      style={{ flex: 1 }}
                      placeholder={'Ej: Opción ' + (i + 1)}
                      value={alt}
                      onChange={(e) => setAlt(i, e.target.value)}
                    />
                    <button type="button" className="chip chip-neutral" onClick={() => setAlternativas((prev) => prev.filter((_, idx) => idx !== i))} style={{ cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="chip chip-primary"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setAlternativas((prev) => [...prev, ''])}
                >
                  + Alternativa
                </button>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Alternativas personalizadas</div>
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>Modo simple: "A favor" / "En contra"</div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}