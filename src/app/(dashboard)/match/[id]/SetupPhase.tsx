/**
 * SetupPhase — Drag-and-drop ship placement orchestrator.
 *
 * Integrates:
 *  • `@dnd-kit/core` for drag interactions (Mouse + Touch sensors).
 *  • `useSetupStore` for placement logic & validation.
 *  • Visual components: SetupGrid, DroppableCell, DraggableShip, ShipUnit.
 *  • Global 'R' key listener for rotating the active / selected ship.
 *  • DragOverlay for a semi-transparent ship preview attached to the cursor.
 */
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { Match, SetupShipPayload } from '@/types/api-responses';
import { CELL_SIZE, FLEET_CONFIG, GRID_SIZE } from '@/lib/game-rules';
import {
  useSetupStore,
  type DockShip,
  type PlacedShip,
} from '@/stores/useSetupStore';
import { useSetupMatchMutation } from '@/hooks/queries/useMatchMutations';

import { SetupGrid } from '@/components/game/setup/SetupGrid';
import { DroppableCell } from '@/components/game/setup/DroppableCell';
import { DraggableShip } from '@/components/game/setup/DraggableShip';
import { ShipUnit } from '@/components/game/setup/ShipUnit';
import { Button } from '@/components/ui/Button';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Parse a droppable id like `cell-3-7` → { x: 3, y: 7 }. */
function parseCellId(id: string): { x: number; y: number } | null {
  const m = /^cell-(\d+)-(\d+)$/.exec(id);
  if (!m) return null;
  return { x: Number(m[1]), y: Number(m[2]) };
}

