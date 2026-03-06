// src/types/enums.ts
// Sincronizado con el schema.prisma del backend

export enum EstatGeneral {
    ACTIU = 'ACTIU',
    INACTIU = 'INACTIU',
}

export enum EstatReserva {
    PENDENT = 'PENDENT',
    RESERVADA = 'RESERVADA',
    OCUPADA = 'OCUPADA',
    LLIURE = 'LLIURE',
    CANCELADA = 'CANCELADA',
    NO_SHOW = 'NO_SHOW',
}

export enum RolUsuari {
    ADMIN = 'ADMIN',
    CAMBRER = 'CAMBRER',
    RESPONSABLE = 'RESPONSABLE',
}
