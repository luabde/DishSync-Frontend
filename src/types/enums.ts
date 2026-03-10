// src/types/enums.ts
// Sincronizado con el schema.prisma del backend

export const EstatGeneral = {
    ACTIU: 'ACTIU',
    INACTIU: 'INACTIU',
} as const;

export type EstatGeneral = typeof EstatGeneral[keyof typeof EstatGeneral];

export const EstatReserva = {
    PENDENT: 'PENDENT',
    RESERVADA: 'RESERVADA',
    OCUPADA: 'OCUPADA',
    LLIURE: 'LLIURE',
    CANCELADA: 'CANCELADA',
    NO_SHOW: 'NO_SHOW',
} as const;

export type EstatReserva = typeof EstatReserva[keyof typeof EstatReserva];

export const RolUsuari = {
    ADMIN: 'ADMIN',
    CAMBRER: 'CAMBRER',
    RESPONSABLE: 'RESPONSABLE',
} as const;

export type RolUsuari = typeof RolUsuari[keyof typeof RolUsuari];