/** Find a ship (dock or board) by id. */
function findShip(
  id: string,
  available: DockShip[],
  placed: PlacedShip[],
): DockShip | PlacedShip | undefined {
  return available.find((s) => s.id === id) ?? placed.find((s) => s.id === id);
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SetupPhaseProps {
  match: Match;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SetupPhase({ match }: SetupPhaseProps) {
  const router = useRouter();

  // ── Store ────────────────────────────────────────────────────────────────
  const availableShips = useSetupStore((s) => s.availableShips);
  const placedShips    = useSetupStore((s) => s.placedShips);
  const placeShip      = useSetupStore((s) => s.placeShip);
  const rotateShip     = useSetupStore((s) => s.rotateShip);
  const removeShip     = useSetupStore((s) => s.removeShip);
  const resetFleet     = useSetupStore((s) => s.resetFleet);
  const allShipsPlaced = useSetupStore((s) => s.allShipsPlaced);

  // ── Mutation ─────────────────────────────────────────────────────────────
  const setupMatch = useSetupMatchMutation();

  // ── Local UI state ───────────────────────────────────────────────────────
  /** Id of the ship currently being dragged. */
  const [activeId, setActiveId] = useState<string | null>(null);
  /** Id of the currently "selected" ship (for click-to-place & rotation). */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  /** The ship object corresponding to `activeId`. */
  const activeShip = activeId
    ? findShip(activeId, availableShips, placedShips)
    : undefined;

  // ── Sensors ──────────────────────────────────────────────────────────────
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 150, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // ── Clean-up on unmount ──────────────────────────────────────────────────
  useEffect(() => {
    return () => resetFleet();
  }, [resetFleet]);

  // ── Keyboard: 'R' to rotate ─────────────────────────────────────────────
  // We track the "target" ship for rotation: activeId (while dragging) takes
  // priority, otherwise we fall back to selectedId.
  const rotationTarget = activeId ?? selectedId;
  const rotationTargetRef = useRef(rotationTarget);
  rotationTargetRef.current = rotationTarget;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        const id = rotationTargetRef.current;
        if (id) rotateShip(id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [rotateShip]);

  // ── Validity highlights for the grid ─────────────────────────────────────
  // Build a Map<"x,y", { isOver, isValid }> that SetupGrid can consume to
  // colour cells while dragging.  We compute validity for every cell so the
  // grid can show green / red under the full ship silhouette.
  // (For now we pass `null` highlights — real-time preview would require
  //  tracking the pointer position via DragMove which adds complexity.
  //  DragOverlay already gives good visual feedback.)

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return; // dropped outside any cell

      const coords = parseCellId(String(over.id));
      if (!coords) return;

      const shipId = String(active.id);
      const ok = placeShip(shipId, coords.x, coords.y);

      if (!ok) {
        // Invalid drop — the store rejected it. The ship snaps back because
        // the DragOverlay disappears and the origin copy becomes visible again.
        console.warn(`Placement rejected for ${shipId} at (${coords.x}, ${coords.y})`);
      }
    },
    [placeShip],
  );

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // ── Click-to-place (fallback for non-drag interaction) ───────────────────
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!selectedId) return;
      const ok = placeShip(selectedId, x, y);
      if (ok) setSelectedId(null);
    },
    [selectedId, placeShip],
  );

  // ── Error toast state ────────────────────────────────────────────────────
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-dismiss error toast after 4 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const t = setTimeout(() => setErrorMsg(null), 4000);
    return () => clearTimeout(t);
  }, [errorMsg]);

  // ── Confirm / submit fleet ───────────────────────────────────────────────
  /**
   * Maps `PlacedShip[]` → `SetupShipPayload[]` and sends to the backend.
   *
   * DTO mapping:
   *   name        → ShipType enum value (e.g. "Porta-Aviões")
   *   size        → number of cells
   *   startX      → column (ship.x)
   *   startY      → row    (ship.y)
   *   orientation → ShipOrientation string ("Horizontal" | "Vertical")
   */
  const handleConfirm = async () => {
    if (!allShipsPlaced()) return;

    setErrorMsg(null);

    try {
      const payload: SetupShipPayload[] = placedShips.map((ship) => ({
        name: ship.type,          // ShipType enum value — matches backend string
        size: ship.size,
        startX: ship.x,
        startY: ship.y,
        orientation: ship.orientation, // ShipOrientation enum — "Horizontal" | "Vertical"
      }));

      await setupMatch.mutateAsync(payload);
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao enviar frota.';
      setErrorMsg(msg);
      console.error('Erro na sequência de confirmação:', error);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const isPlayerReady = match.player1.isReady || match.player2?.isReady;
  const isDeploying   = setupMatch.isPending;
  const canConfirm    = allShipsPlaced() && !isPlayerReady && !isDeploying;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 p-8">
        <div className="max-w-7xl mx-auto">
          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Posicione Sua Frota
            </h1>
            <p className="text-gray-300">
              Arraste os navios para o tabuleiro ou clique para posicionar.
              Pressione <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-xs font-mono">R</kbd> para girar.
            </p>
            {match.player2 && (
              <div className="mt-4 p-2 bg-black/30 inline-block rounded-lg border border-white/10">
                <span className="text-yellow-400 font-mono">ADVERSÁRIO:</span>
                <span className="text-white ml-2">{match.player2.username}</span>
                {match.player2.isReady && (
                  <span className="text-green-400 ml-2">✓ PRONTO</span>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ── Dock (left sidebar) ───────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="rounded-xl border border-naval-border bg-naval-surface/80 p-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-naval-text-secondary mb-4">
                  Porto de Guerra
                </h2>

                {availableShips.length === 0 && (
                  <p className="text-xs text-naval-text-muted italic mb-4">
                    Todos os navios foram posicionados.
                  </p>
                )}

                <div className="flex flex-col gap-4 mb-6">
                  {availableShips.map((ship) => {
                    const config = FLEET_CONFIG[ship.type];
                    const isSelected = ship.id === selectedId;

                    return (
                      <div
                        key={ship.id}
                        onClick={() =>
                          setSelectedId((prev) =>
                            prev === ship.id ? null : ship.id,
                          )
                        }
                        className={
                          'flex flex-col items-start gap-1 rounded-lg p-3 transition-colors cursor-pointer ' +
                          (isSelected
                            ? 'ring-2 ring-naval-action bg-naval-action/10'
                            : 'bg-naval-bg/40 hover:bg-naval-action/10')
                        }
                      >
                        <span className="text-xs font-semibold text-naval-text-primary">
                          {config.label}
                          <span className="ml-1.5 text-naval-text-muted font-normal">
                            ({config.size} casas)
                          </span>
                        </span>

                        <DraggableShip
                          shipId={ship.id}
                          type={ship.type}
                          size={ship.size}
                          orientation={ship.orientation}
                          disabled={!!isPlayerReady || isDeploying || setupMatch.isSuccess}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* ── Controls ───────────────────────────────────────── */}
                <div className="pt-4 border-t border-naval-border space-y-3">
                  {/* Rotate */}
                  <Button
                    onClick={() => { if (selectedId) rotateShip(selectedId); }}
                    variant="outline"
                    className="w-full"
                    disabled={!selectedId || isDeploying}
                  >
                    🔄 Girar Navio
                  </Button>

                  {/* Confirm / Deploy */}
                  <Button
                    onClick={handleConfirm}
                    variant="default"
                    className="w-full"
                    disabled={!canConfirm}
                    isLoading={isDeploying}
                  >
                    {isDeploying ? 'Enviando Frota...' : '✓ Zarpar Frota'}
                  </Button>

                  {/* Reset */}
                  <Button
                    onClick={resetFleet}
                    variant="outline"
                    className="w-full text-red-500 hover:bg-red-50/10"
                    disabled={!!isPlayerReady || isDeploying}
                  >
                    Reiniciar Tabuleiro
                  </Button>
                </div>

                {/* Error toast */}
                {errorMsg && (
                  <div className="mt-4 p-3 bg-red-900/40 border border-red-500/50 rounded-lg animate-in fade-in">
                    <p className="text-red-300 text-sm text-center">
                      ⚠ {errorMsg}
                    </p>
                  </div>
                )}

                {/* Success / waiting state */}
                {(isPlayerReady || setupMatch.isSuccess) && (
                  <div className="mt-6 p-4 bg-green-900/30 border border-green-600/40 rounded-lg space-y-3">
                    <p className="text-green-400 text-center font-bold animate-pulse">
                      ⚓ AGUARDANDO COMANDANTE ADVERSÁRIO...
                    </p>
                    <p className="text-xs text-gray-400 text-center">
                      Compartilhe o ID da partida com seu oponente:
                    </p>
                    <div className="flex items-center gap-2 justify-center">
                      <code className="text-xs bg-black/40 text-cyan-300 px-3 py-1.5 rounded font-mono select-all break-all">
                        {match.id}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(match.id);
                        }}
                        className="text-xs bg-cyan-700/30 hover:bg-cyan-700/50 text-cyan-300 px-2 py-1.5 rounded transition-colors"
                        title="Copiar ID"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Board ──────────────────────────────────────────────── */}
            <div className="lg:col-span-2 flex items-center justify-center bg-blue-950/40 rounded-3xl p-6 border border-white/5 shadow-inner">
              <SetupGrid onCellClick={handleCellClick}>
                {/* Droppable layer — invisible but receives drops */}
                {Array.from({ length: GRID_SIZE }, (_, y) =>
                  Array.from({ length: GRID_SIZE }, (_, x) => (
                    <div
                      key={`drop-${x}-${y}`}
                      className="absolute"
                      style={{
                        left: x * CELL_SIZE,
                        top:  y * CELL_SIZE,
                        width:  CELL_SIZE,
                        height: CELL_SIZE,
                      }}
                    >
                      <DroppableCell x={x} y={y} onClick={handleCellClick} />
                    </div>
                  )),
                )}

                {/* Placed ships — draggable on the board */}
                {placedShips.map((ship) => (
                  <div
                    key={ship.id}
                    className="absolute z-10 pointer-events-auto"
                    style={{
                      left: ship.x * CELL_SIZE,
                      top:  ship.y * CELL_SIZE,
                    }}
                  >
                    <DraggableShip
                      shipId={ship.id}
                      type={ship.type}
                      size={ship.size}
                      orientation={ship.orientation}
                      disabled={!!isPlayerReady || isDeploying || setupMatch.isSuccess}
                    />
                  </div>
                ))}
              </SetupGrid>
            </div>
          </div>

          {/* ── Back to lobby ─────────────────────────────────────────── */}
          <div className="mt-12 text-center">
            <Button
              onClick={() => router.push('/lobby')}
              variant="ghost"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← Retornar ao Menu Principal
            </Button>
          </div>
        </div>
      </div>

      {/* ── Drag Overlay (cursor-attached ghost) ──────────────────────── */}
      <DragOverlay dropAnimation={null}>
        {activeShip ? (
          <ShipUnit
            type={activeShip.type}
            size={activeShip.size}
            orientation={activeShip.orientation}
            ghost
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
